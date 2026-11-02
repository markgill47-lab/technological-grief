#!/usr/bin/env python
"""Drive ComfyUI's HTTP API to generate Krea 2 images from a style reference + prompt.

Single job:
    python tools/comfy/krea2.py --ref style/ref.png --prompt "..." --name loss_door_a

Batch (dozens):
    python tools/comfy/krea2.py --jobs jobs.json --out out/batch01

jobs.json is a list of objects; every key is optional except id and prompt:
    [{"id": "loss_door_a", "prompt": "...", "ref": "style/ref.png", "seed": 12345}]

Each finished image lands at <out>/<id>.png next to <out>/<id>.json, which records
the exact graph values used, so any single image can be re-rolled identically.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import random
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / "krea2_style_ref.api.json"

# Node ids in krea2_style_ref.api.json
N_UNET, N_CLIP, N_VAE, N_LORA = "1", "2", "3", "4"
N_REF1, N_ENCODE, N_SHIFT, N_CFG = "5", "8", "11", "12"
N_SAMPLER, N_SCHED, N_NOISE, N_LATENT, N_SAVE = "13", "14", "15", "16", "19"
REF_NODES = {1: N_REF1, 2: "6", 3: "7"}


class Comfy:
    def __init__(self, server, timeout=30.0):
        self.server = server.rstrip("/")
        self.timeout = timeout
        self.client_id = str(uuid.uuid4())
        self._uploaded = {}

    def _get(self, path):
        with urllib.request.urlopen(f"{self.server}{path}", timeout=self.timeout) as r:
            return r.read()

    def _post_json(self, path, payload):
        body = json.dumps(payload).encode()
        req = urllib.request.Request(
            f"{self.server}{path}", data=body, headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                return json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")
            raise SystemExit(f"Comfy rejected the job ({e.code}):\n{detail}") from None

    def upload_image(self, path, subfolder="krea2_refs"):
        """Upload a reference image once per run; returns the server-side name."""
        key = str(path.resolve())
        if key in self._uploaded:
            return self._uploaded[key]
        if not path.is_file():
            raise SystemExit(f"reference image not found: {path}")
        data = path.read_bytes()
        ctype = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        boundary = "----comfy" + uuid.uuid4().hex
        parts = []

        def field(name, value):
            head = f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n'
            parts.append((head + value + "\r\n").encode())

        field("type", "input")
        field("subfolder", subfolder)
        field("overwrite", "true")
        head = (
            f'--{boundary}\r\nContent-Disposition: form-data; name="image"; '
            f'filename="{path.name}"\r\nContent-Type: {ctype}\r\n\r\n'
        )
        parts.append(head.encode())
        parts.append(data + b"\r\n")
        parts.append(f"--{boundary}--\r\n".encode())
        req = urllib.request.Request(
            f"{self.server}/upload/image",
            data=b"".join(parts),
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        )
        with urllib.request.urlopen(req, timeout=max(self.timeout, 120)) as r:
            info = json.loads(r.read())
        name = info["name"]
        if info.get("subfolder"):
            name = info["subfolder"] + "/" + name
        self._uploaded[key] = name
        return name

    def queue(self, graph):
        res = self._post_json("/prompt", {"prompt": graph, "client_id": self.client_id})
        if "prompt_id" not in res:
            raise SystemExit(f"no prompt_id in response: {res}")
        return res["prompt_id"]

    def wait(self, prompt_id, poll=1.5, limit=1800.0):
        deadline = time.time() + limit
        while time.time() < deadline:
            hist = json.loads(self._get(f"/history/{prompt_id}") or b"{}")
            entry = hist.get(prompt_id)
            if entry:
                status = entry.get("status", {})
                if status.get("status_str") == "error":
                    msgs = json.dumps(status.get("messages", []))[:2000]
                    raise SystemExit(f"job {prompt_id} failed:\n{msgs}")
                return entry
            time.sleep(poll)
        raise SystemExit(f"job {prompt_id} did not finish within {limit:.0f}s")

    def images(self, entry):
        out = []
        for node_out in entry.get("outputs", {}).values():
            out.extend(node_out.get("images", []))
        return [i for i in out if i.get("type") == "output"]

    def download(self, image):
        q = urllib.parse.urlencode(
            {
                "filename": image["filename"],
                "subfolder": image.get("subfolder", ""),
                "type": image.get("type", "output"),
            }
        )
        return self._get(f"/view?{q}")


def build_graph(template, job, comfy):
    graph = json.loads(json.dumps(template))  # deep copy per job
    width, height = int(job["width"]), int(job["height"])

    graph[N_UNET]["inputs"]["unet_name"] = job["model"]
    graph[N_CLIP]["inputs"]["clip_name"] = job["clip"]
    graph[N_VAE]["inputs"]["vae_name"] = job["vae"]
    graph[N_ENCODE]["inputs"]["prompt"] = job["prompt"]
    graph[N_CFG]["inputs"]["cfg"] = float(job["cfg"])
    graph[N_SCHED]["inputs"]["steps"] = int(job["steps"])
    graph[N_SCHED]["inputs"]["scheduler"] = job["scheduler"]
    graph[N_SAMPLER]["inputs"]["sampler_name"] = job["sampler"]
    graph[N_NOISE]["inputs"]["noise_seed"] = int(job["seed"])
    graph[N_SHIFT]["inputs"].update(width=width, height=height)
    graph[N_LATENT]["inputs"].update(width=width, height=height)
    graph[N_SAVE]["inputs"]["filename_prefix"] = f"{job['prefix']}/{job['id']}"

    # Style LoRA: "none" removes the node and feeds the raw model to the shift node.
    if job["lora"] in (None, "", "none"):
        graph[N_SHIFT]["inputs"]["model"] = [N_UNET, 0]
        graph.pop(N_LORA, None)
    else:
        graph[N_LORA]["inputs"]["lora_name"] = job["lora"]
        graph[N_LORA]["inputs"]["strength_model"] = float(job["lora_strength"])

    # Reference images: 0-3. None means plain text-to-image (useful as a control).
    refs = [r for r in job.get("refs", []) if r]
    graph[N_ENCODE]["inputs"].pop("image1", None)
    for node_id in REF_NODES.values():
        graph.pop(node_id, None)
    for idx, ref in enumerate(refs[:3], start=1):
        node_id = REF_NODES[idx]
        graph[node_id] = {
            "class_type": "LoadImage",
            "_meta": {"title": f"Style reference {idx}"},
            "inputs": {"image": comfy.upload_image(Path(ref))},
        }
        graph[N_ENCODE]["inputs"][f"image{idx}"] = [node_id, 0]
    return graph


def run_job(comfy, template, job, out_dir, dry):
    graph = build_graph(template, job, comfy)
    if dry:
        print(
            f"[dry] {job['id']}  seed={job['seed']}  {job['width']}x{job['height']}"
            f"  refs={len([r for r in job.get('refs', []) if r])}  lora={job['lora']}"
        )
        return
    started = time.time()
    prompt_id = comfy.queue(graph)
    print(f"[queued] {job['id']}  {prompt_id}", flush=True)
    entry = comfy.wait(prompt_id)
    images = comfy.images(entry)
    if not images:
        raise SystemExit(f"job {job['id']} produced no output images")
    out_dir.mkdir(parents=True, exist_ok=True)
    for n, image in enumerate(images):
        stem = job["id"] if n == 0 else f"{job['id']}_{n + 1}"
        dest = out_dir / (stem + Path(image["filename"]).suffix)
        dest.write_bytes(comfy.download(image))
        meta = dict(job)
        meta["prompt_id"] = prompt_id
        meta["comfy_file"] = image
        (out_dir / (stem + ".json")).write_text(json.dumps(meta, indent=2), encoding="utf-8")
        print(f"[saved]  {dest}  ({time.time() - started:.1f}s)")


def main():
    p = argparse.ArgumentParser(description="Generate Krea 2 images via the ComfyUI API.")
    p.add_argument("--server", default="http://127.0.0.1:8188")
    p.add_argument("--prompt", help="prompt for a single job")
    p.add_argument("--name", default="krea2", help="output basename for a single job")
    p.add_argument("--jobs", help="JSON file: list of job objects")
    p.add_argument("--ref", action="append", default=[], help="style reference image (repeat, max 3)")
    p.add_argument("--out", default="out/krea2", help="local directory for finished images")
    p.add_argument("--prefix", default="grief", help="Comfy output subfolder")
    p.add_argument("--width", type=int, default=896)
    p.add_argument("--height", type=int, default=1120, help="default 896x1120 = 4:5 at ~1MP")
    p.add_argument("--steps", type=int, default=8)
    p.add_argument("--cfg", type=float, default=1.0)
    p.add_argument("--sampler", default="euler")
    p.add_argument("--scheduler", default="simple")
    p.add_argument("--seed", type=int, help="fixed seed; omitted means random per job")
    p.add_argument("--model", default="krea2_turbo_int8_convrot.safetensors")
    p.add_argument("--clip", default="qwen3vl_4b_fp8_scaled.safetensors")
    p.add_argument("--vae", default="qwen_image_vae.safetensors")
    p.add_argument("--lora", default="krea2_style_reference.safetensors", help="style LoRA, or 'none'")
    p.add_argument("--lora-strength", type=float, default=1.0)
    p.add_argument("--dry-run", action="store_true", help="build graphs, queue nothing")
    args = p.parse_args()

    if not args.jobs and not args.prompt:
        p.error("give --prompt or --jobs")

    template = json.loads(TEMPLATE.read_text(encoding="utf-8"))
    comfy = Comfy(args.server)
    defaults = dict(
        width=args.width,
        height=args.height,
        steps=args.steps,
        cfg=args.cfg,
        sampler=args.sampler,
        scheduler=args.scheduler,
        model=args.model,
        clip=args.clip,
        vae=args.vae,
        lora=args.lora,
        lora_strength=args.lora_strength,
        prefix=args.prefix,
        refs=list(args.ref),
    )

    if args.jobs:
        raw = json.loads(Path(args.jobs).read_text(encoding="utf-8"))
        jobs = []
        for item in raw:
            job = dict(defaults)
            job.update(item)
            if "ref" in item:
                job["refs"] = [item["ref"]]
            job.setdefault("seed", args.seed)
            jobs.append(job)
    else:
        jobs = [dict(defaults, id=args.name, prompt=args.prompt, seed=args.seed)]

    for job in jobs:
        if job.get("seed") is None:
            job["seed"] = random.randint(0, 2**53)

    out_dir = Path(args.out)
    for n, job in enumerate(jobs, start=1):
        print(f"--- {n}/{len(jobs)} {job['id']}", flush=True)
        run_job(comfy, template, job, out_dir, args.dry_run)
    return 0


if __name__ == "__main__":
    sys.exit(main())

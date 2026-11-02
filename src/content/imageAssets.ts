import { DOMAIN_IMAGE_BRIEFS } from './imageBriefs';
import type { Domain, Stage } from '../domain/types';

/**
 * The generated images, one per door, keyed by the same slug the generator
 * wrote them under.
 *
 * Vite resolves the glob at build time, so a missing file is a null here
 * rather than a broken request at runtime, and `imageAssets.test.ts` turns
 * that null into a failing test.
 */
const files = import.meta.glob('../images/stages/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const BY_SLUG: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.slice(path.lastIndexOf('/') + 1);
  BY_SLUG[name.replace(/\.webp$/, '')] = url;
}

/**
 * Which image belongs to a door. This mirrors `briefFor`: the domain-specific
 * image is used only on the "why" door and only where a domain brief was
 * authored, so the two always resolve to the same frame.
 */
export function imageSlug(
  stage: Stage,
  door: 'why' | 'forward',
  domain: Domain | null,
): string {
  if (door === 'why' && domain && DOMAIN_IMAGE_BRIEFS[stage]?.[domain]) {
    return `${stage}_${domain}`;
  }
  return `${stage}_${door}`;
}

/** The URL for a door's image, or null if it has not been generated yet. */
export function imageFor(
  stage: Stage,
  door: 'why' | 'forward',
  domain: Domain | null,
): string | null {
  return BY_SLUG[imageSlug(stage, door, domain)] ?? null;
}

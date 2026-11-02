import { assemble, TRIAD_SEPARATOR } from '../content/assemble';
import { STAGES } from '../domain/stages';
import { DOMAINS, ROGERS, THREATS } from '../domain/taxonomies';
import { gapSentence } from '../domain/gap';
import type { Diagnosis } from '../domain/types';

/**
 * One page, generated entirely in the browser with no network request.
 *
 * This replaces v1's closing suggestion that the user "might want to note it
 * somewhere" - asking someone to hand-transcribe a result the tool just
 * produced is a poor ending, and it is solvable without weakening the privacy
 * stance at all.
 */
export function diagnosisToMarkdown(d: Diagnosis, rationale: string | null): string {
  const stage = STAGES[d.stage];
  const page = assemble(d.stage, d);
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];

  lines.push(`# ${stage.name}, stage ${stage.position} of 6`);
  lines.push('');

  if (d.transitionToward) {
    lines.push(
      `You look like you are in **${stage.name}**, with some signs of ` +
        `**${STAGES[d.transitionToward].name}**, which often means you are in ` +
        `transition between them.`,
    );
  } else {
    lines.push(`You are in the **${stage.name}** stage.`);
  }
  lines.push('');

  if (d.signalConflict) {
    lines.push(
      '> Worth noting: what you are doing and what you are feeling point in ' +
        'different directions. Feelings often lag actions by a while. This ' +
        'reading follows the actions.',
    );
    lines.push('');
  }

  if (rationale) {
    lines.push(rationale);
    lines.push('');
  }

  lines.push(gapSentence(d.gap, d.domain));
  lines.push('');

  lines.push('## Your reading');
  lines.push('');
  lines.push(`| | |`);
  lines.push(`|---|---|`);
  lines.push(`| Stage | ${stage.name} (${stage.position} of 6) |`);
  lines.push(`| Confidence | ${d.stageConfidence} |`);
  if (d.transitionToward) {
    lines.push(`| Moving toward | ${STAGES[d.transitionToward].name} |`);
  }
  lines.push(`| Your work | ${DOMAINS[d.domain].name} |`);
  lines.push(
    `| What's at stake | ${d.threats.map((t) => THREATS[t].name).join(', ')} |`,
  );
  lines.push(`| Your pace | ${ROGERS[d.rogers].name} |`);
  lines.push(`| Grief gap | ${d.gap > 0 ? '+' : ''}${d.gap} stages |`);
  lines.push('');

  for (const section of page.sections) {
    if (section.kind === 'experience') {
      const [emotion, cognition, behavior] = section.body.split(TRIAD_SEPARATOR);
      lines.push(`## ${section.heading}`);
      lines.push('');
      lines.push(`- **Feelings:** ${emotion}`);
      lines.push(`- **Thoughts:** ${cognition}`);
      lines.push(`- **Behaviour:** ${behavior}`);
      lines.push('');
      continue;
    }

    if (section.heading) {
      lines.push(`## ${section.heading}`);
      lines.push('');
    }
    lines.push(section.body);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(
    `Generated ${today} in your browser. Nothing was stored and nothing was sent anywhere.`,
  );
  lines.push('');
  lines.push(
    'A reflection tool built on the Change Grief Cycle, not a clinical or ' +
      'psychological assessment.',
  );

  return lines.join('\n');
}

export function downloadMarkdown(d: Diagnosis, rationale: string | null): void {
  const text = diagnosisToMarkdown(d, rationale);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `change-cycle-${d.stage}-${today}.md`;

  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

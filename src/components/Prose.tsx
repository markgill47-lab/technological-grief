import { Fragment, type ReactNode } from 'react';

/**
 * Minimal inline formatter for content-block bodies.
 *
 * The content library uses exactly two inline forms, **strong** and
 * *emphasis*, so this is a tokenizer rather than a markdown parser - no
 * dependency, and no `dangerouslySetInnerHTML` anywhere near authored text
 * or anything a model returned.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

export function inlineNodes(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function Prose({ body, className }: { body: string; className?: string }) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i}>{inlineNodes(p)}</p>
      ))}
    </div>
  );
}

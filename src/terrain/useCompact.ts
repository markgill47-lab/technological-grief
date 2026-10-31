import { useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)';

/**
 * True on phone-width screens.
 *
 * The terrain scales its whole coordinate space down to the viewport, so at
 * 375px a 15-unit label renders at about 6px. Six stage names cannot be made
 * legible at that width, so the compact layout shows numbers and names only
 * the current stage - with the full table one tap away behind Text view.
 */
export function useCompact(): boolean {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener('change', onChange);
    onChange();
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return compact;
}

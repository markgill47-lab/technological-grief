import { useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)';

/**
 * True on phone-width screens.
 *
 * The dial scales its whole coordinate space down to the viewport, so at 375px
 * a 19-unit label renders at about 11px. Six stage names will not fit around a
 * ring at that width, so the compact layout drops the outer labels and keeps
 * the numbers on the bands and the name in the hole - with the full table one
 * tap away behind Text view.
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

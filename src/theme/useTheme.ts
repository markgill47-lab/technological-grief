import { useCallback, useEffect, useState } from 'react';
import type { Theme } from './palette';

const KEY = 'grief.theme';

/**
 * Light by default, dark when the system asks, and whatever the reader last
 * chose once they have chosen.
 *
 * This is the only thing the app keeps across tabs: one word, in
 * localStorage, under a key that holds nothing else. It is a display
 * preference rather than session content — no answer, stage or gap goes near
 * it, and the session itself still dies with the tab (store.ts, sessionStorage).
 * Said plainly so that the privacy copy stays true: "nothing you enter" is
 * stored, and a theme is not something you enter.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => stored() ?? systemTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Follow the system for as long as the reader has not made a choice.
  useEffect(() => {
    if (stored()) return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = () => {
      if (!stored()) setTheme(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // Private mode, or storage is blocked. The choice holds for this page.
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

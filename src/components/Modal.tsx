import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  /** id of the element naming the dialog. */
  labelledBy: string;
  /** Extra class on the dialog box. */
  variant?: 'detail' | 'survey';
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A modal dialog, portalled to the body so it stacks above everything and so
 * the app root can be marked `inert` behind it.
 *
 * Does the four things a dialog has to do and that are easy to half-do:
 * moves focus in, keeps Tab inside, closes on Escape, and puts focus back
 * where it came from. Without the last one, dismissing a dialog drops
 * keyboard users at the top of the document.
 */
export function Modal({ open, onClose, labelledBy, variant = 'detail', children }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = boxRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === boxRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    returnTo.current = document.activeElement as HTMLElement | null;
    const scrollLock = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // The box itself, not the first control: landing on "Close" reads the
    // dismissal before the content.
    boxRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = scrollLock;
      returnTo.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={boxRef}
        className={`modal modal--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path
          d="M2 2 L14 14 M14 2 L2 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

import { useStore } from '../store';
import { DiagnosisResult } from './DiagnosisResult';
import { Modal, ModalClose } from './Modal';
import { QuickSurvey } from './QuickSurvey';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TITLE_ID = 'survey-title';

/**
 * The whole Locate flow, in an overlay.
 *
 * It is a single task with a beginning and an end, which is what a modal is
 * for; in the page it competed with the stage you were reading. The dial
 * stays visible behind it, so the result lands on something the reader has
 * already been looking at.
 *
 * `open` is driven by the store's mode rather than by local state, so
 * `#/locate` still opens it and `Start fresh` still closes it.
 */
export function SurveyModal({ open, onClose }: Props) {
  const status = useStore((s) => s.status);
  const diagnosis = useStore((s) => s.diagnosis);
  const rationale = useStore((s) => s.rationale);
  const startQuick = useStore((s) => s.startQuick);

  return (
    <Modal open={open} onClose={onClose} labelledBy={TITLE_ID} variant="survey">
      <header className="modal__head">
        <p className="modal__eyebrow">Six questions · about two minutes</p>
        <h2 id={TITLE_ID} className="modal__title">
          {status === 'done' && diagnosis ? 'Where you are' : 'Where are you in the change cycle?'}
        </h2>
        <ModalClose onClose={onClose} />
      </header>

      <div className="modal__body modal__body--single">
        {status === 'done' && diagnosis ? (
          <DiagnosisResult diagnosis={diagnosis} rationale={rationale} />
        ) : status === 'revealing' ? (
          <div className="thinking">
            <p>Placing you on the dial…</p>
          </div>
        ) : status === 'asking' ? (
          <QuickSurvey />
        ) : (
          <div className="welcome">
            <p className="welcome__sub">
              Six questions about what you have actually done and how it has felt.
              Nothing you answer leaves your browser.
            </p>
            <p className="welcome__disclaimer">This is a reflection tool, not a judgment.</p>
            <button
              type="button"
              className="button button--primary welcome__begin"
              onClick={startQuick}
            >
              Find your station
            </button>
            <p className="welcome__privacy">
              Everything happens in your browser. Nothing you enter is sent anywhere,
              stored, or seen by anyone, including us. Close the tab and it is gone.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

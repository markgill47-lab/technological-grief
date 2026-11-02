import type { AssembledSection } from '../content/assemble';
import type { ImageBrief } from '../content/imageBriefs';
import { STAGES } from '../domain/stages';
import type { Stage } from '../domain/types';
import { Modal, ModalClose } from './Modal';
import { Prose } from './Prose';

interface Props {
  open: boolean;
  onClose: () => void;
  stage: Stage;
  title: string;
  sections: AssembledSection[];
  brief: ImageBrief;
  /** The generated image for this door, or null while one is still to come. */
  image?: string | null;
  id: string;
}

/**
 * One of the two "on demand" panels: the text on one side, its image on the
 * other.
 *
 * The sections arrive already grouped and ordered ([panels.ts](../content/panels.ts));
 * this only lays them out. Headings inside the modal are dropped for the
 * first section, whose heading is the dialog title — printing it twice is
 * the commonest way a modal ends up looking like a mistake.
 */
export function DetailModal({
  open,
  onClose,
  stage,
  title,
  sections,
  brief,
  image = null,
  id,
}: Props) {
  const data = STAGES[stage];

  return (
    <Modal open={open} onClose={onClose} labelledBy={id} variant="detail">
      <header className="modal__head">
        <p className="modal__eyebrow">
          <span
            className="panel__swatch"
            style={{ background: data.color }}
            aria-hidden="true"
          />
          {data.name} · stage {data.position} of 6
        </p>
        <h2 id={id} className="modal__title">
          {title}
        </h2>
        <ModalClose onClose={onClose} />
      </header>

      <div className="modal__body">
        <div className="modal__text">
          {sections.map((section, i) => (
            <section
              key={section.key}
              className={`detail__section detail__section--${section.kind}`}
              data-block={section.blockId ?? undefined}
            >
              {i > 0 && section.heading && <h3>{section.heading}</h3>}
              <Prose body={section.body} />
            </section>
          ))}
        </div>

        <figure className="shot">
          {image ? (
            // The caption below already describes the frame, so the image
            // itself is decorative to a screen reader: alt="" keeps it from
            // being announced twice.
            <img className="shot__img" src={image} alt="" loading="lazy" />
          ) : (
            <div className="shot__frame">
              <svg
                width="40"
                height="34"
                viewBox="0 0 40 34"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="1"
                  y="1"
                  width="38"
                  height="32"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="11" r="3.5" fill="currentColor" opacity="0.7" />
                <path
                  d="M4 27 L15 17 L23 24 L29 19 L36 26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="shot__label">Image to come</p>
            </div>
          )}
          <figcaption className="shot__caption">{brief.alt}</figcaption>
        </figure>
      </div>
    </Modal>
  );
}

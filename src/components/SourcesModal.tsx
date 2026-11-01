import {
  DOMAIN_SOURCES,
  FRAMEWORK_SOURCES,
  HELP_SOURCES,
  type Source,
} from '../content/sources';
import { DOMAINS } from '../domain/taxonomies';
import type { Domain } from '../domain/types';
import { Modal, ModalClose } from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
  /** The field being read, if there is one. */
  domain: Domain | null;
}

const TITLE_ID = 'sources-title';

/**
 * Where all of this comes from.
 *
 * Three groups, because a reader arrives with one of three questions: is the
 * model real, does any of this apply to my work, and what actually helps.
 *
 * The list includes the work that argues against this tool — the direct test
 * that found stage theory does not hold, and the paper warning clinicians off
 * walking people through stages. A sources list that only flatters the thing
 * it supports is an advertisement, and this tool's whole claim on anyone's
 * attention is that it is honest about what it does not know.
 */
export function SourcesModal({ open, onClose, domain }: Props) {
  const domainSources = domain ? DOMAIN_SOURCES[domain] : null;

  return (
    <Modal open={open} onClose={onClose} labelledBy={TITLE_ID} variant="detail">
      <header className="modal__head">
        <p className="modal__eyebrow">Reading</p>
        <h2 id={TITLE_ID} className="modal__title">
          Where this comes from
        </h2>
        <ModalClose onClose={onClose} />
      </header>

      <div className="modal__body modal__body--single">
        <p className="sources__lead">
          Everything below was read and assessed before it was used here. Some of it
          argues against this tool, and that work is listed too.
        </p>

        <div className="sources__standing">
          <h3>How much of this is established?</h3>
          <p>
            Less than the confident tone of a six-stage diagram suggests. The stages are
            a practitioner model, not a validated instrument. Their <em>order</em> is a
            convention rather than a finding — the one direct test of stage theory found
            the predicted first stage was not first. The Grief Gap is our own hypothesis
            and has never been tested. What is best supported is the part that describes
            rather than predicts: that resistance is usually rational, that this lands as
            a question about identity, and the adoption numbers behind where each field
            sits.
          </p>
        </div>

        <SourceList
          id="sources-framework"
          heading="The model, and the case against it"
          sources={FRAMEWORK_SOURCES}
        />

        <SourceList
          id="sources-domain"
          heading={
            domainSources
              ? `In ${DOMAINS[domain!].name.toLowerCase()}`
              : 'In your kind of work'
          }
          sources={domainSources ?? []}
          empty="Answer the six questions, or pick a field in the panel, and the reading for that kind of work appears here."
        />

        <SourceList
          id="sources-help"
          heading="What actually helps"
          sources={HELP_SOURCES}
          intro="Evidence on what moves someone who is stuck, which is not the same as what sounds encouraging."
        />
      </div>
    </Modal>
  );
}

function SourceList({
  id,
  heading,
  sources,
  intro,
  empty,
}: {
  id: string;
  heading: string;
  sources: Source[];
  intro?: string;
  empty?: string;
}) {
  return (
    <section className="sources__group" aria-labelledby={id}>
      <h3 id={id}>{heading}</h3>
      {intro && <p className="sources__intro">{intro}</p>}
      {sources.length === 0 ? (
        <p className="sources__intro">{empty}</p>
      ) : (
        <ul className="sources__list">
          {sources.map((s) => (
            <li key={`${s.authors}-${s.year}-${s.title}`} className="source">
              <p className="source__title">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer noopener">
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
              </p>
              <p className="source__meta">
                {s.authors} ({s.year}) · {s.venue}
              </p>
              <p className="source__note">{s.note}</p>
              {s.caveat && <p className="source__caveat">{s.caveat}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

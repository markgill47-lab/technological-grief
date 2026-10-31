import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { MAX_TURNS } from '../diagnostic/conversation';

export function ConversationSurvey() {
  const transcript = useStore((s) => s.transcript);
  const status = useStore((s) => s.status);
  const sendTurn = useStore((s) => s.sendTurn);
  const classifyNow = useStore((s) => s.classifyNow);

  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const thinking = status === 'thinking';
  const userTurns = transcript.filter((t) => t.role === 'user').length;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [transcript.length, thinking]);

  useEffect(() => {
    if (!thinking) inputRef.current?.focus();
  }, [thinking]);

  function send() {
    const text = draft.trim();
    if (!text || thinking) return;
    setDraft('');
    void sendTurn(text);
  }

  return (
    <div className="talk">
      <ol className="talk__transcript" aria-live="polite" aria-relevant="additions">
        {transcript.map((turn, i) => (
          <li key={i} className={`talk__turn talk__turn--${turn.role}`}>
            <span className="visually-hidden">
              {turn.role === 'user' ? 'You said:' : 'Reply:'}
            </span>
            {turn.content}
          </li>
        ))}
        {thinking && (
          <li className="talk__turn talk__turn--assistant talk__thinking">
            <span className="visually-hidden">Thinking</span>
            <span aria-hidden="true" className="talk__dots">
              <i />
              <i />
              <i />
            </span>
          </li>
        )}
        <div ref={endRef} />
      </ol>

      <div className="talk__compose">
        <label htmlFor="talk-input" className="visually-hidden">
          Your answer
        </label>
        <textarea
          id="talk-input"
          ref={inputRef}
          className="talk__input"
          rows={2}
          value={draft}
          disabled={thinking}
          placeholder="Type your answer…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter is a newline.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          type="button"
          className="button button--primary"
          onClick={send}
          disabled={thinking || draft.trim() === ''}
        >
          Send
        </button>
      </div>

      <div className="talk__meta">
        {/* No progress bar. There is no fixed question count on this path,
            and faking one would be a lie about what it is. */}
        <span>Usually five or six questions.</span>
        {userTurns >= 3 && !thinking && (
          <button type="button" className="link-button" onClick={() => void classifyNow()}>
            That's enough — place me
          </button>
        )}
        {userTurns >= MAX_TURNS - 1 && <span>Nearly there.</span>}
      </div>
    </div>
  );
}

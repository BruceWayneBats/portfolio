import { useEffect, useRef } from "react";
import { contacts } from "./contacts";
import { useLockScroll } from "./hooks";

export type TgMessage = {
  id: number;
  title: string;
  lines: [string, string][];
  total?: string;
  time: string;
};

let seq = 1;
export const makeMessage = (m: Omit<TgMessage, "id" | "time">): TgMessage => ({
  ...m,
  id: seq++,
  time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
});

export function TgBubble({ m }: { m: TgMessage }) {
  return (
    <div className="tg-bubble">
      <b className="tg-title">{m.title}</b>
      {m.lines.map(([k, v]) => (
        <div key={k} className="tg-line">
          <span>{k}:</span> {v}
        </div>
      ))}
      {m.total && <div className="tg-total">{m.total}</div>}
      <span className="tg-time">{m.time}</span>
    </div>
  );
}

// Окно чата «как видит владелец». typing — показать «печатает…»
export function TgChat({
  messages,
  typing = false,
  name = "Бот заявок",
  hint,
}: {
  messages: TgMessage[];
  typing?: boolean;
  name?: string;
  hint?: string;
}) {
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);
  return (
    <div className="tg">
      <div className="tg-head">
        <span className="tg-ava" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M21.5 4.3 2.9 11.5c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5ZM8.9 14.2l8.6-5.4c.4-.3.8-.1.5.2l-7.1 6.4-.3 3.1-1.7-4.3Z" />
          </svg>
        </span>
        <span className="tg-name">
          {name}
          <small>{typing ? "печатает…" : "бот"}</small>
        </span>
      </div>
      <div className="tg-body" ref={body}>
        {hint && messages.length === 0 && !typing && <p className="tg-hint">{hint}</p>}
        {messages.map((m) => (
          <TgBubble key={m.id} m={m} />
        ))}
        {typing && (
          <div className="tg-bubble tg-typing" aria-label="печатает">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
    </div>
  );
}

// Окно после отправки формы на демо-сайтах
export function SentSheet({ message, onClose, title = "Заявка отправлена" }: { message: TgMessage | null; onClose: () => void; title?: string }) {
  useLockScroll(!!message);
  useEffect(() => {
    if (!message) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3>{title}</h3>
        <p className="sheet-sub">Так её увидит владелец в Telegram:</p>
        <TgChat messages={[message]} />
        <p className="sheet-note">Это демо: на самом деле ничего не отправлено.</p>
        <div className="sheet-actions">
          <a className="sheet-cta" href={contacts.telegramUrl} target="_blank" rel="noopener">
            Хочу такой сайт
          </a>
          <button type="button" className="sheet-close" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

// Плашка на демо-сайтах: откуда сайт и как связаться
export function DemoBadge() {
  return (
    <div className="demo-badge">
      <span className="demo-dot" aria-hidden="true" />
      <span>Демо-сайт</span>
      <a href={contacts.portfolio}>← портфолио</a>
      <a href={contacts.telegramUrl} target="_blank" rel="noopener">
        Хочу такой
      </a>
    </div>
  );
}

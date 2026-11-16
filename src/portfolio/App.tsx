import { useState } from "react";
import { contacts } from "../shared/contacts";
import { useReveal } from "../shared/hooks";
import { Picker } from "./Picker";
import { projects } from "./projects";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const inside: [string, string][] = [
  ["Заявки в Telegram", "Клиент нажал кнопку — сообщение у вас в телефоне"],
  ["Считает сам", "Калькулятор, запись или корзина вместо «уточняйте по телефону»"],
  ["Правки без меня", "Цены, акции и товары меняете в простой админке"],
  ["Сначала телефон", "Удобно пальцем, быстро грузится на мобильном"],
  ["Открывается без VPN", "Хостинг в России, домен и SSL настрою"],
  ["Видно в поиске", "Заголовки, описания, карта сайта для Яндекса"],
];

const steps: [string, string][] = [
  ["Пишете в Telegram", "Пара фраз о бизнесе и что должен уметь сайт"],
  ["Показываю демо", "Собираю первую версию на ваших текстах и ценах"],
  ["Правим и запускаем", "Домен, хостинг, заявки в ваш Telegram"],
  ["Дальше сами", "Показываю, как менять цены и товары"],
];

function TgIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M21.5 4.3 2.9 11.5c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5ZM8.9 14.2l8.6-5.4c.4-.3.8-.1.5.2l-7.1 6.4-.3 3.1-1.7-4.3Z" />
    </svg>
  );
}

function CopyMax() {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contacts.max);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* без буфера обмена номер всё равно виден и выделяется */
    }
  };
  return (
    <div className="max">
      <a href={`tel:${contacts.maxTel}`}>
        <small>MAX</small>
        {contacts.max}
      </a>
      <button type="button" onClick={copy}>
        {done ? "Скопировано" : "Копировать"}
      </button>
    </div>
  );
}

export function App() {
  useReveal();
  return (
    <>
      <div className="blobs" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <header className="top wrap">
        <a href="#" className="me">
          <span className="me-ava" aria-hidden="true">
            ю
          </span>
          @{contacts.telegram}
        </a>
        <nav className="top-nav">
          <a href="#works">Работы</a>
          <a href="#contact">Контакты</a>
          <a className="tg-btn small" href={contacts.telegramUrl} target="_blank" rel="noopener">
            <TgIcon /> Написать
          </a>
        </nav>
      </header>

      <main>
        <section className="hero wrap">
          <span className="status rise" style={d(0)}>
            <i /> Беру новые проекты
          </span>
          <h1 className="rise" style={d(80)}>
            Пока вы работаете, сайт <span className="mark">считает, записывает и&nbsp;продаёт</span>
          </h1>
          <div className="hero-sub rise" style={d(180)}>
            <p>Сайты для малого бизнеса: калькулятор, онлайн-запись или корзина вместо «уточняйте по телефону».</p>
          </div>
          <div className="rise" style={d(280)}>
            <Picker />
          </div>
        </section>

        <section className="wrap section" id="works">
          <div className="head" data-reveal>
            <h2>Все работы</h2>
            <p>Демо живые: формы, корзина и календарь работают.</p>
          </div>
          <div className="works">
            {projects.map((p, i) => (
              <a
                key={p.id}
                href={p.url}
                target={p.real ? "_blank" : undefined}
                rel={p.real ? "noopener" : undefined}
                className={`work ${p.real ? "work-real" : ""}`}
                data-reveal
                style={{ ...d((i % 2) * 90), "--tint": p.tint } as React.CSSProperties}
              >
                <div className="shot">
                  <img src={p.shot} alt={`Сайт: ${p.niche}`} loading="lazy" width={1280} height={800} />
                </div>
                <div className="work-info">
                  <span className={`badge ${p.real ? "badge-real" : ""}`}>{p.tag}</span>
                  <span className="niche">{p.niche}</span>
                  <h3>{p.hook}</h3>
                  <ul>
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <span className="open">Открыть сайт ↗</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="wrap section">
          <div className="head" data-reveal>
            <h2>В каждом сайте</h2>
          </div>
          <div className="inside">
            {inside.map(([t, s], i) => (
              <div key={t} data-reveal style={d((i % 3) * 80)}>
                <b>{t}</b>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap section">
          <div className="head" data-reveal>
            <h2>От сообщения до запуска</h2>
          </div>
          <ol className="steps">
            {steps.map(([t, s], i) => (
              <li key={t} data-reveal style={d(i * 90)}>
                <span>{i + 1}</span>
                <b>{t}</b>
                <p>{s}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="wrap section" id="contact">
          <div className="contact" data-reveal>
            <h2>Расскажите о бизнесе — предложу, что сайт будет считать и куда слать заявки</h2>
            <div className="contact-row">
              <a className="tg-btn big" href={contacts.telegramUrl} target="_blank" rel="noopener">
                <TgIcon /> @{contacts.telegram}
              </a>
              <CopyMax />
            </div>
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} · @{contacts.telegram}</span>
        <span>Компании в демо вымышлены</span>
      </footer>
    </>
  );
}

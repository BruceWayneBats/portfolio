import { useState } from "react";
import { DemoBadge, makeMessage, SentSheet, type TgMessage } from "../shared/tg";
import { useReveal, useTween } from "../shared/hooks";
import { maskPhone, phoneOk, plural, rub } from "../shared/format";
import { BATHROOM_PRICE, repairEstimate, repairExtras, repairTypes, type RepairInput } from "../shared/data";

const steps = [
  ["Замер", "Приезжаем в удобный день, замеряем и фотографируем. Бесплатно."],
  ["Смета", "Через 2 дня — смета по пунктам. Цена фиксируется в договоре."],
  ["Черновые работы", "Стены, полы, электрика, сантехника. Фотоотчёт каждый вечер."],
  ["Чистовая отделка", "Плитка, покраска, двери, свет. Вы принимаете каждый этап."],
  ["Сдача", "Уборка, акт и гарантия 3 года на все работы."],
];

const works = [
  { title: "Однушка в новостройке", meta: "38 м² · капитальный · 6 недель", price: 452000, plan: [[0, 0, 60, 58], [60, 0, 40, 34], [60, 34, 40, 24], [0, 58, 100, 42]] },
  { title: "Двушка для семьи", meta: "54 м² · под ключ · 10 недель", price: 1180000, plan: [[0, 0, 46, 50], [46, 0, 54, 50], [0, 50, 30, 50], [30, 50, 30, 50], [60, 50, 40, 50]] },
  { title: "Студия под сдачу", meta: "27 м² · косметический · 3 недели", price: 146000, plan: [[0, 0, 100, 64], [0, 64, 42, 36], [42, 64, 58, 36]] },
];

const faq = [
  ["Цена из калькулятора окончательная?", "Это ориентир ±8%. Точную смету даёт замерщик после осмотра, и дальше она не растёт."],
  ["Можно платить частями?", "Да, оплата по этапам: вы платите только за принятую работу."],
  ["Кто закупает материалы?", "Можем мы — со скидкой поставщика и доставкой. Или вы сами по нашему списку."],
  ["Что с гарантией?", "3 года на все работы по договору. Если что-то отошло — исправим бесплатно."],
];

function Plan({ rooms }: { rooms: number[][] }) {
  return (
    <svg viewBox="-2 -2 104 104" className="plan" aria-hidden="true">
      {rooms.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} className={i === 1 ? "plan-hl" : ""} />
      ))}
    </svg>
  );
}

function Calculator({ onSend }: { onSend: (m: TgMessage) => void }) {
  const [input, setInput] = useState<RepairInput>({ type: "capital", area: 54, bathrooms: 1, extras: ["demolition"] });
  const [form, setForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState("Будни, днём");
  const [touched, setTouched] = useState(false);
  const est = repairEstimate(input);
  const from = useTween(est.from);
  const to = useTween(est.to);
  const set = (p: Partial<RepairInput>) => setInput((s) => ({ ...s, ...p }));
  const type = repairTypes.find((t) => t.id === input.type)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || !phoneOk(phone)) return;
    onSend(
      makeMessage({
        title: "Новая заявка на замер",
        lines: [
          ["Имя", name.trim()],
          ["Телефон", phone],
          ["Ремонт", `${type.name.toLowerCase()}, ${input.area} м²`],
          ["Санузлы", String(input.bathrooms)],
          ["Удобно", when],
        ],
        total: `Смета на сайте: ${rub(est.from)} – ${rub(est.to)}`,
      }),
    );
    setForm(false);
    setName("");
    setPhone("");
    setTouched(false);
  };

  return (
    <div className="calc" id="calc">
      <div className="calc-types" role="radiogroup" aria-label="Тип ремонта">
        {repairTypes.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={input.type === t.id}
            className="type"
            onClick={() => set({ type: t.id })}
          >
            <b>{t.name}</b>
            <span>{t.note}</span>
            <em>от {rub(t.perM2)}/м²</em>
          </button>
        ))}
      </div>

      <label className="row">
        <span className="row-head">
          Площадь
          <span className="area">
            <input
              type="number"
              min={15}
              max={250}
              value={input.area}
              onChange={(e) => set({ area: Math.max(15, Math.min(250, Number(e.target.value) || 15)) })}
              aria-label="Площадь, м²"
            />
            м²
          </span>
        </span>
        <input
          type="range"
          min={15}
          max={250}
          value={input.area}
          onChange={(e) => set({ area: Number(e.target.value) })}
          style={{ "--p": `${((input.area - 15) / 235) * 100}%` } as React.CSSProperties}
        />
      </label>

      <div className="row row-inline">
        <span>
          Санузлы <small>{rub(BATHROOM_PRICE)} каждый</small>
        </span>
        <div className="stepper">
          <button type="button" aria-label="Меньше" onClick={() => set({ bathrooms: Math.max(0, input.bathrooms - 1) })}>
            −
          </button>
          <output>{input.bathrooms}</output>
          <button type="button" aria-label="Больше" onClick={() => set({ bathrooms: Math.min(3, input.bathrooms + 1) })}>
            +
          </button>
        </div>
      </div>

      <div className="extras">
        {repairExtras.map((x) => (
          <label key={x.id} className="check">
            <input
              type="checkbox"
              checked={input.extras.includes(x.id)}
              onChange={(e) =>
                set({ extras: e.target.checked ? [...input.extras, x.id] : input.extras.filter((i) => i !== x.id) })
              }
            />
            <span>{x.name}</span>
            <small>+{rub(x.perM2)}/м²</small>
          </label>
        ))}
      </div>

      <div className="result">
        <div>
          <span className="result-label">Примерная стоимость</span>
          <strong className="result-sum">
            {rub(from)} – {rub(to)}
          </strong>
          <span className="result-meta">
            ≈ {est.weeks} {plural(est.weeks, "неделя", "недели", "недель")} работы · {rub(est.total / input.area)} за м²
          </span>
        </div>
        <details className="parts">
          <summary>Из чего складывается</summary>
          {est.parts.map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <span>{rub(v)}</span>
            </div>
          ))}
        </details>
      </div>

      {!form ? (
        <button type="button" className="btn btn-accent wide" onClick={() => setForm(true)}>
          Зафиксировать цену — вызвать замерщика
        </button>
      ) : (
        <form className="lead" onSubmit={submit} noValidate>
          <input
            id="remont-name"
            placeholder="Как к вам обращаться"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={touched && !name.trim()}
            autoFocus
          />
          <input
            id="remont-phone"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            aria-invalid={touched && !phoneOk(phone)}
          />
          <select id="remont-when" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Когда удобно">
            <option>Будни, днём</option>
            <option>Будни, вечером</option>
            <option>Выходные</option>
          </select>
          {touched && (!name.trim() || !phoneOk(phone)) && <p className="err">Укажите имя и телефон полностью.</p>}
          <button className="btn btn-accent wide">Отправить заявку</button>
        </form>
      )}
    </div>
  );
}

export function App() {
  useReveal();
  const [sent, setSent] = useState<TgMessage | null>(null);
  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <a href="#" className="logo" aria-label="Метр">
            <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
              <rect x="2" y="8" width="28" height="16" rx="3" fill="var(--accent)" />
              {[7, 11, 15, 19, 23, 27].map((x, i) => (
                <path key={x} d={`M${x} 8v${i % 2 ? 4 : 7}`} stroke="var(--ink)" strokeWidth="1.6" />
              ))}
            </svg>
            метр
          </a>
          <nav className="nav">
            <a href="#calc">Расчёт</a>
            <a href="#steps">Этапы</a>
            <a href="#works">Работы</a>
            <a href="#faq">Вопросы</a>
          </nav>
          <a href="#calc" className="btn btn-dark small">
            Замер бесплатно
          </a>
        </div>
      </header>

      <main>
        <section className="hero wrap">
          <div className="hero-text" data-reveal>
            <span className="tag">Ремонт квартир в Казани</span>
            <h1>
              Смета за 10 секунд. <span className="hl">Цена не растёт</span> после договора.
            </h1>
            <p>Двигайте ползунок — стоимость считается сразу. Замерщик приедет бесплатно и зафиксирует сумму.</p>
            <ul className="facts">
              <li>
                <b>3 года</b> гарантии
              </li>
              <li>
                <b>Каждый день</b> фотоотчёт
              </li>
              <li>
                <b>По этапам</b> оплата
              </li>
            </ul>
          </div>
          <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <Calculator onSend={setSent} />
          </div>
        </section>

        <section className="band" id="steps">
          <div className="wrap">
            <h2 data-reveal>Как идёт ремонт</h2>
            <ol className="steps">
              {steps.map(([t, d], i) => (
                <li key={t} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                  <span className="step-n">{i + 1}</span>
                  <b>{t}</b>
                  <p>{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="wrap section" id="works">
          <h2 data-reveal>Последние объекты</h2>
          <div className="works">
            {works.map((w, i) => (
              <article key={w.title} className="work" data-reveal style={{ "--d": `${i * 100}ms` } as React.CSSProperties}>
                <Plan rooms={w.plan} />
                <h3>{w.title}</h3>
                <p>{w.meta}</p>
                <b>{rub(w.price)}</b>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap section" id="faq">
          <h2 data-reveal>Частые вопросы</h2>
          <div className="faq">
            {faq.map(([q, a]) => (
              <details key={q} data-reveal>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="wrap cta" data-reveal>
          <h2>Узнайте точную цену на объекте</h2>
          <p>Замер и смета бесплатны, даже если не договоримся.</p>
          <a href="#calc" className="btn btn-accent">
            Посчитать ремонт
          </a>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© «Метр». Компания вымышлена — это демо-сайт.</span>
      </footer>
      <SentSheet message={sent} onClose={() => setSent(null)} />
      <DemoBadge />
    </>
  );
}

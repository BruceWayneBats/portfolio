import { useEffect, useMemo, useState } from "react";
import { DemoBadge, makeMessage, SentSheet, type TgMessage } from "../shared/tg";
import { useReveal, useTween } from "../shared/hooks";
import { maskPhone, phoneOk, plural, rub } from "../shared/format";
import { bookedNights, dayKey, glampExtras, glampPrice, houses, isWeekendNight } from "../shared/data";

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const WD = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const short = (d: Date) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "");

function Scene() {
  // Озеро и лес: слои двигаются с разной скоростью при прокрутке
  const [y, setY] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(Math.min(window.scrollY, 600)));
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const pines = (n: number, base: number, h: number, seed: number) =>
    Array.from({ length: n }, (_, i) => {
      const x = (i / n) * 1440 + ((i * seed) % 37);
      const hh = h * (0.7 + (((i * seed) % 10) / 10) * 0.5);
      return `M${x} ${base} L${x + hh * 0.22} ${base - hh} L${x + hh * 0.44} ${base} Z`;
    }).join(" ");
  return (
    <svg className="scene" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d6b8" />
          <stop offset=".55" stopColor="#e9e3d6" />
          <stop offset="1" stopColor="#dfe7e6" />
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9cdd0" />
          <stop offset="1" stopColor="#8fb0b2" />
        </linearGradient>
      </defs>
      <circle cx="1040" cy={220 + y * 0.25} r="56" fill="#fbe9d2" className="sun" />
      <g transform={`translate(0 ${y * 0.18})`}>
        <path d="M0 330 Q 240 250 480 300 T 960 280 T 1440 300 V 400 H0 Z" fill="#c8d3cb" />
      </g>
      <g transform={`translate(0 ${y * 0.1})`}>
        <path d={pines(46, 395, 120, 7)} fill="#7f9b8c" />
      </g>
      <rect y="392" width="1440" height="168" fill="url(#lake)" />
      <g className="ripples" stroke="#e9f1ef" strokeWidth="2" strokeLinecap="round" opacity=".7">
        <path d="M180 440 h120 M820 470 h160 M1160 430 h90 M420 500 h140 M980 520 h70" />
      </g>
      <g transform={`translate(0 ${-y * 0.06})`}>
        <path d={pines(22, 560, 260, 13)} fill="#2c4a43" />
        <path d="M600 470 L680 380 L760 470 Z" fill="#c98f5e" />
        <rect x="660" y="430" width="40" height="40" fill="#f6d39a" className="window" />
      </g>
    </svg>
  );
}

export function App() {
  useReveal();
  const [house, setHouse] = useState<string>(houses[0].id);
  const [ci, setCi] = useState<Date | null>(null);
  const [co, setCo] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [extras, setExtras] = useState<string[]>(["sauna"]);
  const [month, setMonth] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState<TgMessage | null>(null);

  const h = houses.find((x) => x.id === house)!;
  const booked = useMemo(() => bookedNights(house), [house]);
  const start = today();
  const free = (d: Date) => !booked.has(dayKey(d));

  useEffect(() => {
    setCi(null);
    setCo(null);
    setGuests((g) => Math.min(g, h.guests));
  }, [house, h.guests]);

  const pick = (d: Date) => {
    if (!ci || co || d <= ci) {
      if (!free(d)) return;
      setCi(d);
      setCo(null);
      return;
    }
    for (let x = new Date(ci); x < d; x = addDays(x, 1)) if (!free(x)) return setCi(free(d) ? d : ci);
    setCo(d);
  };

  const price = ci && co ? glampPrice(house, ci, co, guests, extras) : null;
  const total = useTween(price?.total ?? 0);

  const months = [0, 1].map((k) => {
    const m = new Date(start.getFullYear(), start.getMonth() + month + k, 1);
    const pad = (m.getDay() + 6) % 7;
    const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    return { m, cells: [...Array(pad).fill(null), ...Array.from({ length: days }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i + 1))] as (Date | null)[] };
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!price || !name.trim() || !phoneOk(phone)) return;
    setSent(
      makeMessage({
        title: "Новая бронь",
        lines: [
          ["Гость", `${name.trim()}, ${phone}`],
          ["Домик", h.name],
          ["Даты", `${short(ci!)} – ${short(co!)}, ${price.nights} ${plural(price.nights, "ночь", "ночи", "ночей")}`],
          ["Гостей", String(guests)],
          ...(price.extras.length ? [["Допы", price.extras.map(([n]) => n.toLowerCase()).join(", ")] as [string, string]] : []),
        ],
        total: `Сумма: ${rub(price.total)}, предоплата 30%`,
      }),
    );
    setCi(null);
    setCo(null);
    setName("");
    setPhone("");
    setTouched(false);
  };

  return (
    <>
      <header className="hero">
        <Scene />
        <div className="hero-in wrap">
          <span className="brand">Тихий берег</span>
          <h1 data-reveal>
            Выберите даты —<br />
            <em>цена посчитается сама</em>
          </h1>
          <p data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            Три домика на берегу лесного озера, 90 минут от города. Баня, сапы и тишина.
          </p>
          <a href="#book" className="btn" data-reveal style={{ "--d": "220ms" } as React.CSSProperties}>
            Проверить свободные даты
          </a>
        </div>
      </header>

      <main className="wrap" id="book">
        <section className="houses">
          {houses.map((x, i) => (
            <button
              key={x.id}
              type="button"
              className="house"
              aria-pressed={house === x.id}
              onClick={() => setHouse(x.id)}
              data-reveal
              style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
            >
              <span className={`house-pic pic-${x.id}`} aria-hidden="true" />
              <b>{x.name}</b>
              <span>{x.text}</span>
              <small>
                до {x.guests} {plural(x.guests, "гостя", "гостей", "гостей")} · от {rub(x.weekday)}/ночь
              </small>
            </button>
          ))}
        </section>

        <section className="booking">
          <div className="cal" data-reveal>
            <div className="cal-nav">
              <button type="button" onClick={() => setMonth((m) => Math.max(0, m - 1))} disabled={month === 0} aria-label="Назад">
                ←
              </button>
              <span>{ci && !co ? "Теперь выберите дату выезда" : "Выберите дату заезда"}</span>
              <button type="button" onClick={() => setMonth((m) => Math.min(2, m + 1))} disabled={month === 2} aria-label="Вперёд">
                →
              </button>
            </div>
            <div className="months">
              {months.map(({ m, cells }) => (
                <div key={m.toISOString()} className="month">
                  <b>
                    {MONTHS[m.getMonth()]} {m.getFullYear()}
                  </b>
                  <div className="wd">
                    {WD.map((w) => (
                      <span key={w}>{w}</span>
                    ))}
                  </div>
                  <div className="days">
                    {cells.map((d, i) => {
                      if (!d) return <span key={i} />;
                      const past = d < start;
                      const busy = !free(d);
                      const inRange = ci && co && d > ci && d < co;
                      const edge = (ci && d.getTime() === ci.getTime()) || (co && d.getTime() === co.getTime());
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={past || (busy && !(ci && !co && d > ci))}
                          className={`d ${busy ? "busy" : ""} ${inRange ? "range" : ""} ${edge ? "edge" : ""} ${isWeekendNight(d) ? "we" : ""}`}
                          onClick={() => pick(d)}
                          aria-label={d.toLocaleDateString("ru-RU")}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="legend">
              <i className="lg-we" /> пт и сб дороже <i className="lg-busy" /> занято
            </p>
          </div>

          <form className="sum" onSubmit={submit} noValidate data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <h2>{h.name}</h2>
            <div className="sum-row">
              <span>Гостей</span>
              <div className="stepper">
                <button type="button" aria-label="Меньше" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                  −
                </button>
                <output>{guests}</output>
                <button type="button" aria-label="Больше" onClick={() => setGuests((g) => Math.min(h.guests, g + 1))}>
                  +
                </button>
              </div>
            </div>
            <div className="opts">
              {glampExtras.map((x) => (
                <label key={x.id} className="opt">
                  <input
                    type="checkbox"
                    checked={extras.includes(x.id)}
                    onChange={(e) => setExtras((s) => (e.target.checked ? [...s, x.id] : s.filter((i) => i !== x.id)))}
                  />
                  <span>{x.name}</span>
                  <small>
                    {rub(x.price)}
                    {x.per === "night" ? "/день" : x.per === "guestNight" ? "/гость в день" : ""}
                  </small>
                </label>
              ))}
            </div>
            {price ? (
              <div className="calc">
                <div>
                  <span>
                    {short(ci!)} – {short(co!)}, {price.nights} {plural(price.nights, "ночь", "ночи", "ночей")}
                    {price.weekend ? `, из них ${price.weekend} в выходные` : ""}
                  </span>
                  <span>{rub(price.stay)}</span>
                </div>
                {price.extras.map(([n, v]) => (
                  <div key={n}>
                    <span>{n}</span>
                    <span>{rub(v)}</span>
                  </div>
                ))}
                <div className="calc-total">
                  <span>Итого</span>
                  <b>{rub(total)}</b>
                </div>
              </div>
            ) : (
              <p className="hint">Выберите заезд и выезд в календаре — здесь появится расчёт.</p>
            )}
            <input id="glamp-name" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && !name.trim()} />
            <input
              id="glamp-phone"
              type="tel"
              inputMode="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              aria-invalid={touched && !phoneOk(phone)}
            />
            {touched && (!price || !name.trim() || !phoneOk(phone)) && <p className="err">{!price ? "Выберите даты в календаре." : "Укажите имя и телефон."}</p>}
            <button className="btn wide">Забронировать</button>
            <p className="small">Предоплата 30% — после звонка администратора.</p>
          </form>
        </section>
      </main>

      <footer className="foot wrap">Глэмпинг вымышлен — это демо-сайт.</footer>
      <SentSheet message={sent} onClose={() => setSent(null)} title="Бронь отправлена" />
      <DemoBadge />
    </>
  );
}

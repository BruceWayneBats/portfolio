import { useMemo, useState } from "react";
import { DemoBadge, makeMessage, SentSheet, type TgMessage } from "../shared/tg";
import { useReveal } from "../shared/hooks";
import { dayLabel, maskPhone, phoneOk, rub } from "../shared/format";
import { barberServices, barbers, freeStarts, hhmm, nextDays } from "../shared/data";

const ANY = "any";

const reviews = [
  ["Денис", "Записался в обед на вечер, пришёл — сразу в кресло. Фейд идеальный."],
  ["Олег", "Хожу к Артёму третий год. Видно свободные окна, не надо писать в директ."],
  ["Марат", "Привёл сына, сделали «отец + сын» за полтора часа. Кофе в подарок."],
];

function Avatar({ hue, name }: { hue: number; name: string }) {
  return (
    <span className="ava" style={{ "--h": hue } as React.CSSProperties} aria-hidden="true">
      {name[0]}
    </span>
  );
}

function Booking({ onSend }: { onSend: (m: TgMessage) => void }) {
  const days = useMemo(() => nextDays(10), []);
  const [service, setService] = useState<string>(barberServices[0].id);
  const [barber, setBarber] = useState<string>(ANY);
  const [day, setDay] = useState(() => {
    const i = days.findIndex((d) => barbers.some((b) => freeStarts(b.id, d, barberServices[0].min).length));
    return Math.max(0, i);
  });
  const [start, setStart] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const s = barberServices.find((x) => x.id === service)!;
  // свободное время: для «любого мастера» — объединение окон всех мастеров
  const slots = useMemo(() => {
    const list = barber === ANY ? barbers : barbers.filter((b) => b.id === barber);
    const map = new Map<number, string>();
    for (const b of list) for (const m of freeStarts(b.id, days[day], s.min)) if (!map.has(m)) map.set(m, b.id);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [barber, day, s.min, days]);

  const chosen = start !== null ? barbers.find((b) => b.id === (barber === ANY ? slots.find(([m]) => m === start)?.[1] : barber)) : undefined;
  const price = Math.round((s.price * (chosen?.k ?? (barber === ANY ? 1 : barbers.find((b) => b.id === barber)!.k))) / 50) * 50;
  const step = start === null ? (barber && service ? 3 : 1) : 4;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || !phoneOk(phone) || start === null || !chosen) return;
    onSend(
      makeMessage({
        title: "Новая запись",
        lines: [
          ["Клиент", `${name.trim()}, ${phone}`],
          ["Услуга", `${s.name}, ${s.min} мин`],
          ["Мастер", chosen.name],
          ["Когда", `${dayLabel(days[day])}, ${hhmm(start)}`],
        ],
        total: `К оплате в салоне: ${rub(price)}`,
      }),
    );
    setStart(null);
    setName("");
    setPhone("");
    setTouched(false);
  };

  return (
    <form className="book" id="book" onSubmit={submit} noValidate>
      <div className="book-progress" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={n <= step ? "on" : ""} />
        ))}
      </div>

      <fieldset>
        <legend>Услуга</legend>
        <div className="svc">
          {barberServices.map((x) => (
            <label key={x.id} className="svc-item">
              <input type="radio" name="svc" checked={service === x.id} onChange={() => (setService(x.id), setStart(null))} />
              <span>{x.name}</span>
              <small>
                {x.min} мин · {rub(x.price)}
              </small>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Мастер</legend>
        <div className="masters">
          <button type="button" className="master" aria-pressed={barber === ANY} onClick={() => (setBarber(ANY), setStart(null))}>
            <span className="ava ava-any" aria-hidden="true">
              ✦
            </span>
            Любой
          </button>
          {barbers.map((b) => (
            <button key={b.id} type="button" className="master" aria-pressed={barber === b.id} onClick={() => (setBarber(b.id), setStart(null))}>
              <Avatar hue={b.hue} name={b.name} />
              {b.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>День</legend>
        <div className="days">
          {days.map((d, i) => (
            <button key={i} type="button" className="day" aria-pressed={day === i} onClick={() => (setDay(i), setStart(null))}>
              <small>{i === 0 ? "сегодня" : i === 1 ? "завтра" : dayLabel(d).split(",")[0]}</small>
              <b>{d.getDate()}</b>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          Время <span className="free">свободно {slots.length}</span>
        </legend>
        {slots.length ? (
          <div className="slots">
            {slots.map(([m]) => (
              <button key={m} type="button" className="slot" aria-pressed={start === m} onClick={() => setStart(m)}>
                {hhmm(m)}
              </button>
            ))}
          </div>
        ) : (
          <p className="none">На этот день всё занято — выберите другой.</p>
        )}
      </fieldset>

      {start !== null && chosen && (
        <div className="confirm">
          <p className="summary">
            {s.name} · {chosen.name} · {dayLabel(days[day])}, {hhmm(start)} — <b>{rub(price)}</b>
          </p>
          <input id="barber-name" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && !name.trim()} />
          <input
            id="barber-phone"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            aria-invalid={touched && !phoneOk(phone)}
          />
          {touched && (!name.trim() || !phoneOk(phone)) && <p className="err">Нужны имя и телефон, чтобы мастер вас ждал.</p>}
          <button className="btn wide">Записаться</button>
        </div>
      )}
    </form>
  );
}

export function App() {
  useReveal();
  const [sent, setSent] = useState<TgMessage | null>(null);
  return (
    <>
      <header className="top wrap">
        <a href="#" className="logo">
          ГРЕБЕНЬ
        </a>
        <span className="addr">Баумана, 12 · 10:00–21:00</span>
        <a href="#book" className="btn small">
          Записаться
        </a>
      </header>

      <main>
        <section className="hero wrap">
          <div className="hero-text" data-reveal>
            <span className="kicker">Барбершоп с 2016 года</span>
            <h1>
              Свободное время
              <br />
              видно сразу.
            </h1>
            <p>Выбираете услугу и мастера — видите только те окна, куда она поместится целиком.</p>
            <div className="hero-stats">
              <span>
                <b>4.9</b> на картах
              </span>
              <span>
                <b>12 000+</b> стрижек
              </span>
            </div>
          </div>
          <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <Booking onSend={setSent} />
          </div>
        </section>

        <section className="wrap section">
          <h2 data-reveal>Прайс</h2>
          <div className="price">
            {barberServices.map((x, i) => (
              <div key={x.id} className="price-row" data-reveal style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
                <span>{x.name}</span>
                <i />
                <span className="pmin">{x.min} мин</span>
                <b>{rub(x.price)}</b>
              </div>
            ))}
          </div>
          <p className="note">У топ-барбера цена выше на 20%.</p>
        </section>

        <section className="wrap section">
          <h2 data-reveal>Мастера</h2>
          <div className="team">
            {barbers.map((b, i) => (
              <article key={b.id} className="person" data-reveal style={{ "--d": `${i * 100}ms` } as React.CSSProperties}>
                <div className="portrait" style={{ "--h": b.hue } as React.CSSProperties}>
                  <span>{b.name[0]}</span>
                </div>
                <h3>{b.name}</h3>
                <p>
                  {b.role} · {b.years} лет опыта
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="wrap section">
          <h2 data-reveal>Отзывы</h2>
          <div className="reviews">
            {reviews.map(([n, t], i) => (
              <blockquote key={n} data-reveal style={{ "--d": `${i * 100}ms` } as React.CSSProperties}>
                <p>«{t}»</p>
                <cite>
                  {n} <span>★★★★★</span>
                </cite>
              </blockquote>
            ))}
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <div>
          <b>Гребень</b>
          <p>Казань, ул. Баумана, 12 · ежедневно 10:00–21:00</p>
        </div>
        <span>Барбершоп вымышлен — это демо-сайт.</span>
      </footer>
      <SentSheet message={sent} onClose={() => setSent(null)} title="Вы записаны" />
      <DemoBadge />
    </>
  );
}

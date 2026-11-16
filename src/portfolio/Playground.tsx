import { useRef, useState } from "react";
import { makeMessage, TgChat, type TgMessage } from "../shared/tg";
import { useTween } from "../shared/hooks";
import { plural, rub } from "../shared/format";
import { barberServices, houses, plants, repairEstimate, repairTypes } from "../shared/data";

type Tab = "remont" | "barber" | "shop" | "glamping";
const tabs: [Tab, string][] = [
  ["remont", "Ремонт"],
  ["barber", "Барбершоп"],
  ["shop", "Магазин"],
  ["glamping", "Глэмпинг"],
];

type Send = (m: Omit<TgMessage, "id" | "time">) => void;

function Remont({ send }: { send: Send }) {
  const [type, setType] = useState<(typeof repairTypes)[number]["id"]>("capital");
  const [area, setArea] = useState(54);
  const est = repairEstimate({ type, area, bathrooms: 1, extras: [] });
  const from = useTween(est.from);
  const to = useTween(est.to);
  const t = repairTypes.find((x) => x.id === type)!;
  return (
    <>
      <div className="pg-chips">
        {repairTypes.map((x) => (
          <button key={x.id} type="button" aria-pressed={type === x.id} onClick={() => setType(x.id)}>
            {x.name}
          </button>
        ))}
      </div>
      <label className="pg-range">
        <span>
          Площадь <b>{area} м²</b>
        </span>
        <input
          type="range"
          min={20}
          max={160}
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
          style={{ "--p": `${((area - 20) / 140) * 100}%` } as React.CSSProperties}
        />
      </label>
      <div className="pg-total">
        <span>Примерно</span>
        <b>
          {rub(from)} – {rub(to)}
        </b>
      </div>
      <button
        type="button"
        className="pg-send"
        onClick={() =>
          send({
            title: "Заявка на замер",
            lines: [
              ["Ремонт", `${t.name.toLowerCase()}, ${area} м²`],
              ["Срок", `≈ ${est.weeks} ${plural(est.weeks, "неделя", "недели", "недель")}`],
            ],
            total: `Смета: ${rub(est.from)} – ${rub(est.to)}`,
          })
        }
      >
        Вызвать замерщика
      </button>
    </>
  );
}

function Barber({ send }: { send: Send }) {
  const services = barberServices.slice(0, 3);
  const [svc, setSvc] = useState<string>(services[1].id);
  const [time, setTime] = useState("18:30");
  const s = services.find((x) => x.id === svc)!;
  return (
    <>
      <div className="pg-chips">
        {services.map((x) => (
          <button key={x.id} type="button" aria-pressed={svc === x.id} onClick={() => setSvc(x.id)}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="pg-label">Завтра, свободно:</div>
      <div className="pg-chips pg-times">
        {["11:00", "13:30", "16:00", "18:30", "20:00"].map((x) => (
          <button key={x} type="button" aria-pressed={time === x} onClick={() => setTime(x)}>
            {x}
          </button>
        ))}
      </div>
      <div className="pg-total">
        <span>{s.min} минут</span>
        <b>{rub(s.price)}</b>
      </div>
      <button
        type="button"
        className="pg-send"
        onClick={() =>
          send({
            title: "Новая запись",
            lines: [
              ["Услуга", s.name],
              ["Мастер", "Тимур"],
              ["Когда", `завтра, ${time}`],
            ],
            total: `К оплате: ${rub(s.price)}`,
          })
        }
      >
        Записаться
      </button>
    </>
  );
}

function Shop({ send }: { send: Send }) {
  const items = plants.filter((p) => ["monstera", "sansevieria", "pilea"].includes(p.id));
  const [cart, setCart] = useState<Record<string, number>>({ sansevieria: 1 });
  const sum = items.reduce((s, p) => s + p.price * (cart[p.id] ?? 0), 0);
  const total = useTween(sum);
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  return (
    <>
      <ul className="pg-items">
        {items.map((p) => (
          <li key={p.id}>
            <span className="pg-dot" style={{ background: p.leaf }} aria-hidden="true" />
            <span>
              {p.name}
              <small>{rub(p.price)}</small>
            </span>
            <span className="pg-qty">
              <button type="button" aria-label="Меньше" onClick={() => setCart({ ...cart, [p.id]: Math.max(0, (cart[p.id] ?? 0) - 1) })}>
                −
              </button>
              <output>{cart[p.id] ?? 0}</output>
              <button type="button" aria-label="Больше" onClick={() => setCart({ ...cart, [p.id]: (cart[p.id] ?? 0) + 1 })}>
                +
              </button>
            </span>
          </li>
        ))}
      </ul>
      <div className="pg-total">
        <span>
          {n} {plural(n, "товар", "товара", "товаров")}
        </span>
        <b>{rub(total)}</b>
      </div>
      <button
        type="button"
        className="pg-send"
        disabled={!n}
        onClick={() =>
          send({
            title: `Новый заказ · ${n} шт.`,
            lines: items.filter((p) => cart[p.id]).map((p) => [p.name, `${cart[p.id]} × ${rub(p.price)}`] as [string, string]),
            total: `Итого: ${rub(sum)}`,
          })
        }
      >
        Оформить заказ
      </button>
    </>
  );
}

function Glamping({ send }: { send: Send }) {
  const [house, setHouse] = useState<string>(houses[0].id);
  const [nights, setNights] = useState(2);
  const h = houses.find((x) => x.id === house)!;
  // одна ночь выходная, остальные будни — как в типичной поездке пт–вс
  const sum = h.weekend + (nights - 1) * h.weekday;
  const total = useTween(sum);
  return (
    <>
      <div className="pg-chips">
        {houses.map((x) => (
          <button key={x.id} type="button" aria-pressed={house === x.id} onClick={() => setHouse(x.id)}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="pg-row">
        <span>Ночей с пятницы</span>
        <span className="pg-qty">
          <button type="button" aria-label="Меньше" onClick={() => setNights(Math.max(1, nights - 1))}>
            −
          </button>
          <output>{nights}</output>
          <button type="button" aria-label="Больше" onClick={() => setNights(Math.min(7, nights + 1))}>
            +
          </button>
        </span>
      </div>
      <div className="pg-total">
        <span>
          {nights} {plural(nights, "ночь", "ночи", "ночей")}
        </span>
        <b>{rub(total)}</b>
      </div>
      <button
        type="button"
        className="pg-send"
        onClick={() =>
          send({
            title: "Новая бронь",
            lines: [
              ["Домик", h.name],
              ["Заезд", `пятница, ${nights} ${plural(nights, "ночь", "ночи", "ночей")}`],
            ],
            total: `Сумма: ${rub(sum)}`,
          })
        }
      >
        Забронировать
      </button>
    </>
  );
}

export function Playground() {
  const [tab, setTab] = useState<Tab>("remont");
  const [messages, setMessages] = useState<TgMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const timer = useRef(0);
  const phone = useRef<HTMLDivElement>(null);

  const send: Send = (m) => {
    window.clearTimeout(timer.current);
    setTyping(true);
    // на телефоне чат под формой — показываем его
    if (window.innerWidth < 620) phone.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    timer.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((list) => [...list.slice(-4), makeMessage(m)]);
    }, 750);
  };

  return (
    <div className="pg">
      <div className="pg-site">
        <div className="pg-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>ваш-сайт.ru</span>
        </div>
        <div className="pg-tabs" role="tablist" aria-label="Пример сайта">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="pg-body" key={tab}>
          {tab === "remont" && <Remont send={send} />}
          {tab === "barber" && <Barber send={send} />}
          {tab === "shop" && <Shop send={send} />}
          {tab === "glamping" && <Glamping send={send} />}
        </div>
      </div>
      <div className="pg-phone" ref={phone}>
        <TgChat messages={messages} typing={typing} hint="Нажмите кнопку в примере сайта — заявка придёт сюда" />
        <p className="pg-note">Так заявки видит владелец. Демо — ничего не отправляется.</p>
      </div>
    </div>
  );
}

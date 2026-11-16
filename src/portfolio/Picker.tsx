import { useEffect, useState } from "react";
import { contacts } from "../shared/contacts";
import { projects } from "./projects";

// Подбор сайта под бизнес посетителя: выбрал нишу — увидел готовый сайт и что он делает
const niches: { id: string; label: string; result: string; does: string[]; ping: [string, string] }[] = [
  {
    id: "remont",
    label: "Ремонт",
    result: "Клиент приходит уже с бюджетом",
    does: ["Смету считает сам — по площади и типу ремонта", "Вы получаете площадь, сумму и удобное время замера", "Меньше звонков «а сколько стоит?»"],
    ping: ["Заявка на замер", "54 м², капитальный · 559–657 тыс. ₽"],
  },
  {
    id: "barber",
    label: "Барбершоп",
    result: "Запись идёт, пока вы стрижёте",
    does: ["Клиент видит только свободные окна мастера", "Длинная услуга не встанет на занятое время", "Имя, услуга и время сразу у вас в телефоне"],
    ping: ["Новая запись", "Фейд · Тимур · завтра, 18:30"],
  },
  {
    id: "shop",
    label: "Магазин",
    result: "Заказ без переписки в директе",
    does: ["Фильтры подбирают товар под покупателя", "Корзина не теряется после закрытия вкладки", "Состав заказа, адрес и сумма — сразу вам"],
    ping: ["Новый заказ · 3 шт.", "Монстера, пилея · 5 750 ₽"],
  },
  {
    id: "glamping",
    label: "Отдых",
    result: "Цена за даты — без вопросов в личку",
    does: ["Календарь показывает только свободные ночи", "Выходные и допы считаются автоматически", "Даты, гости и сумма брони — у вас"],
    ping: ["Новая бронь", "А-фрейм · пт–вс · 21 300 ₽"],
  },
  {
    id: "driada",
    label: "Производство",
    result: "Каталог, который владелец обновляет сам",
    does: ["Товары, акции и телефоны меняются в админке", "Звонок с карточки товара в одно касание", "Филиалы с адресами и картой"],
    ping: ["Звонок с сайта", "Стол обеденный из сосны"],
  },
];

export function Picker() {
  const [id, setId] = useState(niches[0].id);
  const [ping, setPing] = useState(false);
  const n = niches.find((x) => x.id === id)!;
  const p = projects.find((x) => x.id === id)!;

  // уведомление «прилетает» через секунду после выбора ниши
  useEffect(() => {
    setPing(false);
    const t = setTimeout(() => setPing(true), 900);
    return () => clearTimeout(t);
  }, [id]);

  return (
    <div className="picker">
      <div className="picker-ask">
        <span>Ваш бизнес:</span>
        <div className="picker-chips" role="tablist" aria-label="Ниша">
          {niches.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={id === x.id} onClick={() => setId(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stage" style={{ "--tint": p.tint } as React.CSSProperties}>
        <a className="stage-shot" href={p.url} target={p.real ? "_blank" : undefined} rel={p.real ? "noopener" : undefined} aria-label={`Открыть сайт: ${p.niche}`}>
          <img key={p.id} src={p.shot} alt="" width={1280} height={800} />
          {ping && (
            <span className="ping" role="status">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d="M21.5 4.3 2.9 11.5c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5Z" />
              </svg>
              <span>
                <b>{n.ping[0]}</b>
                {n.ping[1]}
              </span>
            </span>
          )}
        </a>
        <div className="stage-info" key={n.id}>
          <span className="stage-kind">{p.real ? "Реальный проект" : "Демо"} · {p.niche}</span>
          <h3>{n.result}</h3>
          <ul>
            {n.does.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <div className="stage-cta">
            <a className="dark-btn" href={p.url} target={p.real ? "_blank" : undefined} rel={p.real ? "noopener" : undefined}>
              Потыкать сайт ↗
            </a>
            <a className="text-link" href={contacts.telegramUrl} target="_blank" rel="noopener">
              Хочу такой
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

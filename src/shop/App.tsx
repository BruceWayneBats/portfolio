import { useEffect, useMemo, useState } from "react";
import { DemoBadge, makeMessage, SentSheet, type TgMessage } from "../shared/tg";
import { useLockScroll, useReveal, useStored } from "../shared/hooks";
import { maskPhone, phoneOk, plural, rub } from "../shared/format";
import { DELIVERY, FREE_DELIVERY_FROM, lightNames, plantCats, plants, type Light, type Plant } from "../shared/data";
import { PlantArt } from "./PlantArt";

type Cart = Record<string, number>;
type Sort = "pop" | "cheap" | "expensive";

function Card({ p, onOpen, onAdd, inCart }: { p: Plant; onOpen: () => void; onAdd: () => void; inCart: number }) {
  return (
    <article className="card" data-reveal>
      <button type="button" className="card-art" onClick={onOpen} aria-label={`Подробнее: ${p.name}`}>
        {p.hit && <span className="hit">Хит</span>}
        {p.easy && <span className="easy">Неприхотливое</span>}
        <PlantArt plant={p} className="art" />
      </button>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p className="latin">{p.latin}</p>
        <p className="meta">
          {lightNames[p.light]} · {p.height} см
        </p>
        <div className="card-buy">
          <b>{rub(p.price)}</b>
          <button type="button" className={`add ${inCart ? "in" : ""}`} onClick={onAdd}>
            {inCart ? `В корзине · ${inCart}` : "В корзину"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Quick({ p, onClose, onAdd }: { p: Plant | null; onClose: () => void; onAdd: (id: string) => void }) {
  useLockScroll(!!p);
  if (!p) return null;
  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="quick" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
        <div className="quick-art">
          <PlantArt plant={p} className="art" />
        </div>
        <div className="quick-info">
          <h3>{p.name}</h3>
          <p className="latin">{p.latin}</p>
          <p>{p.text}</p>
          <dl>
            <div>
              <dt>Свет</dt>
              <dd>{lightNames[p.light]}</dd>
            </div>
            <div>
              <dt>Высота</dt>
              <dd>{p.height} см</dd>
            </div>
            <div>
              <dt>Уход</dt>
              <dd>{p.easy ? "Простой" : "Внимательный"}</dd>
            </div>
          </dl>
          <div className="card-buy">
            <b>{rub(p.price)}</b>
            <button type="button" className="add" onClick={() => (onAdd(p.id), onClose())}>
              В корзину
            </button>
          </div>
        </div>
        <button type="button" className="x" aria-label="Закрыть" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

function CartDrawer({
  open,
  cart,
  setCart,
  onClose,
  onOrder,
}: {
  open: boolean;
  cart: Cart;
  setCart: (c: Cart) => void;
  onClose: () => void;
  onOrder: (m: TgMessage) => void;
}) {
  useLockScroll(open);
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [how, setHow] = useState<"courier" | "pickup">("courier");
  const [addr, setAddr] = useState("");
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (!open) setCheckout(false);
  }, [open]);

  const items = Object.entries(cart)
    .map(([id, q]) => ({ p: plants.find((x) => x.id === id)!, q }))
    .filter((x) => x.p);
  const sum = items.reduce((s, { p, q }) => s + p.price * q, 0);
  const delivery = how === "pickup" || sum >= FREE_DELIVERY_FROM ? 0 : DELIVERY;
  const left = FREE_DELIVERY_FROM - sum;
  const setQ = (id: string, q: number) => {
    const next = { ...cart };
    if (q <= 0) delete next[id];
    else next[id] = q;
    setCart(next);
  };
  const valid = name.trim() && phoneOk(phone) && (how === "pickup" || addr.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onOrder(
      makeMessage({
        title: `Новый заказ · ${items.reduce((s, x) => s + x.q, 0)} шт.`,
        lines: [
          ...items.map(({ p, q }) => [p.name, `${q} × ${rub(p.price)}`] as [string, string]),
          ["Клиент", `${name.trim()}, ${phone}`],
          ["Получение", how === "pickup" ? "самовывоз" : `курьер, ${addr.trim()}`],
        ],
        total: `Итого: ${rub(sum + delivery)}`,
      }),
    );
    setCart({});
    setName("");
    setPhone("");
    setAddr("");
    setTouched(false);
    onClose();
  };

  return (
    <>
      <div className={`drawer-back ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open} aria-label="Корзина">
        <div className="drawer-head">
          <h3>{checkout ? "Оформление" : "Корзина"}</h3>
          <button type="button" className="x" aria-label="Закрыть корзину" onClick={onClose}>
            ×
          </button>
        </div>
        {items.length === 0 ? (
          <div className="empty">
            <p>Пока пусто.</p>
            <button type="button" className="add" onClick={onClose}>
              К растениям
            </button>
          </div>
        ) : !checkout ? (
          <>
            <ul className="lines">
              {items.map(({ p, q }) => (
                <li key={p.id}>
                  <PlantArt plant={p} className="line-art" />
                  <div>
                    <b>{p.name}</b>
                    <span>{rub(p.price * q)}</span>
                  </div>
                  <div className="qty">
                    <button type="button" aria-label="Меньше" onClick={() => setQ(p.id, q - 1)}>
                      −
                    </button>
                    <output>{q}</output>
                    <button type="button" aria-label="Больше" onClick={() => setQ(p.id, q + 1)}>
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              {left > 0 ? (
                <div className="free-bar">
                  <span>До бесплатной доставки {rub(left)}</span>
                  <i style={{ "--p": `${(sum / FREE_DELIVERY_FROM) * 100}%` } as React.CSSProperties} />
                </div>
              ) : (
                <p className="free-ok">Доставка бесплатно</p>
              )}
              <div className="total">
                <span>Товары</span>
                <b>{rub(sum)}</b>
              </div>
              <button type="button" className="go" onClick={() => setCheckout(true)}>
                Оформить заказ
              </button>
            </div>
          </>
        ) : (
          <form className="checkout" onSubmit={submit} noValidate>
            <input id="shop-name" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={touched && !name.trim()} />
            <input
              id="shop-phone"
              type="tel"
              inputMode="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              aria-invalid={touched && !phoneOk(phone)}
            />
            <div className="seg" role="radiogroup" aria-label="Способ получения">
              <button type="button" role="radio" aria-checked={how === "courier"} onClick={() => setHow("courier")}>
                Курьер {sum >= FREE_DELIVERY_FROM ? "· 0 ₽" : `· ${rub(DELIVERY)}`}
              </button>
              <button type="button" role="radio" aria-checked={how === "pickup"} onClick={() => setHow("pickup")}>
                Самовывоз
              </button>
            </div>
            {how === "courier" && (
              <input id="shop-addr" placeholder="Адрес доставки" value={addr} onChange={(e) => setAddr(e.target.value)} aria-invalid={touched && !addr.trim()} />
            )}
            {touched && !valid && <p className="err">Заполните имя, телефон{how === "courier" ? " и адрес" : ""}.</p>}
            <div className="total">
              <span>К оплате при получении</span>
              <b>{rub(sum + delivery)}</b>
            </div>
            <button className="go">Подтвердить заказ</button>
            <button type="button" className="back" onClick={() => setCheckout(false)}>
              ← Назад в корзину
            </button>
          </form>
        )}
      </aside>
    </>
  );
}

export function App() {
  useReveal();
  const [cart, setCart] = useStored<Cart>("green-corner-cart", {});
  const [cat, setCat] = useState<string>("all");
  const [light, setLight] = useState<Light | "all">("all");
  const [easy, setEasy] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("pop");
  const [quick, setQuick] = useState<Plant | null>(null);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [sent, setSent] = useState<TgMessage | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const r = plants.filter(
      (p) =>
        (cat === "all" || p.cat === cat) &&
        (light === "all" || p.light === light) &&
        (!easy || p.easy) &&
        (!s || p.name.toLowerCase().includes(s) || p.latin.toLowerCase().includes(s)),
    );
    if (sort === "cheap") r.sort((a, b) => a.price - b.price);
    if (sort === "expensive") r.sort((a, b) => b.price - a.price);
    if (sort === "pop") r.sort((a, b) => Number(!!b.hit) - Number(!!a.hit));
    return r;
  }, [cat, light, easy, q, sort]);

  const count = Object.values(cart).reduce((s, x) => s + x, 0);
  const add = (id: string) => {
    setCart({ ...cart, [id]: (cart[id] ?? 0) + 1 });
    setBump((b) => b + 1);
  };
  const reset = () => (setCat("all"), setLight("all"), setEasy(false), setQ(""));

  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <a href="#" className="logo">
            <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
              <path d="M14 26V12" stroke="var(--deep)" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M14 13C14 6 19 3 25 3c0 7-4 10-11 10Z" fill="var(--leaf)" />
              <path d="M14 17C14 11 10 8 3 8c0 6 4 9 11 9Z" fill="var(--deep)" />
            </svg>
            зелёный угол
          </a>
          <label className="search">
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m14 14 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input id="shop-search" type="search" placeholder="Монстера, кактус…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск" />
          </label>
          <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Корзина, ${count} товаров`}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M5 8h14l-1.4 11.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8Z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            {count > 0 && (
              <span key={bump} className="count">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="wrap">
        <section className="hero" data-reveal>
          <h1>
            Растения, которые <em>не погибнут</em> у вас дома
          </h1>
          <p>Отметьте, сколько света в комнате, — покажем только те, что приживутся. Доставка по городу в день заказа.</p>
        </section>

        <div className="filters">
          <div className="chips" role="tablist" aria-label="Категория">
            {plantCats.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} className="chip" onClick={() => setCat(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
          <div className="filters-row">
            <div className="seg small" role="radiogroup" aria-label="Освещение">
              {(["all", "shade", "half", "sun"] as const).map((l) => (
                <button key={l} type="button" role="radio" aria-checked={light === l} onClick={() => setLight(l)}>
                  {l === "all" ? "Любой свет" : lightNames[l]}
                </button>
              ))}
            </div>
            <label className="toggle">
              <input type="checkbox" checked={easy} onChange={(e) => setEasy(e.target.checked)} />
              <span />
              Неприхотливые
            </label>
            <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Сортировка">
              <option value="pop">Сначала популярные</option>
              <option value="cheap">Сначала дешевле</option>
              <option value="expensive">Сначала дороже</option>
            </select>
          </div>
          <p className="found">
            {list.length} {plural(list.length, "растение", "растения", "растений")}
          </p>
        </div>

        {list.length ? (
          <div className="grid">
            {list.map((p) => (
              <Card key={p.id} p={p} inCart={cart[p.id] ?? 0} onOpen={() => setQuick(p)} onAdd={() => add(p.id)} />
            ))}
          </div>
        ) : (
          <div className="nothing">
            <p>Под такие условия ничего не нашлось.</p>
            <button type="button" className="add" onClick={reset}>
              Сбросить фильтры
            </button>
          </div>
        )}

        <section className="perks">
          {[
            ["В день заказа", "Курьер привезёт в тёплой упаковке"],
            ["Гарантия 14 дней", "Не прижилось — заменим"],
            [`От ${rub(FREE_DELIVERY_FROM)}`, "Доставка бесплатно"],
          ].map(([t, d], i) => (
            <div key={t} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              <b>{t}</b>
              <span>{d}</span>
            </div>
          ))}
        </section>
      </main>

      <footer className="foot wrap">Магазин вымышлен — это демо-сайт. Корзина сохраняется в вашем браузере.</footer>

      <Quick p={quick} onClose={() => setQuick(null)} onAdd={add} />
      <CartDrawer open={open} cart={cart} setCart={setCart} onClose={() => setOpen(false)} onOrder={setSent} />
      <SentSheet message={sent} onClose={() => setSent(null)} title="Заказ принят" />
      <DemoBadge />
    </>
  );
}

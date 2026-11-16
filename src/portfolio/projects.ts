const base = import.meta.env.BASE_URL;

export type Project = {
  id: string;
  url: string;
  shot: string;
  tag: string;
  niche: string;
  hook: string;
  features: string[];
  tint: string;
  real?: boolean;
};

export const projects: Project[] = [
  {
    id: "driada",
    url: "https://brucewaynebats.github.io/driada-demo-motion/",
    shot: `${base}shots/driada.webp`,
    tag: "Реальный проект",
    niche: "Деревообработка · каталог",
    hook: "Каталог, который владелец правит сам",
    features: ["Админка без программиста", "Звонок в одно касание", "3 филиала с картой"],
    tint: "#e6d6bd",
    real: true,
  },
  {
    id: "remont",
    url: `${base}remont/`,
    shot: `${base}shots/remont.webp`,
    tag: "Демо",
    niche: "Ремонт и отделка",
    hook: "Смета за 10 секунд вместо звонка",
    features: ["Калькулятор по площади", "Разбивка цены", "Заявка на замер"],
    tint: "#f3d58c",
  },
  {
    id: "barber",
    url: `${base}barber/`,
    shot: `${base}shots/barber.webp`,
    tag: "Демо",
    niche: "Барбершоп",
    hook: "Свободные окна видно сразу",
    features: ["Выбор мастера", "Слоты по длительности", "Запись за 20 секунд"],
    tint: "#cdbb9b",
  },
  {
    id: "shop",
    url: `${base}shop/`,
    shot: `${base}shots/shop.webp`,
    tag: "Демо",
    niche: "Магазин растений",
    hook: "Корзина и заказ без регистрации",
    features: ["Фильтры и поиск", "Корзина сохраняется", "Бесплатная доставка от суммы"],
    tint: "#c4dfb8",
  },
  {
    id: "glamping",
    url: `${base}glamping/`,
    shot: `${base}shots/glamping.webp`,
    tag: "Демо",
    niche: "Глэмпинг",
    hook: "Цена за даты считается сама",
    features: ["Календарь свободных дат", "Выходные дороже", "Баня и завтраки допами"],
    tint: "#f2c9aa",
  },
];

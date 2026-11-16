// Данные и расчёты демо-сайтов. Общие для самих демо и для мини-версий на главной портфолио.
import { seeded } from "./format";

/* ---------- Ремонт «Метр» ---------- */

export const repairTypes = [
  { id: "cosmetic", name: "Косметический", perM2: 4500, daysPerM2: 0.45, note: "обои, покраска, полы" },
  { id: "capital", name: "Капитальный", perM2: 9500, daysPerM2: 0.9, note: "стяжка, штукатурка, проводка" },
  { id: "design", name: "Под ключ с дизайном", perM2: 14500, daysPerM2: 1.25, note: "проект, закупка, мебель" },
] as const;

export const repairExtras = [
  { id: "demolition", name: "Демонтаж старой отделки", perM2: 600 },
  { id: "electric", name: "Новая электрика", perM2: 1200 },
  { id: "materials", name: "Черновые материалы с доставкой", perM2: 3500 },
] as const;

export const BATHROOM_PRICE = 95000;

export type RepairInput = {
  type: (typeof repairTypes)[number]["id"];
  area: number;
  bathrooms: number;
  extras: string[];
};

export function repairEstimate({ type, area, bathrooms, extras }: RepairInput) {
  const t = repairTypes.find((x) => x.id === type)!;
  const base = t.perM2 * area;
  const extra = repairExtras.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.perM2 * area, 0);
  const bath = bathrooms * BATHROOM_PRICE;
  const total = base + extra + bath;
  const days = Math.ceil(t.daysPerM2 * area + bathrooms * 6);
  return {
    total,
    from: Math.round((total * 0.92) / 1000) * 1000,
    to: Math.round((total * 1.08) / 1000) * 1000,
    weeks: Math.max(1, Math.round(days / 6)),
    parts: [
      [`${t.name} ремонт`, base],
      ...repairExtras.filter((e) => extras.includes(e.id)).map((e) => [e.name, e.perM2 * area] as [string, number]),
      ...(bathrooms ? [[`Санузел под ключ × ${bathrooms}`, bath] as [string, number]] : []),
    ] as [string, number][],
  };
}

/* ---------- Барбершоп «Гребень» ---------- */

export const barberServices = [
  { id: "cut", name: "Мужская стрижка", price: 1800, min: 60 },
  { id: "fade", name: "Фейд с укладкой", price: 2100, min: 60 },
  { id: "combo", name: "Стрижка + борода", price: 2900, min: 90 },
  { id: "beard", name: "Моделирование бороды", price: 1300, min: 30 },
  { id: "kids", name: "Детская стрижка", price: 1300, min: 45 },
  { id: "father", name: "Отец + сын", price: 2900, min: 90 },
] as const;

export const barbers = [
  { id: "artem", name: "Артём", role: "Топ-барбер", years: 9, k: 1.2, hue: 28 },
  { id: "timur", name: "Тимур", role: "Барбер", years: 5, k: 1, hue: 200 },
  { id: "ilya", name: "Илья", role: "Барбер", years: 3, k: 1, hue: 140 },
] as const;

export const OPEN = 10 * 60;
export const CLOSE = 21 * 60;
export const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const nextDays = (n: number) => {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
};

// Занятые получасовые слоты мастера на день (одинаковые при каждом заходе)
export function busySlots(barberId: string, day: Date) {
  const rnd = seeded(`${barberId}-${day.toDateString()}`);
  const busy = new Set<number>();
  for (let m = OPEN; m < CLOSE; m += 30) if (rnd() < 0.38) busy.add(m);
  return busy;
}

// Время начала, на которое услуга помещается целиком
export function freeStarts(barberId: string, day: Date, duration: number) {
  const busy = busySlots(barberId, day);
  const now = new Date();
  const today = day.toDateString() === now.toDateString();
  const nowMin = now.getHours() * 60 + now.getMinutes() + 30;
  const out: number[] = [];
  for (let m = OPEN; m + duration <= CLOSE; m += 30) {
    if (today && m < nowMin) continue;
    let ok = true;
    for (let k = m; k < m + duration; k += 30) if (busy.has(k)) ok = false;
    if (ok) out.push(m);
  }
  return out;
}

/* ---------- Магазин растений «Зелёный угол» ---------- */

export type PlantShape = "monstera" | "ficus" | "snake" | "cactus" | "trailing" | "palm" | "round" | "succulent";
export type Light = "shade" | "half" | "sun";

export type Plant = {
  id: string;
  name: string;
  latin: string;
  price: number;
  cat: "big" | "compact" | "succulent" | "hanging";
  light: Light;
  easy: boolean;
  height: number;
  shape: PlantShape;
  leaf: string;
  pot: string;
  hit?: boolean;
  text: string;
};

export const plantCats = [
  { id: "all", name: "Все" },
  { id: "big", name: "Крупные" },
  { id: "compact", name: "Компактные" },
  { id: "succulent", name: "Суккуленты" },
  { id: "hanging", name: "Ампельные" },
] as const;

export const lightNames: Record<Light, string> = { shade: "Тень", half: "Полутень", sun: "Солнце" };

export const plants: Plant[] = [
  { id: "monstera", name: "Монстера", latin: "Monstera deliciosa", price: 3900, cat: "big", light: "half", easy: true, height: 90, shape: "monstera", leaf: "#2f6b45", pot: "#d9cbb4", hit: true, text: "Резные листья и быстрый рост. Прощает пропущенный полив." },
  { id: "ficus", name: "Фикус лировидный", latin: "Ficus lyrata", price: 5200, cat: "big", light: "sun", easy: false, height: 110, shape: "ficus", leaf: "#3e7a3a", pot: "#c97b5a", text: "Крупные листья-скрипки. Любит постоянное место у окна." },
  { id: "sansevieria", name: "Сансевиерия", latin: "Sansevieria trifasciata", price: 1600, cat: "compact", light: "shade", easy: true, height: 45, shape: "snake", leaf: "#4d7a3e", pot: "#2f3b36", hit: true, text: "Почти неубиваемая. Поливать раз в 2–3 недели." },
  { id: "zamioculcas", name: "Замиокулькас", latin: "Zamioculcas zamiifolia", price: 2300, cat: "compact", light: "shade", easy: true, height: 55, shape: "palm", leaf: "#2d6a3a", pot: "#e8e2d6", text: "Глянцевые листья, растёт даже в коридоре." },
  { id: "pothos", name: "Сциндапсус", latin: "Epipremnum aureum", price: 1200, cat: "hanging", light: "half", easy: true, height: 30, shape: "trailing", leaf: "#5c9a3c", pot: "#d6a77a", hit: true, text: "Длинные плети для полки или кашпо." },
  { id: "ceropegia", name: "Церопегия", latin: "Ceropegia woodii", price: 1400, cat: "hanging", light: "sun", easy: false, height: 20, shape: "trailing", leaf: "#6e8f7a", pot: "#eadfd0", text: "Нити с листьями-сердечками." },
  { id: "echeveria", name: "Эхеверия", latin: "Echeveria elegans", price: 650, cat: "succulent", light: "sun", easy: true, height: 10, shape: "succulent", leaf: "#8fb3a6", pot: "#c97b5a", text: "Каменная роза для солнечного подоконника." },
  { id: "cereus", name: "Цереус", latin: "Cereus peruvianus", price: 1900, cat: "succulent", light: "sun", easy: true, height: 60, shape: "cactus", leaf: "#58876a", pot: "#2f3b36", text: "Стройный кактус-колонна. Полив раз в месяц." },
  { id: "pilea", name: "Пилея", latin: "Pilea peperomioides", price: 950, cat: "compact", light: "half", easy: true, height: 25, shape: "round", leaf: "#4f9a4a", pot: "#f0e6d6", hit: true, text: "Круглые листья-монетки. Быстро даёт деток." },
  { id: "strelitzia", name: "Стрелиция", latin: "Strelitzia nicolai", price: 6900, cat: "big", light: "sun", easy: false, height: 140, shape: "palm", leaf: "#3b6e4a", pot: "#e8e2d6", text: "Банановые листья, тропики в гостиной." },
  { id: "peperomia", name: "Пеперомия", latin: "Peperomia obtusifolia", price: 850, cat: "compact", light: "shade", easy: true, height: 20, shape: "round", leaf: "#3d7b3f", pot: "#c97b5a", text: "Плотные листья, компактный куст для стола." },
  { id: "haworthia", name: "Хавортия", latin: "Haworthia fasciata", price: 550, cat: "succulent", light: "half", easy: true, height: 8, shape: "succulent", leaf: "#456f5a", pot: "#2f3b36", text: "Полосатая розетка, не боится тени." },
  { id: "hoya", name: "Хойя", latin: "Hoya carnosa", price: 1500, cat: "hanging", light: "half", easy: true, height: 35, shape: "trailing", leaf: "#3c7350", pot: "#d9cbb4", text: "Восковые листья и душистые цветы." },
  { id: "alocasia", name: "Алоказия", latin: "Alocasia zebrina", price: 3400, cat: "big", light: "half", easy: false, height: 70, shape: "monstera", leaf: "#2b5e3e", pot: "#2f3b36", text: "Листья-стрелы на полосатых черешках." },
];

export const DELIVERY = 390;
export const FREE_DELIVERY_FROM = 5000;

/* ---------- Глэмпинг «Тихий берег» ---------- */

export const houses = [
  { id: "aframe", name: "А-фрейм у воды", guests: 2, weekday: 7500, weekend: 9800, text: "Панорамное окно на озеро, печь, терраса." },
  { id: "dome", name: "Купол под звёздами", guests: 3, weekday: 8900, weekend: 11500, text: "Прозрачный потолок над кроватью, тёплый пол." },
  { id: "family", name: "Семейный дом", guests: 6, weekday: 14000, weekend: 18500, text: "Две спальни, кухня, своя купель." },
] as const;

export const glampExtras = [
  { id: "sauna", name: "Баня на дровах", price: 3500, per: "stay" },
  { id: "breakfast", name: "Завтраки в домик", price: 700, per: "guestNight" },
  { id: "sup", name: "Сапборды на день", price: 1500, per: "night" },
  { id: "pet", name: "С питомцем", price: 1000, per: "stay" },
] as const;

export const isWeekendNight = (d: Date) => d.getDay() === 5 || d.getDay() === 6;
export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Занятые ночи домика на ближайшие 3 месяца
export function bookedNights(houseId: string) {
  const rnd = seeded(`glamp-${houseId}`);
  const out = new Set<string>();
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 95; ) {
    if (rnd() < 0.16) {
      const len = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < len; k++) {
        const x = new Date(d);
        x.setDate(d.getDate() + i + k);
        out.add(dayKey(x));
      }
      i += len + 1;
    } else i++;
  }
  return out;
}

export function glampPrice(houseId: string, checkIn: Date, checkOut: Date, guests: number, extras: string[]) {
  const h = houses.find((x) => x.id === houseId)!;
  const nights: Date[] = [];
  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) nights.push(new Date(d));
  const weekend = nights.filter(isWeekendNight).length;
  const stay = (nights.length - weekend) * h.weekday + weekend * h.weekend;
  const ex = glampExtras
    .filter((e) => extras.includes(e.id))
    .map((e) => {
      const sum = e.per === "stay" ? e.price : e.per === "night" ? e.price * nights.length : e.price * guests * nights.length;
      return [e.name, sum] as [string, number];
    });
  return { nights: nights.length, weekend, stay, extras: ex, total: stay + ex.reduce((s, [, v]) => s + v, 0) };
}

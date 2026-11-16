export const rub = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

export const time = (d = new Date()) => d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
export const dayLabel = (d: Date) => `${days[d.getDay()]}, ${d.getDate()} ${d.toLocaleString("ru-RU", { month: "short" }).replace(".", "")}`;

// Маска телефона: +7 (999) 123-45-67
export const maskPhone = (raw: string) => {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let s = "+7";
  if (p[0]) s += ` (${p[0]}`;
  if (p[0].length === 3) s += ")";
  if (p[1]) s += ` ${p[1]}`;
  if (p[2]) s += `-${p[2]}`;
  if (p[3]) s += `-${p[3]}`;
  return s;
};

export const phoneOk = (s: string) => s.replace(/\D/g, "").length === 11;

// Детерминированный «случайный» генератор: занятые слоты и даты одинаковы при каждом заходе
export const seeded = (seed: string) => {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

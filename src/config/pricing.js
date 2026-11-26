/**
 * Narxlar sahifasi (/narxlar/) shu fayldan chiziladi. Narx o'zgarsa, faqat shu yerni o'zgartiring.
 * Summalar so'mda, bitta filial uchun, bir martalik to'lov (oylik to'lov yo'q).
 * Matn o'zgarsa, locales/ru.json kalitini ham yangilang.
 */

/** Modullar. angle: kalkulyatordagi orbitada joylashuvi (gradus, 0 = tepada). */
export const FEATURES = [
  { name: 'AI kamera nazorati', angle: 0 },
  { name: 'Telegram orqali xabar va tasdiqlash', angle: 72 },
  { name: 'Haftalik hisobot va tahlil', angle: 144 },
  { name: 'Face ID davomat va maosh hisobi', angle: 216 },
  { name: 'Dars almashtirish tizimi', angle: 288 },
];

/** Har bir paketga kiradigan, orbitada ko'rsatilmaydigan ish. */
export const ALWAYS_INCLUDED = "O'rnatish, sozlash va o'rgatish";

export const PACKAGES = [
  {
    id: 'nazorat',
    name: 'Nazorat',
    summary: 'Kamera AI va hisobot',
    price: 8_000_000,
    features: [0, 1, 2],
  },
  {
    id: 'xodim',
    name: 'Nazorat + Xodim',
    summary: 'Kamera AI, hisobot va xodimlar davomati',
    price: 13_000_000,
    features: [0, 1, 2, 3],
    recommended: true,
  },
  {
    id: 'toliq',
    name: "To'liq",
    summary: 'Barcha modullar bitta tizimda',
    price: 18_000_000,
    features: [0, 1, 2, 3, 4],
  },
];

/** Shuncha va undan ko'p filialga chegirma beriladi. */
export const NETWORK_DISCOUNT = { minBranches: 3, percent: 15 };

export const INSTITUTIONS = ["Bog'cha", 'Maktab', "Akademiya yoki o'quv markazi"];

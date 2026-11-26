export const SITE_NAME = 'Nex Traces';

/** Sayt manzili. O'z domeningiz ulansa, shu yerni almashtiring. Oxirida "/" bo'lmasin. */
export const SITE_URL = 'https://nex-traces.vercel.app';

export const META = {
  uz: {
    title: "Nex Traces | Bog'cha va maktablar uchun AI kamera nazorati",
    description:
      "Nex Traces bog'cha, maktab va akademiyalardagi mavjud kameralarni sun'iy intellektga ulaydi: muhim vaziyat o'zi topiladi, mas'ul xodimga yuboriladi va rahbar tayyor hisobot oladi.",
    ogLocale: 'uz_UZ',
  },
  ru: {
    title: 'Nex Traces | AI-контроль камер для детсадов и школ',
    description:
      'Nex Traces подключает существующие камеры детсадов, школ и академий к искусственному интеллекту: важная ситуация находится сама, уходит ответственному, а руководитель получает готовый отчёт.',
    ogLocale: 'ru_RU',
  },
};

/** Narxlar sahifasi (/narxlar/) sarlavhasi va tavsifi. */
export const PRICING_META = {
  uz: {
    title: 'Narxlar | Nex Traces AI kamera nazorati',
    description:
      "Bog'cha, maktab va akademiyalar uchun AI kamera nazorati paketlari va narxlari. Filiallar sonini tanlab, taxminiy narxni hisoblang.",
    ogLocale: 'uz_UZ',
  },
  ru: {
    title: 'Цены | Nex Traces AI-контроль камер',
    description:
      'Пакеты и цены AI-контроля камер для детсадов, школ и академий. Выберите количество филиалов и рассчитайте примерную стоимость.',
    ogLocale: 'ru_RU',
  },
};

/** Saytdagi sahifalar: yo'l (til prefiksisiz), build'dagi fayl va meta. */
export const PAGES = [
  { path: '', file: 'index.html', meta: META },
  { path: 'narxlar/', file: 'narxlar/index.html', meta: PRICING_META },
];

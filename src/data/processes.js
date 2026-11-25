import { chatMessages, classroomScheme, detailList, screen } from './screens.js';

/** Birinchi ekrandagi to'rtta jarayon. Matn o'zgarsa, locales/ru.json kalitini ham yangilang. */
export const PROCESSES = [
  {
    title: "Sinf o'qituvchisiz qoldi",
    screen: screen('Kamera sxemasi', 'A1 kodi', classroomScheme()),
    steps: [
      { title: 'Kamera', text: 'Oqim RTSP orqali olinadi' },
      { title: 'AI', text: 'Odamlarni topadi va vaziyatni baholaydi' },
      { title: "Mas'ul xodim", text: "Telegramda To'g'ri yoki Xato bosadi" },
      { title: 'Hisobot', text: 'Tasdiqlangan holat statistikaga tushadi' },
    ],
  },
  {
    title: 'Xodim ishga keldi',
    screen: screen(
      'Xodim+',
      'Davomat',
      detailList([
        ['Kirish', '08:54'],
        ['Ish boshlanishi', '09:00'],
        ['Yuz mosligi', 'Tasdiqlandi'],
        ['Joylashuv', 'Filial hududida'],
      ]),
    ),
    steps: [
      { title: 'Belgilanish', text: 'Telefon yoki Face ID terminal' },
      { title: 'Tekshiruv', text: 'Yuz va joylashuv solishtiriladi' },
      { title: 'Davomat', text: "Jadval bo'yicha kechikish hisoblanadi" },
      { title: 'Maosh', text: "Oy yakunida hisob tayyor bo'ladi" },
    ],
  },
  {
    title: "CRM bo'yicha savol",
    screen: screen(
      'AI yordamchi',
      'amoCRM',
      chatMessages([
        { text: "Bugun qaysi mijozlar bilan bog'lanish kerak?", own: true },
        { text: '<code>list_tasks, get_lead</code>' },
        {
          text: "Bugungi vazifalar topildi. Birinchi navbatda javob kutayotgan uchta mijozni ko'ring.",
        },
      ]),
    ),
    steps: [
      { title: 'Savol', text: 'Rahbar oddiy tilda yozadi' },
      { title: 'AI', text: 'Kerakli CRM amalini tanlaydi' },
      { title: 'CRM', text: 'Bitim, kontakt va vazifalar olinadi' },
      { title: 'Javob', text: "Natija suhbatda ko'rinadi" },
    ],
  },
  {
    title: "O'qituvchi kela olmaydi",
    screen: screen(
      "O'rinbosar tizimi",
      'Telegram',
      chatMessages([
        { text: "7-B, matematika, 11:00. O'rinbosar kerak." },
        { text: "Dars vaqti bo'sh bo'lgan nomzodlarga taklif yuborildi." },
        { text: 'Qabul qilaman', own: true },
      ]),
    ),
    steps: [
      { title: 'Xabar', text: "O'qituvchi kela olmasligini bildiradi" },
      { title: 'Tanlov', text: 'Jadval va qoidalar tekshiriladi' },
      { title: 'Taklif', text: 'Nomzod Telegramda javob beradi' },
      { title: 'Panel', text: "Rahbariyat natijani ko'radi" },
    ],
  },
];

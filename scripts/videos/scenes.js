/** Videolar mazmuni. Har bir matn [o'zbekcha, ruscha] juftligi. */
export const SCENES = {
  camera: {
    title: ['Kameralar uchun AI nazorat', 'AI-контроль камер'],
    steps: [
      {
        title: ['Kamera', 'Камера'],
        text: ['Kadrdagi odamlar topiladi', 'Находим людей в кадре'],
        visual: 'room',
      },
      {
        title: ['AI tekshiradi', 'AI проверяет'],
        text: ["Shubha bo'lsa, holat rad etiladi", 'При сомнении случай отклоняется'],
        visual: 'rows',
        data: [
          [
            ['Kod', 'Код'],
            ['A1', 'A1'],
          ],
          [
            ['Joy', 'Место'],
            ['2-qavat', '2 этаж'],
          ],
          [
            ["O'qituvchi", 'Учитель'],
            ["yo'q", 'нет'],
          ],
        ],
      },
      {
        title: ['Odam qaror qiladi', 'Решает человек'],
        text: ['Xabar Telegramga boradi', 'Сообщение уходит в Telegram'],
        visual: 'chat',
        data: {
          message: ["A1. Sinf o'qituvchisiz qoldi", 'A1. Класс остался без учителя'],
          buttons: [
            ["To'g'ri", 'Верно'],
            ['Xato', 'Ошибка'],
          ],
        },
      },
      {
        title: ['Hisobot tayyor', 'Отчёт готов'],
        text: ["Tasdiqlangan holatlar yig'iladi", 'Собираем подтверждённые случаи'],
        visual: 'bars',
        data: [45, 70, 38, 86, 60],
      },
    ],
  },
  staff: {
    title: ['Xodim+', 'Xodim+'],
    steps: [
      {
        title: ['Xodim keldi', 'Сотрудник пришёл'],
        text: ['Telefon yoki Face ID terminal', 'Телефон или терминал Face ID'],
        visual: 'rows',
        data: [
          [
            ['Kirish', 'Вход'],
            ['08:54', '08:54'],
          ],
          [
            ['Ish boshi', 'Начало'],
            ['09:00', '09:00'],
          ],
        ],
      },
      {
        title: ['Tekshiruv', 'Проверка'],
        text: ['Yuz va joylashuv solishtiriladi', 'Сверяем лицо и геолокацию'],
        visual: 'rows',
        data: [
          [
            ['Yuz', 'Лицо'],
            ['mos', 'совпало'],
          ],
          [
            ['Joy', 'Место'],
            ['filialda', 'в филиале'],
          ],
        ],
      },
      {
        title: ['Davomat', 'Посещаемость'],
        text: ["Kechikish jadval bo'yicha", 'Опоздания по графику'],
        visual: 'bars',
        data: [92, 80, 88, 64, 95],
      },
      {
        title: ['Maosh', 'Зарплата'],
        text: ["O'zi hisoblanadi, Excelga chiqadi", 'Считается сама, выгрузка в Excel'],
        visual: 'rows',
        data: [
          [
            ['Xodim 1', 'Сотрудник 1'],
            ['6 600 000', '6 600 000'],
          ],
          [
            ['Xodim 2', 'Сотрудник 2'],
            ['5 250 000', '5 250 000'],
          ],
          [
            ['Xodim 3', 'Сотрудник 3'],
            ['5 000 000', '5 000 000'],
          ],
        ],
      },
    ],
  },
  substitute: {
    title: ["O'rinbosar tizimi", 'Система замен'],
    duration: 12,
    frames: 300,
    steps: [
      {
        title: ["Kim kelmagani ko'rinadi", 'Видно, кого нет'],
        text: ['Kun holati bitta ekranda', 'Весь день на одном экране'],
      },
      {
        title: ["O'rinbosar tasdiqlanadi", 'Замена подтверждена'],
        text: ['Direktor bir bosishda tasdiqlaydi', 'Директор подтверждает в один клик'],
      },
      {
        title: ['Oylik hisobot', 'Отчёт за месяц'],
        text: ["Darslar va to'lov hisoblanadi", 'Считаются уроки и оплата'],
      },
    ],
  },
  analytics: {
    title: ['Haftalik tahlil boti', 'Бот недельной аналитики'],
    steps: [
      {
        title: ["Ma'lumot yig'iladi", 'Сбор данных'],
        text: ['Kanaldagi xabarlar bazaga tushadi', 'Сообщения канала попадают в базу'],
        visual: 'rows',
        data: [
          [
            ['Video', 'Видео'],
            ['+', '+'],
          ],
          [
            ['Rasm', 'Фото'],
            ['+', '+'],
          ],
          [
            ['Izoh', 'Комментарий'],
            ['+', '+'],
          ],
        ],
      },
      {
        title: ['Daraja aniqlanadi', 'Уровень важности'],
        text: ["Bot izohni o'qiydi", 'Бот читает комментарий'],
        visual: 'rows',
        data: [
          [['Shoshilinch', 'Срочно'], null, '#ff6b5e'],
          [['Jiddiy', 'Серьёзно'], null, '#ffb454'],
          [['Oddiy', 'Обычно'], null, '#6fd39b'],
        ],
      },
      {
        title: ['Tahlil', 'Анализ'],
        text: ['Haftalar solishtiriladi', 'Сравниваем недели'],
        visual: 'bars',
        data: [52, 78, 44, 66, 30],
      },
      {
        title: ['Taqdimot', 'Презентация'],
        text: ['Tayyor fayl Telegramga keladi', 'Готовый файл приходит в Telegram'],
        visual: 'chat',
        data: {
          message: ['Haftalik tahlil tayyor', 'Недельный анализ готов'],
          buttons: [['Ochish', 'Открыть']],
        },
      },
    ],
  },
};

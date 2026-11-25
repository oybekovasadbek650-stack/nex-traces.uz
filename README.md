# Nex Traces sayti

Nex Traces portfolio sayti. Vite, HTML, CSS va JavaScript modullari. O'zbekcha va ruscha.

## Ishga tushirish

```bash
npm install
npm run dev      # ishlab chiqish serveri
npm run build    # tayyor sayt: dist/
npm run preview  # dist/ ni ko'rish
npm run check    # ESLint, Prettier va build
```

## Tuzilma

```
index.html            sahifa tuzilmasi va o'zbekcha matn
public/               ikonkalar, manifest, og.png
brand/                logo to'plami (saytga kirmaydi)
scripts/seo-plugin.js ruscha sahifa, sitemap, robots.txt
src/
  main.js             kirish nuqtasi
  i18n.js             tarjima
  config/             domen, meta teglar, aloqa
  data/               jarayonlar ma'lumoti
  components/         sahifa qismlari
  effects/            animatsiyalar
  locales/ru.json     ruscha lug'at
  styles/             base, components, effects
  utils/              yordamchi funksiyalar
```

## Ko'p o'zgaradigan joylar

- Telefon va Telegram: `src/config/contacts.js`
- Domen: `src/config/site.js` dagi `SITE_URL`
- Ranglar va shriftlar: `src/styles/base/tokens.css`
- Tarjima: `src/locales/ru.json`. Kalit HTML'dagi o'zbekcha matnning aynan o'zi.

`package.json` buyruqlari `node` orqali yozilgan: papka yo'lidagi `&` belgisi oddiy `vite` buyrug'ini buzadi.

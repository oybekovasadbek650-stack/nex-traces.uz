import ru from './locales/ru.json';

/**
 * O'zbekcha matn HTML ichida turadi va lug'at kaliti vazifasini bajaradi (gettext usuli).
 * Lug'atda topilmagan matn o'zbekcha qoladi.
 */
const DICTIONARIES = { ru };
const DEFAULT_LOCALE = 'uz';
const STORAGE_KEY = 'lang';
const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'alt'];

const originalTexts = new WeakMap();
const originalAttributes = new WeakMap();
let currentLocale = DEFAULT_LOCALE;
const localeListeners = [];

export const getLocale = () => currentLocale;

export function onLocaleChange(listener) {
  localeListeners.push(listener);
}

const translate = (text) => DICTIONARIES[currentLocale]?.[text] ?? text;

/** Kod ichida yasalgan matnni joriy tilga o'giradi. */
export const t = translate;

function translateTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (['SCRIPT', 'STYLE'].includes(node.parentNode.nodeName)) continue;
    if (!originalTexts.has(node)) originalTexts.set(node, node.data);

    const original = originalTexts.get(node);
    // Formatlangan HTML'dagi qator uzilishlari lug'at kalitiga ta'sir qilmasin.
    const key = original.replace(/\s+/g, ' ').trim();
    if (!key) continue;

    const leading = /^\s/.test(original) ? ' ' : '';
    const trailing = /\s$/.test(original) ? ' ' : '';
    node.data = leading + translate(key) + trailing;
  }
}

function translateAttributes(root) {
  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    for (const element of root.querySelectorAll(`[${attribute}]`)) {
      if (!originalAttributes.has(element)) originalAttributes.set(element, {});

      const originals = originalAttributes.get(element);
      originals[attribute] ??= element.getAttribute(attribute);
      element.setAttribute(attribute, translate(originals[attribute]));
    }
  }
}

export function translateTree(root) {
  translateTextNodes(root);
  translateAttributes(root);
}

/** Elementga o'zbekcha matn yozadi va uni joriy tilga o'giradi. */
export function setTranslatedText(element, text) {
  element.textContent = text;
  translateTextNodes(element);
}

function readSavedLocale() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Brauzer xotirasi yopiq bo'lsa, tanlov faqat shu sahifada amal qiladi.
  }
}

function setLocale(locale) {
  currentLocale = locale;
  document.documentElement.lang = locale;
  translateTree(document.body);

  for (const button of document.querySelectorAll('.language-switch button')) {
    button.setAttribute('aria-pressed', String(button.lang === locale));
  }

  localeListeners.forEach((listener) => listener());
}

function detectLocale() {
  if (document.documentElement.lang === 'ru' || location.hash === '#ru') return 'ru';
  return readSavedLocale() === 'ru' ? 'ru' : DEFAULT_LOCALE;
}

export function initI18n() {
  for (const button of document.querySelectorAll('.language-switch button')) {
    button.addEventListener('click', () => {
      setLocale(button.lang);
      saveLocale(button.lang);
    });
  }

  setLocale(detectLocale());
}

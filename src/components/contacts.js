import { CONTACTS } from '../config/contacts.js';

const telegramUrl = (username) => `https://t.me/${username}`;
const phoneUrl = (phone) => `tel:${phone.replace(/[^+\d]/g, '')}`;

function contactCard({ name, telegram, phone }) {
  const telegramBlock = telegram
    ? `<a class="button" href="${telegramUrl(telegram)}" target="_blank" rel="noopener">
         <span>Telegramda yozish</span>
       </a>
       <b class="contact-card__username">@${telegram}</b>`
    : '';
  const phoneBlock = phone
    ? `<b class="contact-card__phone"><a href="${phoneUrl(phone)}">${phone}</a></b>`
    : '';

  return `<div class="contact-card"><h3>${name}</h3>${telegramBlock}${phoneBlock}</div>`;
}

function dockButton({ shortName, telegram }) {
  return `<a class="button" href="${telegramUrl(telegram)}" target="_blank" rel="noopener">
    ${shortName}<small>Telegram</small>
  </a>`;
}

export function initContacts() {
  const list = document.getElementById('contact-list');
  const dock = document.getElementById('contact-dock');
  const section = document.getElementById('aloqa');

  list.innerHTML = CONTACTS.map(contactCard).join('');
  dock.innerHTML = CONTACTS.filter(({ telegram }) => telegram)
    .map(dockButton)
    .join('');

  // Aloqa bo'limi ko'ringanda pastki panel takror bo'lib qolmasin.
  new IntersectionObserver(([entry]) => dock.classList.toggle('is-hidden', entry.isIntersecting), {
    rootMargin: '0px 0px -20% 0px',
  }).observe(section);
}

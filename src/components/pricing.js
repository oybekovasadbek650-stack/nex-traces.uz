import { CONTACTS } from '../config/contacts.js';
import {
  ALWAYS_INCLUDED,
  FEATURES,
  INSTITUTIONS,
  NETWORK_DISCOUNT,
  PACKAGES,
} from '../config/pricing.js';
import { onLocaleChange, t } from '../i18n.js';
import { prefersReducedMotion } from '../utils/motion.js';

const formatNumber = (value) => Math.round(value).toLocaleString('ru-RU');
const formatSum = (value) => `${formatNumber(value)} ${t("so'm")}`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const orderContact = CONTACTS.find(({ telegram }) => telegram);
const fill = (text) =>
  text
    .replace('{min}', NETWORK_DISCOUNT.minBranches)
    .replace('{percent}', NETWORK_DISCOUNT.percent);

/** Paket kartochkasi tepasidagi kichik orbita: har bir modul bitta sayyora. */
function miniOrbit(item) {
  const planets = FEATURES.map((feature, index) => {
    const radians = ((feature.angle - 90) * Math.PI) / 180;
    const x = 40 + Math.cos(radians) * 30;
    const y = 40 + Math.sin(radians) * 30;
    const isOn = item.features.includes(index);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isOn ? 4.5 : 3}" class="${isOn ? 'is-on' : ''}" />`;
  }).join('');

  return `<svg class="package__orbit" viewBox="0 0 80 80" aria-hidden="true">
    <circle cx="40" cy="40" r="30" class="ring" /><circle cx="40" cy="40" r="7" class="core" />${planets}
  </svg>`;
}

function packageCard(item) {
  const features = FEATURES.map(
    ({ name }, index) =>
      `<li class="${item.features.includes(index) ? 'is-included' : 'is-missing'}">${name}</li>`,
  ).join('');
  const badge = item.recommended ? '<span class="package__badge">Tavsiya</span>' : '';

  return `<article class="package${item.recommended ? ' package--recommended' : ''}">
    <div class="package__inner">
      <div class="package__top">${miniOrbit(item)}${badge}</div>
      <h3>${item.name}</h3>
      <p class="package__summary">${item.summary}</p>
      <p class="package__price"><span data-sum="${item.price}"></span></p>
      <p class="package__once">bir martalik to'lov</p>
      <ul class="package__features">${features}<li class="is-included">${ALWAYS_INCLUDED}</li></ul>
      <a class="button${item.recommended ? '' : ' button--secondary'}" href="#hisoblash" data-package="${item.id}">Shu paketni hisoblash</a>
    </div>
  </article>`;
}

function orbitNode({ name, angle }, index) {
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = 50 + Math.cos(radians) * 37.5;
  const y = 50 + Math.sin(radians) * 37.5;
  return `<span class="orbit-node" data-feature="${index}" style="--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%">
    <i></i><span>${name}</span>
  </span>`;
}

function choice(name, value, label, checked) {
  return `<label class="choice"><input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''} /><span>${label}</span></label>`;
}

function readState(form) {
  const data = new FormData(form);
  const branches = clamp(parseInt(data.get('branches'), 10) || 1, 1, 100);
  const cameras = clamp(parseInt(data.get('cameras'), 10) || 1, 1, 500);
  const item = PACKAGES.find(({ id }) => id === data.get('package')) ?? PACKAGES[0];
  const institution = INSTITUTIONS[Number(data.get('institution')) || 0];
  const hasDiscount = branches >= NETWORK_DISCOUNT.minBranches;
  const subtotal = item.price * branches;
  const discount = hasDiscount ? (subtotal * NETWORK_DISCOUNT.percent) / 100 : 0;

  return {
    branches,
    cameras,
    item,
    institution,
    hasDiscount,
    subtotal,
    discount,
    total: subtotal - discount,
  };
}

function orderMessage(state) {
  return [
    t('Assalomu alaykum! Nex Traces saytidan yozyapman.'),
    `${t('Muassasa')}: ${t(state.institution)}`,
    `${t('Paket')}: ${t(state.item.name)}`,
    `${t('Filiallar soni')}: ${state.branches}`,
    `${t('Har filialda kamera')}: ~${state.cameras}`,
    `${t('Taxminiy narx')}: ${formatSum(state.total)} (${t("bir martalik to'lov")})`,
  ].join('\n');
}

/** Narx raqami eski qiymatdan yangisiga sanab o'tadi. */
function animateSum(element, from, to) {
  const unit = ` ${t("so'm")}`;
  if (prefersReducedMotion || from === to) {
    element.textContent = formatNumber(to) + unit;
    return;
  }

  const start = performance.now();
  const duration = 650;
  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = formatNumber(from + (to - from) * eased) + unit;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initPricing() {
  const packages = document.getElementById('packages');
  const form = document.getElementById('calculator-form');
  const orbit = document.getElementById('system-orbit');
  const resultPackage = document.getElementById('result-package');
  const resultSum = document.getElementById('result-sum');
  const resultLines = document.getElementById('result-lines');
  const note = document.getElementById('calculator-note');
  const orderLink = document.getElementById('order-link');
  const copyButton = document.getElementById('order-copy');
  let shownTotal = 0;

  packages.innerHTML = PACKAGES.map(packageCard).join('');
  document.getElementById('orbit-nodes').innerHTML = FEATURES.map(orbitNode).join('');
  document.getElementById('institution-options').innerHTML = INSTITUTIONS.map((label, index) =>
    choice('institution', index, label, index === 0),
  ).join('');
  document.getElementById('package-options').innerHTML = PACKAGES.map((item) =>
    choice('package', item.id, item.name, item.recommended),
  ).join('');

  const renderStatic = () => {
    for (const element of packages.querySelectorAll('[data-sum]')) {
      element.textContent = formatSum(Number(element.dataset.sum));
    }
    document.getElementById('discount-text').textContent = fill(
      t(
        "{min} va undan ko'p filialga {percent}% chegirma. Chegirma kalkulyatorda o'zi hisoblanadi.",
      ),
    );
  };

  const render = () => {
    const state = readState(form);

    for (const node of orbit.querySelectorAll('.orbit-node')) {
      node.classList.toggle('is-on', state.item.features.includes(Number(node.dataset.feature)));
    }
    orbit.dataset.level = String(state.item.features.length);

    resultPackage.textContent = t(state.item.name);
    animateSum(resultSum, shownTotal, state.total);
    shownTotal = state.total;

    const lines = [
      `<li><span>${formatSum(state.item.price)} × ${state.branches} ${t('filial')}</span><b>${formatSum(state.subtotal)}</b></li>`,
    ];
    if (state.hasDiscount) {
      lines.push(
        `<li class="is-discount"><span>${fill(t('Tarmoq chegirmasi {percent}%'))}</span><b>− ${formatSum(state.discount)}</b></li>`,
      );
    }
    resultLines.innerHTML = lines.join('');

    note.textContent = state.hasDiscount
      ? t("Oylik to'lov yo'q. Aniq narx kameralarni ko'rib chiqqandan keyin belgilanadi.")
      : fill(t("{min} va undan ko'p filial bo'lsa, {percent}% chegirma. Oylik to'lov yo'q."));

    const message = orderMessage(state);
    orderLink.href = orderContact
      ? `https://t.me/${orderContact.telegram}?text=${encodeURIComponent(message)}`
      : '#aloqa';
    copyButton.dataset.message = message;
  };

  form.addEventListener('input', render);
  form.addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (!button) return;
    const input = button.parentElement.querySelector('input');
    input.value = clamp(
      Number(input.value) + Number(button.dataset.step),
      Number(input.min),
      Number(input.max),
    );
    render();
  });
  form.addEventListener('submit', (event) => event.preventDefault());

  packages.addEventListener('click', (event) => {
    const link = event.target.closest('[data-package]');
    if (!link) return;
    form.querySelector(`input[name="package"][value="${link.dataset.package}"]`).checked = true;
    render();
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.message);
      copyButton.textContent = t('Nusxalandi');
    } catch {
      copyButton.textContent = t("Nusxalab bo'lmadi, qo'lda yozing");
    }
    setTimeout(() => {
      copyButton.textContent = t('Buyurtma matnini nusxalash');
    }, 2500);
  });

  onLocaleChange(() => {
    renderStatic();
    shownTotal = readState(form).total;
    render();
  });
  renderStatic();
  render();
}

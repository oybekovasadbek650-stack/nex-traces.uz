/**
 * Ikkinchi reklama videosi (9:16, 32 s, 120 BPM). render-promo.mjs har kadrda window.renderAt(t) ni chaqiradi.
 * Ovoz vaqtlari scripts/videos/music.py dagi bilan bir xil bo'lishi kerak.
 */
const FPS = 30;
const DURATION = 36;
/** Yakuniy sahna boshlanishi. */
const END = 31.2;
const $ = (selector) => document.querySelector(selector);

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const easeOut = (value) => 1 - (1 - clamp01(value)) ** 3;
const easeInOut = (value) => {
  const x = clamp01(value);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
const backOut = (value) => {
  const x = clamp01(value);
  const c = 1.9;
  return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2;
};
const seg = (t, start, end) => clamp01((t - start) / (end - start));
const mix = (from, to, amount) => from + (to - from) * amount;
const set = (element, styles) => Object.assign(element.style, styles);

/* ---------- Sinf chizmasi (kamera kadri) ---------- */
const ROWS = [150, 215, 280];
const COLS = [70, 175, 321, 426];

function seats(seed) {
  let state = seed;
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647;
  const list = [];
  for (const y of ROWS) for (const x of COLS) if (random() < 0.8) list.push({ x, y });
  return { list, teacher: random() < 0.6 };
}

function classroom({ list, teacher }, { boxes = false } = {}) {
  const desks = ROWS.flatMap((y) =>
    COLS.map(
      (x) => `<rect x="${x - 36}" y="${y + 6}" width="72" height="15" rx="3" fill="#2a333a"/>`,
    ),
  ).join('');
  const kids = list
    .map(
      ({ x, y }, index) => `<g class="kid" data-index="${index}" data-y="${y}">
        <rect x="${x - 12}" y="${y - 10}" width="24" height="17" rx="7" fill="#46535c"/>
        <circle cx="${x}" cy="${y - 19}" r="8.5" fill="#5c6b75"/>
        ${boxes ? `<g class="box" opacity="0" stroke="#8fd3ff" stroke-width="2" fill="none"><path d="M${x - 17} ${y - 22} v-9 h9 M${x + 8} ${y - 31} h9 v9 M${x + 17} ${y + 2} v9 h-9 M${x - 8} ${y + 11} h-9 v-9"/><text x="${x - 16}" y="${y - 35}" fill="#8fd3ff" stroke="none" font-size="9" font-family="JetBrains Mono">odam</text></g>` : ''}
      </g>`,
    )
    .join('');
  const person = teacher
    ? '<rect x="236" y="56" width="24" height="18" rx="8" fill="#46535c"/><circle cx="248" cy="47" r="9" fill="#5c6b75"/>'
    : '';
  return `<rect x="150" y="14" width="196" height="30" rx="3" fill="#24303a"/>
    <rect x="208" y="74" width="80" height="18" rx="3" fill="#2a333a"/>${person}${desks}${kids}`;
}

const ZONE = `<g id="zone" opacity="0">
  <rect x="188" y="30" width="120" height="72" rx="6" fill="rgb(255 176 64 / 10%)" stroke="#ffb040" stroke-width="2.5" stroke-dasharray="7 5"/>
  <rect x="188" y="6" width="150" height="20" rx="4" fill="#ffb040"/>
  <text x="196" y="20" font-size="11" font-weight="700" font-family="JetBrains Mono" fill="#1a1205">A1 · O'QITUVCHI YO'Q</text>
</g>`;

/* ---------- Tayyorlash ---------- */
function buildSky() {
  let state = 11;
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647;
  const stars = Array.from({ length: 120 }, () => {
    const r = random() < 0.85 ? 0.7 : 1.4;
    return `<circle cx="${(random() * 540).toFixed(1)}" cy="${(random() * 960).toFixed(1)}" r="${r}" fill="${random() < 0.15 ? '#8fd3ff' : '#eef2f5'}" opacity="${(0.2 + random() * 0.6).toFixed(2)}"/>`;
  }).join('');
  $('#sky').innerHTML = `${stars}<g id="orbits" fill="none" stroke="#c9d6df">
    <ellipse cx="270" cy="520" rx="330" ry="140" opacity=".09"/>
    <ellipse cx="270" cy="520" rx="450" ry="195" opacity=".06"/></g>
    <circle id="comet" r="2.4" fill="#fff"/>`;
}

function buildGrid() {
  $('#grid').innerHTML = Array.from(
    { length: 9 },
    (_, index) => `<div class="tile">
      <svg viewBox="0 0 496 350" preserveAspectRatio="xMidYMid slice">${classroom(seats(index * 37 + 5))}</svg>
      <b>CAM 0${index + 1}</b><i></i><span class="tc"></span>
    </div>`,
  ).join('');
}

const CAM_SEATS = { ...seats(101), teacher: false };
function buildCamera() {
  $('#cam-svg').innerHTML = classroom(CAM_SEATS, { boxes: true }) + ZONE;
  $('#tg-thumb').innerHTML =
    `${classroom(CAM_SEATS)}<rect x="188" y="30" width="120" height="72" rx="6" fill="none" stroke="#ffb040" stroke-width="4"/>`;
}

function buildReport() {
  const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
  const values = [3, 5, 2, 6, 4, 1, 2];
  $('#bars').innerHTML = values
    .map(
      (value, index) =>
        `<div data-day="${days[index]}" style="height:${(value / 6) * 100}%"></div>`,
    )
    .join('');
}

/* ---------- Sahnalar ---------- */
const SCENES = [
  ['#s1', 0, 4],
  ['#s2', 4, 8],
  ['#s3', 8, 12],
  ['#s4', 12, 16],
  ['#s5', 16, 20],
  ['#s6', 20, END + 0.1],
  ['#end', END, DURATION + 1],
];

function sceneVisibility(t) {
  for (const [selector, start, end] of SCENES) {
    const fadeIn = start === 0 ? 1 : seg(t, start, start + 0.22);
    const fadeOut = 1 - seg(t, end - 0.12, end);
    const visible = t >= start && t < end;
    set($(selector), {
      opacity: visible ? Math.min(fadeIn, fadeOut) : 0,
      transform: `translateY(${mix(26, 0, easeOut(seg(t, start, start + 0.35)))}px)`,
      display: t >= start - 0.1 && t < end + 0.1 ? 'block' : 'none',
    });
  }
}

function slam(element, t, start, end) {
  const inside = t >= start && t < end;
  const pop = easeOut(seg(t, start, start + 0.16));
  set(element, {
    opacity: inside ? pop * (1 - seg(t, end - 0.06, end)) : 0,
    transform: `scale(${mix(1.35, 1, pop)})`,
  });
}

function scene1(t) {
  slam($('#w1'), t, 0.5, 1.5);
  slam($('#w2'), t, 1.5, 2.5);
  slam($('#w3'), t, 2.5, 4.05);
  [...document.querySelectorAll('.tile')].forEach((tile, index) => {
    const start = 0.1 + index * 0.09;
    const flicker = t < start ? 0 : t < start + 0.24 ? (Math.floor(t * 30) % 2 ? 0.25 : 1) : 1;
    tile.style.opacity = flicker;
    tile.querySelector('i').style.opacity = Math.floor(t * 2) % 2 ? 0.2 : 1;
    tile.querySelector('.tc').textContent = `10:41:${String(52 + Math.floor(t)).padStart(2, '0')}`;
  });
  const zoom = easeInOut(seg(t, 3.45, 4.0));
  set($('#grid'), {
    transform: `scale(${mix(1, 3.1, zoom)})`,
    transformOrigin: '50% 50%',
    opacity: 1 - seg(t, 3.85, 4.0),
  });
}

function scene2(t) {
  set($('#cam'), { transform: `scale(${mix(1.18, 1, easeOut(seg(t, 4, 4.45)))})` });
  const scan = seg(t, 4.4, 6.0);
  set($('#scanline'), {
    top: `${mix(-70, 350, scan)}px`,
    opacity: t > 4.35 && t < 6.05 ? 1 : 0,
  });
  for (const kid of document.querySelectorAll('#cam-svg .kid')) {
    const reached = 4.4 + (Number(kid.dataset.y) / 350) * 1.6;
    kid.querySelector('.box').setAttribute('opacity', t > reached ? 1 : 0);
  }
  const zone = $('#zone');
  zone.setAttribute('opacity', t > 6.0 ? (Math.floor((t - 6) * 4) % 2 ? 0.55 : 1) : 0);
  const alert = easeOut(seg(t, 6.3, 6.7));
  set($('#alert'), { opacity: alert, transform: `translateY(${mix(30, 0, alert)}px)` });
  $('#cam-time').textContent = `10:42:${String(Math.floor((t - 4) * 3) % 60).padStart(2, '0')}`;
}

function scene3(t) {
  set($('#tg'), { transform: `translateY(${mix(160, 0, easeOut(seg(t, 8, 8.5)))}px)` });
  const message = $('#tg-msg');
  const pop = backOut(seg(t, 8.5, 8.85));
  set(message, {
    opacity: seg(t, 8.5, 8.6),
    transform: `scale(${mix(0.85, 1, pop)})`,
    transformOrigin: '0 100%',
  });
  const below = `${message.offsetTop + message.offsetHeight + 6}px`;
  set($('#tg-buttons'), { top: below, opacity: t < 10.15 ? seg(t, 8.75, 8.95) : 0 });
  set($('#tg-done'), {
    top: below,
    opacity: seg(t, 10.15, 10.3),
    transform: `scale(${mix(0.9, 1, backOut(seg(t, 10.15, 10.45)))})`,
  });
  showTap(t, 10.0, $('#tg-yes').getBoundingClientRect());
}

function scene4(t) {
  [...document.querySelectorAll('#bars div')].forEach((bar, index) => {
    const grow = backOut(seg(t, 12.5 + index * 0.25, 12.85 + index * 0.25));
    bar.style.transform = `scaleY(${Math.max(0, grow)})`;
  });
  const count = easeOut(seg(t, 14.3, 15.2));
  [
    ['#st1', 23],
    ['#st2', 18],
    ['#st3', 5],
  ].forEach(([selector, value], index) => {
    $(selector).textContent = Math.round(value * count);
    const card = $(selector).parentElement;
    const show = easeOut(seg(t, 14.2 + index * 0.12, 14.5 + index * 0.12));
    set(card, { opacity: show, transform: `translateY(${mix(16, 0, show)}px)` });
  });
}

function scene5(t) {
  [
    ['#who1', 16.0],
    ['#who2', 17.0],
    ['#who3', 18.0],
  ].forEach(([selector, start]) => {
    const pop = easeOut(seg(t, start, start + 0.15));
    set($(selector), {
      opacity: t >= start ? pop * (1 - seg(t, 19.75, 20)) : 0,
      transform: `scale(${mix(1.6, 1, pop)})`,
    });
  });
  slam($('#who-for'), t, 18.8, 20);
}

/* ---------- Sayt (iframe) ---------- */
const site = $('#site');
const SITE_SCALE = 0.959;

function siteY(selector, offset = 12) {
  const win = site.contentWindow;
  const element = win.document.querySelector(selector);
  return element ? element.getBoundingClientRect().top + win.scrollY - offset : 0;
}

function siteRect(selector) {
  const box = site.contentWindow.document.querySelector(selector).getBoundingClientRect();
  const host = site.getBoundingClientRect();
  return {
    left: host.left + box.left * SITE_SCALE,
    top: host.top + box.top * SITE_SCALE,
    width: box.width * SITE_SCALE,
    height: box.height * SITE_SCALE,
  };
}

const SCROLL = [
  [21.0, 21.7, 0, '#paketlar'],
  [21.8, 22.5, '#paketlar', '.package--recommended'],
  [22.6, 23.15, '.package--recommended', '#calculator-form'],
  [24.6, 25.2, '#calculator-form', '#system-orbit'],
  [25.4, 25.95, '#system-orbit', '.calculator__result'],
  [26.7, 27.4, '.calculator__result', ['#order-form', 150]],
];
const TAPS = [
  [23.4, '#package-options .choice:nth-child(3)'],
  [23.9, '.number-field:first-child [data-step="1"]'],
  [24.3, '.number-field:first-child [data-step="1"]'],
];
/* Forma: bosish (klik qilinmaydi), keyin yozish. */
const FORM_TAPS = [
  [27.6, '#order-form [name="name"]'],
  [28.6, '#order-form [name="phone"]'],
  [29.9, '#order-form button[type="submit"]'],
];
const TYPING = [
  [27.75, 28.35, '#order-form [name="name"]', 'Dilnoza'],
  [28.75, 29.65, '#order-form [name="phone"]', '+998 90 123 45 67'],
];
const tapped = new Set();

function scrollSite(t) {
  const resolve = (value) =>
    typeof value === 'number' ? value : Array.isArray(value) ? siteY(...value) : siteY(value);
  let y = null;
  for (const [start, end, from, to] of SCROLL) {
    if (t < start) break;
    y = mix(resolve(from), resolve(to), easeInOut(seg(t, start, end)));
  }
  if (y !== null) site.contentWindow.scrollTo({ top: y, behavior: 'instant' });
}

function showTap(t, time, rect) {
  const age = t - time;
  if (age < -0.25 || age >= 0.6) return;
  const grow = clamp01((age + 0.25) / 0.85);
  const tap = $('#tap');
  // #tap faqat 6-sahnada; 3-sahnada vaqtincha shu sahnaga ko'chiriladi.
  const host = t < 20 ? $('#s3') : $('#s6');
  if (tap.parentElement !== host) host.append(tap);
  set(tap, {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top + rect.height / 2}px`,
    transform: `scale(${mix(0.55, 1.25, grow)})`,
    opacity: age < 0 ? clamp01((age + 0.25) / 0.15) : 1 - clamp01(age / 0.6),
  });
}

const TITLES = [
  [20.0, "Bir marta <em>to'laysiz.</em>"],
  [22.0, "Oylik to'lov <em>yo'q.</em>"],
  [24.0, "Narxni <em>o'zingiz</em> hisoblang."],
  [26.7, 'Buyurtma <em>bir bosishda.</em>'],
  [30.3, "Biz <em>darhol</em> bog'lanamiz."],
];

function scene6(t) {
  let title = TITLES[0];
  for (const item of TITLES) if (t >= item[0]) title = item;
  const heading = $('#s6-title');
  if (heading.dataset.at !== String(title[0])) {
    heading.dataset.at = String(title[0]);
    heading.innerHTML = title[1];
  }
  const pop = easeOut(seg(t, title[0], title[0] + 0.25));
  set(heading, { opacity: pop, transform: `translateY(${mix(12, 0, pop)}px)` });

  const enter = easeOut(seg(t, 20.0, 21.0));
  const settle = easeInOut(seg(t, 21.0, 22.4));
  const rotateY = mix(mix(-38, -10, enter), 0, settle);
  const rotateX = mix(mix(16, 5, enter), 0, settle);
  set($('#phone'), {
    transform: `translateY(${mix(160, 0, enter)}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${mix(0.86, 1, enter)})`,
  });

  scrollSite(t);
  for (const [index, [time, selector]] of TAPS.entries()) {
    if (t >= time && !tapped.has(index)) {
      tapped.add(index);
      site.contentWindow.document.querySelector(selector).click();
    }
    if (t >= time - 0.25 && t < time + 0.6) showTap(t, time, siteRect(selector));
  }

  const doc = site.contentWindow.document;
  for (const [time, selector] of FORM_TAPS) {
    if (t >= time - 0.25 && t < time + 0.6) showTap(t, time, siteRect(selector));
  }
  for (const [start, end, selector, text] of TYPING) {
    if (t < start) continue;
    doc.querySelector(selector).value = text.slice(0, Math.round(seg(t, start, end) * text.length));
  }
  const status = doc.getElementById('order-status');
  if (t >= 30.05 && !status.dataset.kind) {
    status.textContent = "Buyurtma qabul qilindi. Tez orada siz bilan bog'lanamiz.";
    status.dataset.kind = 'success';
  }
  const note = backOut(seg(t, 30.3, 30.75));
  set($('#notify'), {
    opacity: t >= 30.3 ? seg(t, 30.3, 30.4) : 0,
    transform: `translateY(${mix(-140, 0, note)}px)`,
  });

  const stamp = seg(t, 26.1, 26.4);
  set($('#stamp'), {
    opacity: t >= 26.1 && t < 26.8 ? 1 - seg(t, 26.6, 26.8) : 0,
    transform: `scale(${mix(2.4, 1, backOut(stamp))}) rotate(${mix(-30, -12, stamp)}deg)`,
  });
}

function sceneEnd(t) {
  const draw = easeInOut(seg(t, END + 0.2, END + 1.4));
  $('#end-ring').setAttribute('stroke-dashoffset', String(679 * (1 - draw)));
  const angle = -Math.PI / 2 + draw * Math.PI * 2;
  $('#end-dot').setAttribute('cx', String(115 + Math.cos(angle) * 108));
  $('#end-dot').setAttribute('cy', String(115 + Math.sin(angle) * 108));
  set($('#end-logo img'), {
    transform: `scale(${mix(0.7, 1, backOut(seg(t, END + 0.1, END + 0.7)))})`,
    opacity: seg(t, END + 0.1, END + 0.3),
  });
  const parts = ['#end b', '#end h3', '#cta', '#end .socials'];
  parts.forEach((selector, index) => {
    const show = easeOut(seg(t, END + 0.8 + index * 0.35, END + 1.2 + index * 0.35));
    set($(selector), { opacity: show, transform: `translateY(${mix(18, 0, show)}px)` });
  });
  const beat = t > END + 2 ? Math.exp(-((t - END - 2) % 0.5) * 9) : 0;
  $('#cta').style.boxShadow = `0 0 ${20 + beat * 40}px rgb(143 211 255 / ${0.35 + beat * 0.4})`;
  $('#world').style.opacity = String(1 - seg(t, DURATION - 0.5, DURATION));
}

/* ---------- Umumiy: ritm, chaqnash, fon ---------- */
function kickPulse(t) {
  if (t < 4 || t > END) return 0;
  if (t >= 16 && t < 20) {
    const hits = [16, 17, 18].filter((hit) => t >= hit);
    return hits.length ? Math.exp(-(t - hits.at(-1)) * 7) * 0.02 : 0;
  }
  return Math.exp(-((t - 4) % 0.5) * 10) * 0.012;
}

window.renderAt = (t) => {
  site.contentWindow.__advance?.(1000 / FPS);
  $('#tap').style.opacity = 0;

  $('#orbits').setAttribute('transform', `rotate(${(-12 + t * 2).toFixed(2)} 270 520)`);
  const cometAngle = (t / 7) * Math.PI * 2;
  $('#comet').setAttribute('cx', (270 + Math.cos(cometAngle) * 450).toFixed(1));
  $('#comet').setAttribute('cy', (520 + Math.sin(cometAngle) * 195).toFixed(1));
  $('#bg').style.transform = `scale(${1 + kickPulse(t) * 2})`;

  sceneVisibility(t);
  if (t < 4.1) scene1(t);
  if (t >= 3.9 && t < 8.1) scene2(t);
  if (t >= 7.9 && t < 12.1) scene3(t);
  if (t >= 11.9 && t < 16.1) scene4(t);
  if (t >= 15.9 && t < 20.1) scene5(t);
  if (t >= 19.9 && t < END + 0.2) scene6(t);
  if (t >= END - 0.1) sceneEnd(t);

  const flash = Math.max(
    ...[4, 20].map((hit) => (t >= hit ? 1 - seg(t, hit, hit + 0.3) : 0) * 0.85),
    ...[8, 12, 16, END].map((hit) => (t >= hit ? 1 - seg(t, hit, hit + 0.18) : 0) * 0.25),
  );
  $('#flash').style.opacity = flash;
};

buildSky();
buildGrid();
buildCamera();
buildReport();
window.duration = DURATION;
window.fps = FPS;

await new Promise((resolve) => {
  if (site.contentDocument?.readyState === 'complete') resolve();
  else site.addEventListener('load', resolve, { once: true });
});
await document.fonts.ready;
await site.contentDocument.fonts.ready;
window.renderAt(0);
window.isReady = true;

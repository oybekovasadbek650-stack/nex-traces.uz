/**
 * Reklama videosi ssenariysi (9:16). render-promo.mjs har kadrda window.renderAt(t) ni chaqiradi.
 * Iframe ichidagi sayt virtual vaqtda ishlaydi (render-promo.mjs dagi VIRTUAL_TIME).
 */
const FPS = 30;
export const DURATION = 39;

const $ = (selector) => document.querySelector(selector);
const siteA = $('#site-a');
const siteB = $('#site-b');
const tap = $('#tap');
const screen = $('#screen');

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => {
  const x = clamp01(value);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
const progress = (t, start, end) => ease((t - start) / (end - start));
const mix = (from, to, amount) => from + (to - from) * amount;

const CAPTIONS = [
  [3.0, 'Nex Traces', "Kameralaringiz <em>o'zi kuzatadi</em>"],
  [7.6, 'Qanday ishlaydi', 'AI topadi, <em>siz qaror qilasiz</em>'],
  [12.6, 'Kimlar uchun', "Bog'cha, maktab va <em>akademiyalar</em>"],
  [16.6, 'Foyda', "Muhim vaziyat <em>darhol ko'rinadi</em>"],
  [19.8, 'Narxlar', "Bir marta to'laysiz, <em>tizim sizniki</em>"],
  [25.2, 'Kalkulyator', "Narxni <em>o'zingiz</em> hisoblang"],
  [32.0, 'Buyurtma', 'Bir bosishda <em>Telegramga</em>'],
];

/* Fon: urug'li yulduzlar va sekin aylanadigan orbitalar. */
function buildSky() {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const stars = Array.from({ length: 110 }, () => {
    const r = random() < 0.85 ? 0.7 : 1.3;
    return `<circle cx="${(random() * 540).toFixed(1)}" cy="${(random() * 960).toFixed(1)}" r="${r}" fill="${random() < 0.15 ? '#8fd3ff' : '#eef2f5'}" opacity="${(0.25 + random() * 0.6).toFixed(2)}"/>`;
  }).join('');
  $('#sky').innerHTML = `${stars}
    <g id="orbits" fill="none" stroke="#c9d6df">
      <ellipse cx="270" cy="520" rx="330" ry="140" opacity=".10"/>
      <ellipse cx="270" cy="520" rx="440" ry="190" opacity=".07"/>
      <ellipse cx="270" cy="520" rx="560" ry="240" opacity=".05"/>
    </g>
    <circle id="comet" r="2.6" fill="#fff"/>`;
}

function documentY(frame, selector, offset = 16) {
  const win = frame.contentWindow;
  const element = win.document.querySelector(selector);
  if (!element) return 0;
  return element.getBoundingClientRect().top + win.scrollY - offset;
}

/** Iframe ichidagi elementning kompozitsiyadagi markazi. */
function screenPoint(frame, selector) {
  const element = frame.contentWindow.document.querySelector(selector);
  const box = element.getBoundingClientRect();
  const host = screen.getBoundingClientRect();
  return { x: host.left + box.left + box.width / 2, y: host.top + box.top + box.height / 2 };
}

/* Skroll: [boshlanish, tugash, qayerdan, qayerga]. Qiymat raqam yoki selektor. */
const SCROLL_A = [
  [7.6, 8.9, 0, '.process-demo'],
  [12.6, 13.8, '.process-demo', '#kimlar'],
  [16.6, 17.8, '#kimlar', '#foyda'],
];
const SCROLL_B = [
  [21.2, 22.4, 0, '#paketlar'],
  [22.8, 25.0, '#paketlar', '.package--recommended'],
  [25.2, 26.2, '.package--recommended', '#calculator-form'],
  [29.4, 30.3, '#calculator-form', '#system-orbit'],
  [31.4, 32.4, '#system-orbit', '.calculator__result'],
];

function resolve(frame, value) {
  return typeof value === 'number' ? value : documentY(frame, value);
}

function scrollFrame(frame, plan, t) {
  let y = null;
  for (const [start, end, from, to] of plan) {
    if (t < start) break;
    y = mix(resolve(frame, from), resolve(frame, to), progress(t, start, end));
  }
  if (y !== null) frame.contentWindow.scrollTo({ top: y, behavior: 'instant' });
}

/* Bosishlar: [vaqt, iframe, selektor, haqiqatan bosilsinmi]. */
const TAPS = [
  [26.6, siteB, '#package-options .choice:nth-child(3)', true],
  [27.7, siteB, '.number-field:first-child [data-step="1"]', true],
  [28.5, siteB, '.number-field:first-child [data-step="1"]', true],
  [33.6, siteB, '#order-link', false],
];
const done = new Set();

function runTaps(t) {
  tap.style.opacity = 0;
  for (const [index, [time, frame, selector, click]] of TAPS.entries()) {
    const age = t - time;
    if (age >= 0 && !done.has(index)) {
      done.add(index);
      if (click) frame.contentWindow.document.querySelector(selector).click();
    }
    if (age >= -0.25 && age < 0.6) {
      const point = screenPoint(frame, selector);
      const grow = clamp01((age + 0.25) / 0.85);
      tap.style.left = `${point.x}px`;
      tap.style.top = `${point.y}px`;
      tap.style.transform = `scale(${mix(0.55, 1.25, grow)})`;
      tap.style.opacity = age < 0 ? clamp01((age + 0.25) / 0.15) : 1 - clamp01(age / 0.6);
    }
  }
}

function renderCaption(t) {
  const caption = $('#caption');
  let current = null;
  for (const item of CAPTIONS) if (t >= item[0]) current = item;
  if (!current || t >= 35) {
    caption.style.opacity = 0;
    return;
  }
  if (caption.dataset.at !== String(current[0])) {
    caption.dataset.at = String(current[0]);
    caption.querySelector('p').textContent = current[1];
    caption.querySelector('h1').innerHTML = current[2];
  }
  const local = progress(t, current[0], current[0] + 0.5);
  caption.style.opacity = local;
  caption.style.transform = `translateY(${mix(14, 0, local)}px)`;
}

window.renderAt = (t) => {
  for (const frame of [siteA, siteB]) frame.contentWindow.__advance?.(1000 / FPS);

  $('#orbits').setAttribute('transform', `rotate(${(-12 + t * 1.2).toFixed(2)} 270 520)`);
  const cometAngle = (t / 9) * Math.PI * 2;
  $('#comet').setAttribute('cx', (270 + Math.cos(cometAngle) * 440).toFixed(1));
  $('#comet').setAttribute('cy', (520 + Math.sin(cometAngle) * 190).toFixed(1));

  // Ochilish kartasi
  const titleIn = progress(t, 0.1, 1.1);
  const titleOut = progress(t, 2.5, 3.1);
  $('#title').style.opacity = titleIn * (1 - titleOut);
  $('#title').style.transform = `scale(${mix(0.88, 1, titleIn) + titleOut * 0.06})`;

  // Telefon sahnasi
  const stageIn = progress(t, 2.8, 3.8);
  const stageOut = progress(t, 35.0, 35.8);
  $('#stage').style.opacity = stageIn * (1 - stageOut);
  $('#phone').style.transform =
    `translateY(${mix(70, 0, stageIn)}px) scale(${1 - stageOut * 0.06})`;

  // Bosh sahifadan narxlar sahifasiga o'tish
  const swap = progress(t, 19.6, 20.6);
  siteA.style.transform = `translateX(${-swap * 100}%)`;
  siteB.style.transform = `translateX(${(1 - swap) * 100}%)`;

  scrollFrame(siteA, SCROLL_A, t);
  scrollFrame(siteB, SCROLL_B, t);
  renderCaption(t);
  runTaps(t);

  // Yakun
  const endIn = progress(t, 35.4, 36.6);
  $('#end').style.opacity = endIn;
  $('#end').style.transform = `translateY(${mix(24, 0, endIn)}px)`;
};

buildSky();
window.duration = DURATION;
window.fps = FPS;

const loaded = (frame) =>
  new Promise((resolve) => {
    if (frame.contentDocument?.readyState === 'complete') resolve();
    else frame.addEventListener('load', resolve, { once: true });
  });

await Promise.all([loaded(siteA), loaded(siteB), document.fonts.ready]);
for (const frame of [siteA, siteB]) await frame.contentDocument.fonts.ready;
window.renderAt(0);
window.isReady = true;

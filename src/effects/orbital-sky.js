import { setTranslatedText } from '../i18n.js';
import { lerp } from '../utils/math.js';
import { prefersReducedMotion } from '../utils/motion.js';

const TAU = Math.PI * 2;
const ORBIT_TILT = -0.5;
const ORBIT_FLATNESS = 0.42;
const ORBIT_SCALES = [1, 1.55, 2.2, 3];
const TAIL_SEGMENTS = 36;
const TAIL_STEP = 0.016;
const COMET_PERIOD = 11;
const COMET_DURATION = 1.5;
const COMET_LENGTH = 150;
const MAX_STARS = 260;
const FRAME_INTERVAL = 30;
const MAX_PIXEL_RATIO = 1.5;
const COLORS = { white: '#fff', star: '#eef2f5', ice: '#8fd3ff', orbit: '#c9d6df' };

/** Har chizishda bir xil yulduzlar chiqishi uchun urug'li tasodifiy son. */
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

const wrap = (value, size) => ((value % size) + size) % size;

function starDepth(random) {
  const value = random();
  if (value < 0.6) return 0.25;
  return value < 0.9 ? 0.55 : 1;
}

class Sky {
  time = 7;
  isVisible = false;
  pointer = { x: 0, y: 0 };
  offset = { x: 0, y: 0 };
  width = 0;
  height = 0;
  stars = [];
  center = { x: 0, y: 0 };
  radius = 0;

  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.host = canvas.parentElement;
    this.logo = this.host.querySelector('.hero__logo');

    this.host.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      this.pointer = { x: event.clientX / innerWidth - 0.5, y: event.clientY / innerHeight - 0.5 };
    });
    new IntersectionObserver((entries) => {
      this.isVisible = entries.at(-1).isIntersecting;
    }).observe(canvas);
    new ResizeObserver(() => this.resize()).observe(this.host);
    this.resize();
  }

  resize() {
    const ratio = Math.min(devicePixelRatio || 1, MAX_PIXEL_RATIO);
    this.width = this.host.clientWidth;
    this.height = this.host.clientHeight;
    this.canvas.width = this.width * ratio;
    this.canvas.height = this.height * ratio;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.createStars();
    this.placeOrbits();
    this.draw();
  }

  createStars() {
    const random = createRandom(41);
    const count = Math.min(MAX_STARS, Math.round((this.width * this.height) / 5200));

    this.stars = Array.from({ length: count }, () => ({
      depth: starDepth(random),
      x: random() * this.width,
      y: random() * this.height,
      phase: random() * TAU,
      isIce: random() < 0.14,
    }));
  }

  placeOrbits() {
    if (!this.logo) {
      this.center = { x: this.width * 0.82, y: this.height * 0.55 };
      this.radius = Math.min(this.width * 0.4, 320);
      return;
    }

    const host = this.host.getBoundingClientRect();
    const logo = this.logo.getBoundingClientRect();
    this.center = {
      x: logo.left - host.left + logo.width / 2,
      y: logo.top - host.top + logo.height / 2,
    };
    this.radius = logo.width * 0.62;
  }

  update(seconds) {
    this.time += seconds;
    this.offset.x = lerp(this.offset.x, this.pointer.x, 0.05);
    this.offset.y = lerp(this.offset.y, this.pointer.y, 0.05);
    this.draw();
  }

  draw() {
    this.context.globalAlpha = 1;
    this.context.clearRect(0, 0, this.width, this.height);
    this.drawGlow();
    this.drawStars();
    ORBIT_SCALES.forEach((scale, index) => this.drawOrbit(scale, index));
    this.drawComet();
    this.context.globalAlpha = 1;
  }

  drawGlow() {
    const { context, center } = this;
    const gradient = context.createRadialGradient(
      center.x,
      center.y,
      0,
      center.x,
      center.y,
      this.radius * 2.2,
    );
    gradient.addColorStop(0, 'rgba(120, 165, 200, 0.13)');
    gradient.addColorStop(1, 'rgba(120, 165, 200, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, this.width, this.height);
  }

  drawStars() {
    const { context, time, offset } = this;

    for (const star of this.stars) {
      const x = wrap(star.x + time * star.depth * 7 + offset.x * star.depth * 22, this.width);
      const y = wrap(star.y - time * star.depth * 3.2 + offset.y * star.depth * 22, this.height);
      const twinkle = 0.65 + 0.35 * Math.sin(time * 1.1 + star.phase);

      context.globalAlpha = (0.18 + star.depth * 0.5) * twinkle;
      context.fillStyle = star.isIce ? COLORS.ice : COLORS.star;
      context.beginPath();
      context.arc(x, y, 0.45 + star.depth * 0.85, 0, TAU);
      context.fill();
    }
  }

  orbitPoint(radius, angle) {
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * ORBIT_FLATNESS;

    return {
      x: this.center.x + x * Math.cos(ORBIT_TILT) - y * Math.sin(ORBIT_TILT) + this.offset.x * 14,
      y: this.center.y + x * Math.sin(ORBIT_TILT) + y * Math.cos(ORBIT_TILT) + this.offset.y * 14,
    };
  }

  drawOrbit(scale, index) {
    const { context, center, offset } = this;
    const radius = this.radius * scale;

    context.globalAlpha = 0.17 - index * 0.03;
    context.strokeStyle = COLORS.orbit;
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(
      center.x + offset.x * 14,
      center.y + offset.y * 14,
      radius,
      radius * ORBIT_FLATNESS,
      ORBIT_TILT,
      0,
      TAU,
    );
    context.stroke();

    // Kepler qonuniga o'xshab, uzoq orbitada uchqun sekinroq yuradi.
    const speed = 0.28 / Math.sqrt(scale ** 3);
    const sparkCount = index % 2 ? 2 : 1;
    const color = index % 2 ? COLORS.white : COLORS.ice;

    for (let spark = 0; spark < sparkCount; spark += 1) {
      this.drawSpark(radius, this.time * speed + index * 2.1 + spark * 3.1, color);
    }
  }

  drawSpark(radius, angle, color) {
    const { context } = this;

    for (let segment = 0; segment < TAIL_SEGMENTS; segment += 1) {
      const fade = 1 - segment / TAIL_SEGMENTS;
      const from = this.orbitPoint(radius, angle - segment * TAIL_STEP);
      const to = this.orbitPoint(radius, angle - (segment + 1) * TAIL_STEP);

      context.globalAlpha = fade * fade * 0.6;
      context.strokeStyle = color;
      context.lineWidth = 0.5 + fade * 1.5;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }

    const head = this.orbitPoint(radius, angle);
    context.globalAlpha = 0.9;
    context.fillStyle = COLORS.white;
    context.beginPath();
    context.arc(head.x, head.y, 2, 0, TAU);
    context.fill();
  }

  drawComet() {
    const { context, width, height } = this;
    const cycleTime = this.time % COMET_PERIOD;
    if (cycleTime >= COMET_DURATION) return;

    const cycle = Math.floor(this.time / COMET_PERIOD);
    const progress = cycleTime / COMET_DURATION;
    const x = width * (0.15 + ((cycle * 0.37) % 0.6) + progress * 0.4);
    const y = height * (0.5 - ((cycle * 0.23) % 0.3) - progress * 0.2);
    const tailX = x - COMET_LENGTH;
    const tailY = y + COMET_LENGTH / 2;
    const gradient = context.createLinearGradient(x, y, tailX, tailY);
    gradient.addColorStop(0, COLORS.white);
    gradient.addColorStop(1, 'rgba(143, 211, 255, 0)');

    context.globalAlpha = Math.sin(progress * Math.PI) * 0.8;
    context.strokeStyle = gradient;
    context.lineWidth = 1.6;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(tailX, tailY);
    context.stroke();
  }
}

/** Qora bo'limlar fonidagi yulduzlar, orbitalar va kometa. */
export function initOrbitalSky() {
  const skies = [...document.querySelectorAll('.orbital-sky')].map((canvas) => new Sky(canvas));
  const toggle = document.getElementById('motion-toggle');
  let isRunning = !prefersReducedMotion;
  let lastFrame = 0;

  const renderToggle = () =>
    setTranslatedText(toggle, isRunning ? "Fonni to'xtatish" : 'Fonni yurgizish');

  const tick = (now) => {
    requestAnimationFrame(tick);
    if (now - lastFrame < FRAME_INTERVAL) return;

    const seconds = Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;
    if (!isRunning || document.hidden) return;
    skies.filter((sky) => sky.isVisible).forEach((sky) => sky.update(seconds));
  };

  toggle.addEventListener('click', () => {
    isRunning = !isRunning;
    renderToggle();
  });

  renderToggle();
  requestAnimationFrame(tick);
}

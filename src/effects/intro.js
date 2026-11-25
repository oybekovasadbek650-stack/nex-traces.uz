import logoSvg from '../assets/logo/animated-logo.svg?raw';
import { easeInOutCubic, easeOutCubic, lerp, progressBetween } from '../utils/math.js';
import { prefersReducedMotion } from '../utils/motion.js';
import { playIntroSound } from './intro-sound.js';

/** Animatsiya bosqichlari, soniyada. */
const TIMELINE = {
  orbit: [0, 1],
  letters: [0.3, 0.85],
  letterDelay: 0.14,
  tail: [0.95, 1.3],
  flash: [0.95, 1.45],
  landing: [1.45, 2],
  end: 2,
};
const FAILSAFE_DELAY = 3500;

function shouldSkip() {
  const opensSection = location.hash && location.hash !== '#ru';
  return prefersReducedMotion || opensSection || scrollY > 50;
}

function createIntro() {
  const intro = document.createElement('div');
  intro.className = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = '<div class="intro__backdrop"></div><div class="intro__logo"></div>';
  document.body.append(intro);
  return intro;
}

/** Yulduz orbitani chizadi, N ochiladi, logo birinchi ekrandagi joyiga qo'nadi. */
function playIntro(intro) {
  const box = intro.querySelector('.intro__logo');
  const backdrop = intro.querySelector('.intro__backdrop');
  const heroLogo = document.querySelector('.hero__logo');
  box.innerHTML = logoSvg;

  const svg = box.querySelector('svg');
  const orbit = box.querySelector('.logo-orbit-main');
  const tail = box.querySelector('.logo-orbit-tail');
  const letters = [...box.querySelectorAll('.logo-letter')];
  const star = box.querySelector('.logo-star');
  const glow = box.querySelector('.logo-glow');
  const orbitLength = orbit.getTotalLength();
  const tailLength = tail.getTotalLength();
  let startedAt = null;
  let isFinished = false;

  orbit.style.strokeDasharray = orbitLength;
  tail.style.strokeDasharray = tailLength;
  heroLogo.style.opacity = 0;

  const stopSound = playIntroSound();

  const finish = () => {
    if (isFinished) return;
    isFinished = true;
    heroLogo.style.opacity = '';
    intro.remove();
    removeEventListener('keydown', skip);
    removeEventListener('wheel', skip);
  };

  const drawOrbit = (time) => {
    const orbitProgress = easeInOutCubic(progressBetween(time, ...TIMELINE.orbit));
    const tailProgress = easeOutCubic(progressBetween(time, ...TIMELINE.tail));
    const flash = Math.sin(progressBetween(time, ...TIMELINE.flash) * Math.PI);
    const { x, y } = orbit.getPointAtLength(orbitLength * orbitProgress);
    const scale = 0.75 + 0.25 * orbitProgress + flash * 0.7;
    const rotation = (1 - orbitProgress) * -90;

    orbit.style.strokeDashoffset = orbitLength * (1 - orbitProgress);
    tail.style.strokeDashoffset = tailLength * (1 - tailProgress);
    star.setAttribute('transform', `translate(${x} ${y}) scale(${scale}) rotate(${rotation})`);
    glow.setAttribute('cx', x);
    glow.setAttribute('cy', y);
    glow.setAttribute('r', 60 + 10 * orbitProgress + flash * 130);
  };

  const drawLetters = (time) => {
    letters.forEach((letter, index) => {
      const delay = index * TIMELINE.letterDelay;
      const [start, end] = TIMELINE.letters;
      const progress = easeOutCubic(progressBetween(time, start + delay, end + delay));
      const direction = index === 0 ? 1 : -1;
      const shift = direction * (1 - progress);

      letter.style.opacity = progress;
      letter.setAttribute('transform', `translate(${shift * -46} ${shift * -44})`);
    });
  };

  const land = (time) => {
    const progress = easeInOutCubic(progressBetween(time, ...TIMELINE.landing));
    if (progress === 0) return;

    const from = box.getBoundingClientRect();
    const to = heroLogo.getBoundingClientRect();
    const x = (to.left - from.left) * progress;
    const y = (to.top - from.top) * progress;

    svg.style.transform = `translate(${x}px, ${y}px) scale(${lerp(1, to.width / from.width, progress)})`;
    backdrop.style.opacity = 1 - progressBetween(time, ...TIMELINE.landing);
  };

  const render = (now) => {
    if (isFinished) return;
    startedAt ??= now;
    const time = (now - startedAt) / 1000;

    drawOrbit(time);
    drawLetters(time);
    land(time);

    if (time >= TIMELINE.end) finish();
    else requestAnimationFrame(render);
  };

  const skip = () => {
    stopSound?.();
    finish();
  };

  intro.addEventListener('click', skip);
  addEventListener('keydown', skip);
  addEventListener('wheel', skip, { passive: true });
  setTimeout(finish, FAILSAFE_DELAY);
  requestAnimationFrame(render);
}

export function initIntro() {
  const intro = document.getElementById('intro');
  const replay = document.getElementById('replay-intro');

  if (shouldSkip()) intro.remove();
  else playIntro(intro);

  if (prefersReducedMotion) {
    replay.hidden = true;
    return;
  }

  replay.addEventListener('click', () => {
    if (document.querySelector('.intro')) return;
    scrollTo({ top: 0, behavior: 'instant' });
    playIntro(createIntro());
  });
}

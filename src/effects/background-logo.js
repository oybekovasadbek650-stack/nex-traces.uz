import logoSvg from '../assets/logo/animated-logo.svg?raw';
import { clamp, lerp, progressBetween } from '../utils/math.js';
import { prefersReducedMotion } from '../utils/motion.js';

const MAIN_ORBIT_END = 0.6;
const TAIL_END = 0.95;

function createLogo() {
  const wrapper = document.createElement('div');
  wrapper.className = 'background-logo';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = logoSvg
    // Ranglar CSS'dan olinadi, mask id esa kirish logosiniki bilan to'qnashmasin.
    .replace(/<(linear|radial)Gradient[\s\S]*?<\/\1Gradient>/gi, '')
    .replaceAll('logo-mask', 'background-logo-mask');

  wrapper.querySelector('.logo-glow').remove();
  const orbit = wrapper.querySelector('g[mask]');
  const orbitBase = orbit.querySelector('path').cloneNode();
  orbitBase.setAttribute('class', 'logo-orbit-base');
  orbit.before(orbitBase);

  return wrapper;
}

/** Oq bo'limlar ortidagi logo: scroll orbitani chizadi, yulduz uning bo'ylab uchadi. */
export function initBackgroundLogo() {
  const main = document.querySelector('main');
  const logo = createLogo();
  document.body.prepend(logo);

  const svg = logo.querySelector('svg');
  const orbit = logo.querySelector('.logo-orbit-main');
  const tail = logo.querySelector('.logo-orbit-tail');
  const star = logo.querySelector('.logo-star');
  const orbitLength = orbit.getTotalLength();
  const tailLength = tail.getTotalLength();
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  let progress = null;
  let frame = 0;

  orbit.style.strokeDasharray = orbitLength;
  tail.style.strokeDasharray = tailLength;

  const targetProgress = () => {
    if (prefersReducedMotion) return 1;
    const { top, height } = main.getBoundingClientRect();
    return clamp((innerHeight - top) / height);
  };

  const drawOrbit = () => {
    const orbitProgress = progressBetween(progress, 0, MAIN_ORBIT_END);
    const tailProgress = progressBetween(progress, MAIN_ORBIT_END, TAIL_END);
    const point =
      tailProgress > 0
        ? tail.getPointAtLength(tailLength * tailProgress)
        : orbit.getPointAtLength(orbitLength * orbitProgress);

    orbit.style.strokeDashoffset = orbitLength * (1 - orbitProgress);
    tail.style.strokeDashoffset = tailLength * (1 - tailProgress);
    star.setAttribute(
      'transform',
      `translate(${point.x} ${point.y}) rotate(${progress * 360}) scale(0.8)`,
    );
  };

  const render = () => {
    frame = 0;
    const target = targetProgress();
    progress = progress === null || prefersReducedMotion ? target : lerp(progress, target, 0.12);
    tilt.x = lerp(tilt.x, pointer.x, 0.08);
    tilt.y = lerp(tilt.y, pointer.y, 0.08);
    drawOrbit();

    if (prefersReducedMotion) return;

    const rotateY = (progress - 0.5) * 34 + tilt.x * 10;
    const rotateX = (0.5 - progress) * 14 - tilt.y * 8;
    svg.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${0.94 + 0.12 * progress})`;

    const isMoving =
      Math.abs(target - progress) > 0.0005 ||
      Math.abs(pointer.x - tilt.x) > 0.004 ||
      Math.abs(pointer.y - tilt.y) > 0.004;
    if (isMoving) scheduleRender();
  };

  function scheduleRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return;
    const { top, bottom } = main.getBoundingClientRect();
    if (top > innerHeight || bottom < 0) return;

    pointer.x = event.clientX / innerWidth - 0.5;
    pointer.y = event.clientY / innerHeight - 0.5;
    scheduleRender();
  };

  render();
  addEventListener('scroll', scheduleRender, { passive: true });
  addEventListener('resize', scheduleRender);
  addEventListener('pointermove', handlePointerMove, { passive: true });
}

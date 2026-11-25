import { PROCESSES } from '../data/processes.js';
import { translateTree } from '../i18n.js';
import { easeOutCubic, lerp, progressBetween } from '../utils/math.js';
import { prefersReducedMotion } from '../utils/motion.js';

const STEP_COUNT = 4;
const STEP_INTERVAL = 1900;
const STAR_DURATION = 700;

/** Yulduz har bir qadam ustunining o'rtasida turadi. */
const starPositionForStep = (step) => (step + 0.5) / STEP_COUNT;

function createStar() {
  const path = document.getElementById('process-orbit-path');
  const star = document.getElementById('process-orbit-star');
  const length = path.getTotalLength();
  let position = starPositionForStep(0);
  let frame = 0;

  const render = () => {
    const { x, y } = path.getPointAtLength(length * position);
    star.setAttribute('transform', `translate(${x} ${y})`);
  };

  const moveTo = (target) => {
    cancelAnimationFrame(frame);

    if (prefersReducedMotion) {
      position = target;
      render();
      return;
    }

    const from = position;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = progressBetween(now, startedAt, startedAt + STAR_DURATION);
      position = lerp(from, target, easeOutCubic(progress));
      render();
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    tick(startedAt);
  };

  return { moveTo };
}

export function initProcessDemo() {
  const tabs = document.getElementById('process-tabs');
  const stage = document.getElementById('process-stage');
  const steps = document.getElementById('process-steps');
  const star = createStar();
  let activeStep = 0;

  const renderActiveStep = () => {
    [...steps.children].forEach((item, index) => {
      item.classList.toggle('is-active', index === activeStep);
      item.classList.toggle('is-done', index < activeStep);
    });
    star.moveTo(starPositionForStep(activeStep));
  };

  const showProcess = (processIndex) => {
    const process = PROCESSES[processIndex];
    activeStep = 0;

    stage.innerHTML = process.screen;
    steps.innerHTML = process.steps
      .map(({ title, text }) => `<li><div><strong>${title}</strong><span>${text}</span></div></li>`)
      .join('');
    translateTree(stage);
    translateTree(steps);

    [...tabs.children].forEach((tab, index) => {
      tab.setAttribute('aria-pressed', String(index === processIndex));
    });
    renderActiveStep();
  };

  PROCESSES.forEach(({ title }, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `process-tab-${index}`;
    tab.textContent = title;
    tab.addEventListener('click', () => showProcess(index));
    tabs.append(tab);
  });

  showProcess(0);

  if (!prefersReducedMotion) {
    setInterval(() => {
      activeStep = (activeStep + 1) % STEP_COUNT;
      renderActiveStep();
    }, STEP_INTERVAL);
  }
}

import { clamp } from '../utils/math.js';
import { prefersReducedMotion } from '../utils/motion.js';

const DESKTOP_QUERY = matchMedia('(min-width: 821px)');
const TRACE_START_Y = 40;
const SEARCH_STEPS = 16;

/** Nuqtalarni silliq S shaklidagi egri chiziq bilan ulaydi. */
function buildPath(points) {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M${x} ${y}`;
    const [previousX, previousY] = points[index - 1];
    const middleY = (previousY + y) / 2;
    return `${path} C${previousX} ${middleY} ${x} ${middleY} ${x} ${y}`;
  }, '');
}

/** Scroll bilan yuradigan yulduz va uning izi. */
export function initSectionTrace() {
  const content = document.getElementById('page-content');
  const container = content.querySelector('.container');
  const contactTitle = document.querySelector('.contact-section h2');
  const trace = document.getElementById('section-trace');
  const rail = trace.querySelector('.section-trace__rail');
  const line = trace.querySelector('.section-trace__line');
  const star = trace.querySelector('.section-trace__star');
  let length = 0;
  let endY = 0;
  let frame = 0;

  const collectPoints = () => {
    const contentTop = content.getBoundingClientRect().top;
    const isDesktop = DESKTOP_QUERY.matches;
    const gutter = parseFloat(getComputedStyle(container).paddingLeft);
    const railX = container.getBoundingClientRect().left + gutter - (isDesktop ? 24 : 16);
    const points = [[railX, TRACE_START_Y]];

    endY = contactTitle.getBoundingClientRect().top - contentTop + 20;

    if (isDesktop) {
      let lastY = TRACE_START_Y;

      document.querySelectorAll('.case-study').forEach((caseStudy, index) => {
        const [left, right] = [...caseStudy.children]
          .map((column) => column.getBoundingClientRect())
          .sort((a, b) => a.left - b.left);
        const gapX = (left.right + right.left) / 2;
        const top = Math.min(left.top, right.top) - contentTop;
        const bottom = Math.max(left.bottom, right.bottom) - contentTop;

        if (index === 0) points.push([railX, top - 70]);
        points.push([gapX, top], [gapX, bottom]);
        lastY = bottom;
      });

      points.push([railX, lastY + 110]);
    }

    points.push([railX, endY]);
    return points;
  };

  /** Chiziq faqat pastga yuradi, shuning uchun uzunlik ikkilik qidiruv bilan topiladi. */
  const lengthAtY = (y) => {
    let low = 0;
    let high = length;

    for (let step = 0; step < SEARCH_STEPS; step += 1) {
      const middle = (low + high) / 2;
      if (line.getPointAtLength(middle).y < y) low = middle;
      else high = middle;
    }

    return high;
  };

  const currentY = () => {
    if (prefersReducedMotion) return endY;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const scrollProgress = maxScroll > 0 ? clamp(scrollY / maxScroll) : 0;
    const viewportY = innerHeight * (0.5 + 0.5 * scrollProgress);
    return clamp(viewportY - content.getBoundingClientRect().top, TRACE_START_Y, endY);
  };

  const draw = () => {
    const drawn = lengthAtY(currentY());
    const { x, y } = line.getPointAtLength(drawn);
    line.style.strokeDashoffset = length - drawn;
    star.setAttribute('transform', `translate(${x} ${y})`);
  };

  const layout = () => {
    const path = buildPath(collectPoints());
    rail.setAttribute('d', path);
    line.setAttribute('d', path);
    length = line.getTotalLength();
    line.style.strokeDasharray = length;
    draw();
  };

  const scheduleDraw = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
  };

  layout();
  addEventListener('scroll', scheduleDraw, { passive: true });
  addEventListener('resize', layout);
  new ResizeObserver(layout).observe(content);
}

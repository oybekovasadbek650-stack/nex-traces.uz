import { getLocale, onLocaleChange, setTranslatedText } from '../i18n.js';
import { prefersReducedMotion } from '../utils/motion.js';

const PLAY_LABEL = 'Videoni yurgizish';
const PAUSE_LABEL = "Videoni to'xtatish";

/** Ekranga kirganda ovozsiz ijro etiladi. Foydalanuvchi to'xtatsa, qayta o'zi boshlanmaydi. */
function initVideo(wrapper) {
  const video = wrapper.querySelector('video');
  const toggle = wrapper.querySelector('button');
  let isPausedByUser = prefersReducedMotion;
  let isVisible = false;

  const renderToggle = () => setTranslatedText(toggle, video.paused ? PLAY_LABEL : PAUSE_LABEL);

  // Brauzer avtomatik ijroni taqiqlasa, poster va tugma qoladi.
  const play = () => video.play().catch(renderToggle);

  const loadLocale = () => {
    const path = `/videos/${video.dataset.name}-${getLocale()}`;
    if (video.getAttribute('src') === `${path}.mp4`) return;

    video.poster = `${path}.jpg`;
    video.src = `${path}.mp4`;
    if (isVisible && !isPausedByUser) play();
  };

  video.addEventListener('play', renderToggle);
  video.addEventListener('pause', renderToggle);
  toggle.addEventListener('click', () => {
    isPausedByUser = !video.paused;
    if (video.paused) play();
    else video.pause();
  });

  new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      if (!isVisible) video.pause();
      else if (!isPausedByUser) play();
    },
    { threshold: 0.35 },
  ).observe(video);

  onLocaleChange(loadLocale);
  loadLocale();
  renderToggle();
}

export function initVideos() {
  document.querySelectorAll('.video').forEach(initVideo);
}

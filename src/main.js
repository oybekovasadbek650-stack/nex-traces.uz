import { initBackgroundLogo } from './effects/background-logo.js';
import { initIntro } from './effects/intro.js';
import { initOrbitalSky } from './effects/orbital-sky.js';
import { initSectionTrace } from './effects/section-trace.js';
import { initContacts } from './components/contacts.js';
import { initProcessDemo } from './components/process-demo.js';
import { initVideos } from './components/videos.js';
import { initI18n } from './i18n.js';

// Avval kontent chiziladi, keyin tarjima, undan keyin o'lchamga bog'liq effektlar.
initContacts();
initProcessDemo();
initVideos();
initI18n();

initSectionTrace();
initOrbitalSky();
initBackgroundLogo();
initIntro();

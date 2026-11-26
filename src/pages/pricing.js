import { initContacts } from '../components/contacts.js';
import { initPricing } from '../components/pricing.js';
import { initOrbitalSky } from '../effects/orbital-sky.js';
import { initI18n } from '../i18n.js';

// Narxlar sahifasi: avval kontent, keyin tarjima, keyin fon.
initContacts();
initPricing();
initI18n();
initOrbitalSky();

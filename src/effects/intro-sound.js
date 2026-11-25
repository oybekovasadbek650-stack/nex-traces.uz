/** Kirish ovozi: uchish shovqini, chaqnash jarangi va qo'nish. Fayl yuklanmaydi, brauzer o'zi yasaydi. */

const MASTER_VOLUME = 0.5;
const CHIME_NOTES = [523.25, 783.99, 1046.5, 1567.98];

function createNoise(context, seconds) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  source.buffer = buffer;
  return source;
}

/** Yulduz orbita bo'ylab uchadi: 0-1 soniya. */
function playFlight(context, output, start) {
  const noise = createNoise(context, 1.2);
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  filter.type = 'bandpass';
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(220, start);
  filter.frequency.exponentialRampToValueAtTime(2600, start + 0.95);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.5, start + 0.75);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.15);

  noise.connect(filter).connect(gain).connect(output);
  noise.start(start);
}

function playTone(context, output, { frequency, start, length, volume, type = 'sine' }) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

  oscillator.connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + length);
}

/**
 * Brauzer ovozga ruxsat bermagan bo'lsa null qaytaradi.
 * Aks holda ovozni to'xtatadigan funksiya qaytaradi.
 */
export function playIntroSound() {
  const Context = window.AudioContext ?? window.webkitAudioContext;
  if (!Context) return null;

  const context = new Context();
  // Tugma bosilganda "suspended" holat resume() bilan ochiladi, bosilmasdan ochilmaydi.
  if (context.state === 'suspended' && !navigator.userActivation?.isActive) {
    context.close();
    return null;
  }
  context.resume();

  const output = context.createGain();
  output.gain.value = MASTER_VOLUME;
  output.connect(context.destination);

  const start = context.currentTime + 0.03;
  playFlight(context, output, start);
  CHIME_NOTES.forEach((frequency, index) =>
    playTone(context, output, {
      frequency,
      start: start + 0.97 + index * 0.06,
      length: 1.5,
      volume: 0.16,
    }),
  );
  playTone(context, output, {
    frequency: 65.4,
    start: start + 1.85,
    length: 0.9,
    volume: 0.5,
    type: 'triangle',
  });

  const closeTimer = setTimeout(() => context.close(), 3500);

  return () => {
    clearTimeout(closeTimer);
    if (context.state === 'closed') return;
    output.gain.setTargetAtTime(0, context.currentTime, 0.08);
    setTimeout(() => context.state !== 'closed' && context.close(), 500);
  };
}

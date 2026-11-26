/**
 * Reklama videosini (9:16, 1080x1920) chiqaradi:
 *   node scripts/videos/render-promo.mjs chiqish.mp4 [promo.html|promo2.html] [ovoz.wav]
 * Kerak: ishlab turgan `npm run dev` (5173), Google Chrome va PATH'dagi ffmpeg.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9337;
const OUTPUT = process.argv[2] ?? 'promo.mp4';
const PAGE = process.argv[3] ?? 'promo.html';
const AUDIO = process.argv[4];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Iframe ichida vaqtni to'xtatadi: sayt animatsiyalari faqat __advance(ms) bilan yuradi. */
const VIRTUAL_TIME = `(() => {
  if (window === window.top) return;
  let now = 0;
  let nextId = 1;
  const frames = new Map();
  let timers = [];
  performance.now = () => now;
  window.requestAnimationFrame = (callback) => { const id = nextId++; frames.set(id, callback); return id; };
  window.cancelAnimationFrame = (id) => frames.delete(id);
  window.setTimeout = (fn, ms = 0, ...args) => { const id = nextId++; timers.push({ id, at: now + ms, fn: () => fn(...args) }); return id; };
  window.setInterval = (fn, ms = 0, ...args) => { const id = nextId++; timers.push({ id, at: now + ms, every: Math.max(ms, 1), fn: () => fn(...args) }); return id; };
  window.clearTimeout = window.clearInterval = (id) => { timers = timers.filter((timer) => timer.id !== id); };
  window.__advance = (ms) => {
    let left = ms;
    while (left > 0.01) {
      const step = Math.min(1000 / 60, left);
      now += step;
      left -= step;
      for (const timer of [...timers]) {
        if (timer.at > now) continue;
        if (timer.every) timer.at += timer.every;
        else timers = timers.filter((item) => item !== timer);
        try { timer.fn(); } catch (error) { console.error(error); }
      }
      const due = [...frames.values()];
      frames.clear();
      for (const callback of due) { try { callback(now); } catch (error) { console.error(error); } }
    }
    for (const animation of document.getAnimations()) {
      if (animation.__start === undefined) {
        animation.__start = now - (animation.currentTime ?? 0);
        animation.pause();
      }
      animation.currentTime = now - animation.__start;
    }
  };
})();`;

const temporary = mkdtempSync(path.join(tmpdir(), 'nt-promo-'));
const framesDir = path.join(temporary, 'frames');
mkdirSync(framesDir);

const chrome = spawn(CHROME, [
  ...['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`],
  ...[
    `--user-data-dir=${temporary}/profile`,
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ],
]);
await wait(3000);

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const socket = new WebSocket(targets.find(({ type }) => type === 'page').webSocketDebuggerUrl);
await new Promise((resolve) => (socket.onopen = resolve));

const pending = new Map();
let lastId = 0;
socket.onmessage = ({ data }) => {
  const { id, result } = JSON.parse(data);
  pending.get(id)?.(result);
  pending.delete(id);
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    lastId += 1;
    pending.set(lastId, resolve);
    socket.send(JSON.stringify({ id: lastId, method, params }));
  });
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result
    ?.value;

await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: VIRTUAL_TIME });
await send('Emulation.setDeviceMetricsOverride', {
  width: 540,
  height: 960,
  deviceScaleFactor: 2,
  mobile: false,
});
await send('Page.navigate', { url: `http://localhost:5173/scripts/videos/${PAGE}` });

for (let attempt = 0; attempt < 100; attempt += 1) {
  await wait(300);
  if (await evaluate('window.isReady === true')) break;
  if (attempt === 99) throw new Error('promo sahnasi ochilmadi');
}
await wait(1500);

const duration = await evaluate('window.duration');
const fps = await evaluate('window.fps');
const frameCount = Math.round(duration * fps);

const preview = process.env.PREVIEW?.split(',').map((time) => Math.round(Number(time) * fps));

for (let frame = 0; frame < frameCount; frame += 1) {
  await evaluate(`window.renderAt(${frame / fps})`);
  if (preview) {
    if (!preview.includes(frame)) continue;
    const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
    writeFileSync(`${OUTPUT}-${frame / fps}.jpg`, Buffer.from(data, 'base64'));
    if (frame >= Math.max(...preview)) break;
    continue;
  }
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  writeFileSync(
    path.join(framesDir, `${String(frame).padStart(4, '0')}.jpg`),
    Buffer.from(data, 'base64'),
  );
  if (frame % 150 === 0) console.log(`kadr ${frame}/${frameCount}`);
}

if (!preview)
  execFileSync('ffmpeg', [
    ...['-v', 'error', '-y', '-framerate', String(fps), '-i', path.join(framesDir, '%04d.jpg')],
    ...(AUDIO ? ['-i', AUDIO, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    ...['-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p'],
    ...['-movflags', '+faststart', OUTPUT],
  ]);
console.log('tayyor:', OUTPUT, frameCount);

chrome.kill();
await wait(500);
rmSync(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
process.exit();

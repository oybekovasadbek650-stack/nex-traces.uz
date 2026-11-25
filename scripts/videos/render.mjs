/**
 * Sahnalarni mp4 qilib chiqaradi: node scripts/videos/render.mjs [sahna...]
 * Kerak: ishlab turgan `npm run dev` (5173), Google Chrome va PATH'dagi ffmpeg.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SCENES } from './scenes.js';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9335;
const FPS = 25;
const OUTPUT = 'public/videos';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const temporary = mkdtempSync(path.join(tmpdir(), 'nt-video-'));
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

mkdirSync('scripts/videos/.frames', { recursive: true });
ffmpeg(
  ...['-i', 'scripts/videos/source/panel.mp4', '-vf', 'setpts=PTS*12/18.8,fps=25'],
  ...['-frames:v', '300', '-q:v', '2', 'scripts/videos/.frames/%04d.jpg'],
);

const chrome = spawn(CHROME, [
  ...['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`],
  ...[`--user-data-dir=${temporary}/profile`, 'about:blank'],
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
    .value;

await send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 720,
  deviceScaleFactor: 1,
  mobile: false,
});

const names = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(SCENES);

for (const name of names) {
  for (const locale of ['uz', 'ru']) {
    await send('Page.navigate', {
      url: `http://localhost:5173/scripts/videos/scene.html?scene=${name}&locale=${locale}`,
    });
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await wait(300);
      if (await evaluate('window.isReady === true')) break;
      if (attempt === 39) throw new Error(`${name}: sahna ochilmadi`);
    }

    const frameCount = Math.round((await evaluate('window.duration')) * FPS);
    for (let frame = 0; frame < frameCount; frame += 1) {
      await evaluate(`window.renderAt(${frame / FPS})`);
      const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 94 });
      const file = path.join(temporary, `${String(frame).padStart(4, '0')}.jpg`);
      writeFileSync(file, Buffer.from(data, 'base64'));
    }

    const output = `${OUTPUT}/${name}-${locale}`;
    ffmpeg(
      ...['-framerate', String(FPS), '-i', path.join(temporary, '%04d.jpg')],
      ...['-frames:v', String(frameCount), '-c:v', 'libx264', '-preset', 'slow', '-crf', '24'],
      ...['-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${output}.mp4`],
    );
    ffmpeg('-ss', '1.6', '-i', `${output}.mp4`, '-frames:v', '1', '-q:v', '4', `${output}.jpg`);
    console.log(output, frameCount);
  }
}

chrome.kill();
await wait(500);
rmSync(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
process.exit();

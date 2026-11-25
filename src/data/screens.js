/** Jarayon ekranlarini yasaydigan HTML shablonlar. */

export const screen = (title, label, body) => `
  <div class="screen">
    <div class="screen__bar"><span>${title}</span><span>${label}</span></div>
    ${body}
  </div>`;

export const detailList = (rows) => `
  <div class="detail-list">
    ${rows.map(([label, value]) => `<div><span>${label}</span><span>${value}</span></div>`).join('')}
  </div>`;

export const chatMessages = (messages) => `
  <div class="messages">
    ${messages
      .map(({ text, own }) => `<div class="message${own ? ' message--own' : ''}">${text}</div>`)
      .join('')}
  </div>`;

const DESK_ROWS = 3;
const DESK_COLUMNS = 4;

function studentDesk(row, column) {
  const x = 100 + column * 118;
  const y = 130 + row * 76;
  const delay = (row + column) * 0.12;

  return `
    <rect x="${x}" y="${y}" width="72" height="26" rx="4" fill="#323a40" />
    <circle cx="${x + 36}" cy="${y + 42}" r="11" fill="#8d979e" />
    <rect class="detection-box" style="animation-delay:${delay}s" x="${x + 20}" y="${y + 26}"
      width="32" height="32" fill="none" stroke="#b9c2c8" stroke-width="1.5" />`;
}

export function classroomScheme() {
  const desks = Array.from({ length: DESK_ROWS * DESK_COLUMNS }, (_, index) =>
    studentDesk(Math.floor(index / DESK_COLUMNS), index % DESK_COLUMNS),
  ).join('');

  return `
    <svg viewBox="0 0 640 370" role="img"
      aria-label="Sinf xonasi sxemasi: o'quvchilar bor, o'qituvchi joyi bo'sh">
      <rect x="50" y="22" width="540" height="326" rx="6" fill="none" stroke="#586168" stroke-width="2" />
      <rect x="190" y="22" width="260" height="8" fill="#8d979e" />
      <rect x="268" y="54" width="104" height="30" rx="4" fill="#323a40" />
      <rect x="252" y="44" width="136" height="50" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="8 6" />
      <text x="402" y="75" fill="#fff" font-family="JetBrains Mono, monospace" font-size="15">o'qituvchi yo'q</text>
      ${desks}
    </svg>`;
}

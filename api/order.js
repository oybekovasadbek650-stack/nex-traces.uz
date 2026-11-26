/**
 * Narxlar sahifasidagi buyurtmani Telegram guruhiga yuboradi (Vercel funksiyasi: POST /api/order).
 * Vercel sozlamalari: TELEGRAM_BOT_TOKEN (BotFather tokeni), TELEGRAM_CHAT_ID (guruh ID, -100...).
 */

const MAX_FIELD = 120;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const recent = new Map();

const clean = (value) =>
  String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, MAX_FIELD);

/** O'zbekiston raqamini +998 XX XXX XX XX ko'rinishiga keltiradi. Noto'g'ri bo'lsa null. */
export function normalizePhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 9) digits = `998${digits}`;
  if (!/^998\d{9}$/.test(digits)) return null;
  return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > RATE_LIMIT;
}

const escapeHtml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function orderText(order, phone) {
  const lines = [
    '🛒 <b>Yangi buyurtma — nex-traces.vercel.app</b>',
    '',
    `👤 Ism: ${escapeHtml(order.name || '—')}`,
    `📞 Telefon: ${phone}`,
    `🏫 Muassasa: ${escapeHtml(order.institution)}`,
    `📦 Paket: ${escapeHtml(order.package)}`,
    `🏢 Filiallar: ${escapeHtml(order.branches)}`,
    `🎥 Har filialda kamera: ~${escapeHtml(order.cameras)}`,
    `💰 Taxminiy narx: ${escapeHtml(order.total)}`,
    `🌐 Til: ${escapeHtml(order.locale)}`,
  ];
  return lines.join('\n');
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'method' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return response.status(503).json({ ok: false, error: 'not_configured' });

  const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body;
  // Yashirin maydon: odam uni ko'rmaydi, bot to'ldiradi.
  if (body?.website) return response.status(200).json({ ok: true });

  const ip =
    String(request.headers['x-forwarded-for'] ?? '')
      .split(',')[0]
      .trim() || 'unknown';
  if (isRateLimited(ip)) return response.status(429).json({ ok: false, error: 'rate_limited' });

  const phone = normalizePhone(body?.phone);
  if (!phone) return response.status(400).json({ ok: false, error: 'phone' });

  const order = {
    name: clean(body.name),
    institution: clean(body.institution),
    package: clean(body.package),
    branches: clean(body.branches),
    cameras: clean(body.cameras),
    total: clean(body.total),
    locale: clean(body.locale) || 'uz',
  };

  const telegram = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: orderText(order, phone), parse_mode: 'HTML' }),
  });

  if (!telegram.ok) {
    console.error('Telegram xatosi', telegram.status, await telegram.text());
    return response.status(502).json({ ok: false, error: 'telegram' });
  }
  return response.status(200).json({ ok: true });
}

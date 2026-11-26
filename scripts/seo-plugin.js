import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { META, PAGES, SITE_NAME, SITE_URL } from '../src/config/site.js';

const LOCALES = Object.keys(META);

const escapeHtml = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

/** Sahifaning til bo'yicha yo'li: "/", "/ru/", "/narxlar/", "/ru/narxlar/". */
const localePath = (locale, pagePath = '') => (locale === 'uz' ? '/' : `/${locale}/`) + pagePath;

function structuredData(locale) {
  const url = SITE_URL ? { url: `${SITE_URL}/` } : {};
  const logo = SITE_URL ? { logo: `${SITE_URL}/icons/icon-512.png` } : {};

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      alternateName: ['NexTraces'],
      ...url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      description: META[locale].description,
      sameAs: ['https://www.instagram.com/nex_traces'],
      ...url,
      ...logo,
    },
  ];
}

function seoTags(locale, page) {
  const tags = [
    `<script type="application/ld+json">${JSON.stringify(structuredData(locale))}</script>`,
  ];

  if (SITE_URL) {
    const pageUrl = SITE_URL + localePath(locale, page.path);
    tags.push(
      `<link rel="canonical" href="${pageUrl}" />`,
      ...LOCALES.map(
        (item) =>
          `<link rel="alternate" hreflang="${item}" href="${SITE_URL}${localePath(item, page.path)}" />`,
      ),
      `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${localePath('uz', page.path)}" />`,
      `<meta property="og:url" content="${pageUrl}" />`,
      `<meta property="og:image" content="${SITE_URL}/og.png" />`,
    );
  }

  return tags.join('\n    ');
}

/** Ichki havolalarni shu til papkasiga yo'naltiradi: "/narxlar/" -> "/ru/narxlar/". */
function localizeLinks(html, locale) {
  if (locale === 'uz') return html;
  return html.replace(
    /href="\/(#[^"]*|narxlar\/[^"]*)?"/g,
    (_, rest = '') => `href="/${locale}/${rest}"`,
  );
}

function localizePage(html, locale, page) {
  const from = page.meta.uz;
  const to = page.meta[locale];

  const localized = html
    .replace('<html lang="uz"', `<html lang="${locale}"`)
    .replaceAll(from.title, to.title)
    .replaceAll(escapeHtml(from.description), escapeHtml(to.description))
    .replace(from.ogLocale, to.ogLocale)
    .replace('</head>', `  ${seoTags(locale, page)}\n  </head>`);

  return localizeLinks(localized, locale);
}

/** Build tugagach har bir sahifa va til uchun HTML, robots.txt va sitemap.xml yaratadi. */
export function seoPlugin() {
  let outDir = 'dist';

  return {
    name: 'nex-traces-seo',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      for (const page of PAGES) {
        const template = await readFile(path.join(outDir, page.file), 'utf8');

        for (const locale of LOCALES) {
          const directory = path.join(outDir, localePath(locale, page.path));
          await mkdir(directory, { recursive: true });
          await writeFile(path.join(directory, 'index.html'), localizePage(template, locale, page));
        }
      }

      const sitemapLine = SITE_URL ? `Sitemap: ${SITE_URL}/sitemap.xml\n` : '';
      await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n${sitemapLine}`);

      if (SITE_URL) {
        const urls = PAGES.flatMap((page) =>
          LOCALES.map(
            (locale) => `<url><loc>${SITE_URL}${localePath(locale, page.path)}</loc></url>`,
          ),
        ).join('');
        await writeFile(
          path.join(outDir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
        );
      }
    },
  };
}

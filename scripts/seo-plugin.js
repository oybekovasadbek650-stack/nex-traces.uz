import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { META, SITE_NAME, SITE_URL } from '../src/config/site.js';

const escapeHtml = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

const localePath = (locale) => (locale === 'uz' ? '/' : `/${locale}/`);

function structuredData(locale) {
  const url = SITE_URL ? { url: `${SITE_URL}/` } : {};
  const logo = SITE_URL ? { logo: `${SITE_URL}/icons/icon-512.png` } : {};

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      alternateName: ['NexTraces', `${SITE_NAME} Research & Development`],
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

function seoTags(locale) {
  const tags = [
    `<script type="application/ld+json">${JSON.stringify(structuredData(locale))}</script>`,
  ];

  if (SITE_URL) {
    const pageUrl = SITE_URL + localePath(locale);
    tags.push(
      `<link rel="canonical" href="${pageUrl}" />`,
      ...Object.keys(META).map(
        (item) =>
          `<link rel="alternate" hreflang="${item}" href="${SITE_URL}${localePath(item)}" />`,
      ),
      `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`,
      `<meta property="og:url" content="${pageUrl}" />`,
      `<meta property="og:image" content="${SITE_URL}/og.png" />`,
    );
  }

  return tags.join('\n    ');
}

function localizePage(html, locale) {
  const from = META.uz;
  const to = META[locale];

  return html
    .replace('<html lang="uz"', `<html lang="${locale}"`)
    .replaceAll(from.title, to.title)
    .replaceAll(escapeHtml(from.description), escapeHtml(to.description))
    .replace(from.ogLocale, to.ogLocale)
    .replace('</head>', `  ${seoTags(locale)}\n  </head>`);
}

/** Build tugagach har bir til uchun sahifa, robots.txt va sitemap.xml yaratadi. */
export function seoPlugin() {
  let outDir = 'dist';

  return {
    name: 'nex-traces-seo',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const template = await readFile(path.join(outDir, 'index.html'), 'utf8');

      for (const locale of Object.keys(META)) {
        const directory = path.join(outDir, localePath(locale));
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, 'index.html'), localizePage(template, locale));
      }

      const sitemapLine = SITE_URL ? `Sitemap: ${SITE_URL}/sitemap.xml\n` : '';
      await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n${sitemapLine}`);

      if (SITE_URL) {
        const urls = Object.keys(META)
          .map((locale) => `<url><loc>${SITE_URL}${localePath(locale)}</loc></url>`)
          .join('');
        await writeFile(
          path.join(outDir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
        );
      }
    },
  };
}

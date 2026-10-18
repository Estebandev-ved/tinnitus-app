// Regenerates the bilingual body of public/privacy.html from src/data/privacyPolicyContent.js.
// Usage (from the repo root):  node scripts/generate-privacy-html.mjs
// Only the region between the "<div class=\"container\">" and "<footer>" markers is replaced;
// the head, styles, language switcher script and footer of the existing file are kept.
// Run it after every edit of the content module (src/tests/privacyPolicy.test.js checks they match).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, 'public/privacy.html');
const { PRIVACY_CONTENT } = await import(pathToFileURL(resolve(root, 'src/data/privacyPolicyContent.js')).href);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderItems = (items) => [
  '    <ul>',
  ...items.map(([lead, text]) => `      <li>${lead ? `<strong>${esc(lead)}:</strong> ` : ''}${esc(text)}</li>`),
  '    </ul>',
];

const renderLang = (lang, c) => {
  const out = [
    `  <div class="lang" id="${lang}" lang="${lang}">`,
    `    <h1>${esc(c.title)}</h1>`,
    `    <p class="date">${esc(c.updated)}</p>`,
    `    <p class="draft">${esc(c.draftNotice)}</p>`,
  ];
  c.sections.forEach((s) => {
    out.push('', `    <h2>${esc(s.title)}</h2>`);
    (s.paragraphs || []).forEach((p) => out.push(`    <p>${esc(p)}</p>`));
    if (s.items) out.push(...renderItems(s.items));
    (s.after || []).forEach((p) => out.push(`    <p>${esc(p)}</p>`));
  });
  out.push('  </div>');
  return out.join('\n');
};

const html = readFileSync(htmlPath, 'utf8');
const start = html.indexOf('<div class="container">');
const end = html.indexOf('<footer>');
if (start < 0 || end < 0) throw new Error('Markers not found in public/privacy.html');
const body = `<div class="container">\n${renderLang('es', PRIVACY_CONTENT.es)}\n${renderLang('en', PRIVACY_CONTENT.en)}\n  </div>\n  `;
writeFileSync(htmlPath, html.slice(0, start) + body + html.slice(end));
console.log('public/privacy.html regenerated');

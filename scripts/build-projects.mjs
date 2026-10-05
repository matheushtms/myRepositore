// Gera /projetos/<slug>.html (uma URL real e compartilhável por projeto) e o sitemap.xml
// a partir de data.js e do index.html. Sem dependências: node scripts/build-projects.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { PR, SITE, IMG } = vm.runInNewContext(
  readFileSync(join(root, 'data.js'), 'utf8') + ';({PR,SITE,IMG})'
);
const tpl = readFileSync(join(root, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const META = /<!--meta:start-->[\s\S]*?<!--meta:end-->/;
const MAIN = /<main id="main"[^>]*>[\s\S]*?<\/main>/;
if (!META.test(tpl) || !MAIN.test(tpl) || !tpl.includes('<body data-page="home">')) {
  throw new Error('index.html fora do formato esperado (marcadores meta, <main> e data-page).');
}

mkdirSync(join(root, 'projetos'), { recursive: true });

for (const p of PR) {
  const url = `${SITE.url}/projetos/${p.id}.html`;
  const title = `${p.name} | Matheus Malta`;
  const desc = p.sum.pt;
  const image = `${SITE.url}${p.img ? IMG[p.img] : IMG.profile}`;
  const meta = `<!--meta:start-->
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Matheus Malta">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<!--meta:end-->`;
  // Conteúdo mínimo em PT para quem não executa JS; app.js substitui pelo layout completo.
  const main = `<main id="main" tabindex="-1"><div class="wrap pre"><h1>${esc(p.name)}</h1><p>${esc(p.sub.pt)}</p><p>${esc(desc)}</p><p><a href="/#projetos">Todos os projetos</a></p></div></main>`;
  const html = tpl
    .replace(META, () => meta)
    .replace('<body data-page="home">', `<body data-page="${p.id}">`)
    .replace(MAIN, () => main);
  writeFileSync(join(root, 'projetos', `${p.id}.html`), html);
}

const urls = [`${SITE.url}/`, ...PR.map((p) => `${SITE.url}/projetos/${p.id}.html`)];
writeFileSync(
  join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`
);
console.log(`${PR.length} páginas de projeto + sitemap.xml gerados.`);

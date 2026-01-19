import fs from 'fs'
import path from 'path'

// Simple sitemap generator: scans `src/pages` for route hints and writes `public/sitemap.xml`.
// Run: node scripts/generate-sitemap.js

const PAGES_DIR = path.resolve(process.cwd(), 'src', 'pages')
const OUT_PATH = path.resolve(process.cwd(), 'public', 'sitemap.xml')
const SITE_ROOT = process.env.SITE_ROOT || 'https://example.com'

function listPages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let pages = []
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      pages = pages.concat(listPages(full))
    } else if (/\.(jsx|js|tsx|ts)$/.test(ent.name)) {
      // derive route from filename (simple heuristic)
      const name = ent.name.replace(/\.(jsx|js|tsx|ts)$/i, '')
      if (name.toLowerCase() === 'index') {
        const relative = path.relative(path.resolve(process.cwd(), 'src', 'pages'), path.dirname(full))
        const route = relative === '' ? '/' : `/${relative.replace(/\\/g, '/')}`
        pages.push(route)
      } else {
        const relativeDir = path.relative(path.resolve(process.cwd(), 'src', 'pages'), path.dirname(full))
        const route = `/${relativeDir === '' ? '' : relativeDir.replace(/\\/g, '/')}/${name}`.replace(/\/\//g, '/')
        pages.push(route)
      }
    }
  }
  return pages
}

function buildSitemap(urls) {
  const now = new Date().toISOString()
  const items = urls
    .map((u) => `  <url>\n    <loc>${SITE_ROOT.replace(/\/$/, '')}${u}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`
}

try {
  const urls = listPages(PAGES_DIR).sort()
  const xml = buildSitemap(urls)
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  fs.writeFileSync(OUT_PATH, xml, 'utf8')
  console.log('Sitemap written to', OUT_PATH)
} catch (err) {
  console.error('Failed to generate sitemap:', err)
  process.exit(1)
}

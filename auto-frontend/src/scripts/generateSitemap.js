// scripts/generateSitemap.js
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateSitemap() {
  try {
    // Ia toate serviciile de la backend
    const response = await fetch('https://auto-beta.onrender.com/services/all-slugs');
    const services = await response.json();
    
    console.log(`📊 Am găsit ${services.length} servicii pentru sitemap`);
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.derstronik.md/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    
    for (const service of services) {
      if (service.slug && service.brandSlug) {
        const slugPart = service.slug.split('/').pop();
        sitemap += `
  <url>
    <loc>https://www.derstronik.md/servicii/${service.brandSlug}/${slugPart}</loc>
    <lastmod>${service.updatedAt ? service.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }
    
    sitemap += `
</urlset>`;
    
    // Scrie fișierul în folderul public
    const publicDir = resolve(__dirname, '../public');
    mkdirSync(publicDir, { recursive: true });
    writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap);
    
    console.log(`✅ Sitemap generat cu succes! ${services.length + 3} URL-uri totale`);
  } catch (err) {
    console.error('❌ Eroare generare sitemap:', err);
  }
}

generateSitemap();
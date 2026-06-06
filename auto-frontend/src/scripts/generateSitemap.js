// scripts/generateSitemap.js
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateSitemap() {
  console.log('🚀 Starting sitemap generation...');
  try {
    const backendUrl = 'https://auto-beta.onrender.com/services/all-slugs';
    console.log(`📡 Fetching services from: ${backendUrl}`);
    
    const response = await fetch(backendUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const services = await response.json();
    console.log(`📊 Successfully fetched ${services.length} services.`);
    
    if (!Array.isArray(services)) {
      throw new Error('Invalid data format received from backend.');
    }

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
  </url>
  <url>
    <loc>https://www.derstronik.md/request-service</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
    
    // Vite scrie în folderul 'dist' la build
    const outputDir = resolve(__dirname, '../dist');
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = resolve(outputDir, 'sitemap.xml');
    writeFileSync(outputPath, sitemap);
    
    console.log(`✅ Sitemap successfully generated at ${outputPath}`);
    console.log(`📊 Total URLs in sitemap: ${services.length + 3}`);
  } catch (err) {
    console.error('❌ FATAL ERROR generating sitemap:', err);
    throw err;
  }
}

generateSitemap();
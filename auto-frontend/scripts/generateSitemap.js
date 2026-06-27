// scripts/generateSitemap.js
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lista cu toate slug-urile pentru tipurile de servicii (sincronizat cu Home.jsx)
const SERVICE_TYPE_SLUGS = [
  "ceasuri-panou-de-bord",
  "chei-auto-si-imobilizatoare",
  "reparatie-sisteme-multimedia",
  "reparatie-unitati-de-control-cutii-de-viteze-automate",
  "reparatie-unitati-de-control-airbag",
  "reparatie-pentru-abs-esp",
  "reparatie-unitati-de-control-electronice-pentru-vehicule-comerciale",
  "reparatia-unitatilor-electronice-ecu-motor",
  "reparatie-contacte-de-cheie-unitate-blocare-volan-ezs-elv",
  "reparatie-selectoare-de-viteza",
  "reparatie-unitate-centrala-electronica-bdc-bsm-fem-bsi",
  "programare-unitati-electronice-motor-ecu",
  "reparatii-baterii-lithium-ion",
  "programare-chei-pentru-camioane"
];

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

    const today = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Pagina principală -->
  <url>
    <loc>https://www.derstronik.md/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Pagini statice -->
  <url>
    <loc>https://www.derstronik.md/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/request-service</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/shipping-label</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

    // ============================================
    // 1. Adaugă paginile pentru tipurile de servicii (service-type)
    // ============================================
    sitemap += `
  
  <!-- Pagini pentru tipurile de servicii (ServiceTypePage) -->`;

    for (const slug of SERVICE_TYPE_SLUGS) {
      sitemap += `
  <url>
    <loc>https://www.derstronik.md/service-type/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // ============================================
    // 2. Adaugă paginile pentru serviciile individuale (ServiceDetail)
    // ============================================
    sitemap += `
  
  <!-- Pagini pentru servicii individuale (ServiceDetail) -->`;

    for (const service of services) {
      if (service.slug && service.brandSlug) {
        const slugPart = service.slug.split('/').pop();
        const lastmod = service.updatedAt ? service.updatedAt.split('T')[0] : today;
        sitemap += `
  <url>
    <loc>https://www.derstronik.md/servicii/${service.brandSlug}/${slugPart}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    sitemap += `
</urlset>`;

    // Scrie sitemap-ul în folderul 'dist' la build
    const outputDir = resolve(__dirname, '../dist');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = resolve(outputDir, 'sitemap.xml');
    writeFileSync(outputPath, sitemap);

    const totalUrls = 4 + SERVICE_TYPE_SLUGS.length + services.length;
    console.log(`✅ Sitemap successfully generated at ${outputPath}`);
    console.log(`📊 Total URLs in sitemap: ${totalUrls}`);
    console.log(`   - Pagini statice: 4`);
    console.log(`   - Tipuri de servicii: ${SERVICE_TYPE_SLUGS.length}`);
    console.log(`   - Servicii individuale: ${services.length}`);
  } catch (err) {
    console.error('❌ FATAL ERROR generating sitemap:', err);
    throw err;
  }
}

generateSitemap();
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Conectat la MongoDB');
    generateSlugs();
  })
  .catch(err => console.error('❌ Eroare conectare:', err));

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[șȘ]/g, 's')
    .replace(/[țȚ]/g, 't')
    .replace(/[ăĂ]/g, 'a')
    .replace(/[îÎ]/g, 'i')
    .replace(/[âÂ]/g, 'a')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function generateSlugs() {
  try {
    const Brand = mongoose.model('Brand', new mongoose.Schema({ name: String, slug: String }), 'brands');
    const Service = mongoose.model('Service', new mongoose.Schema({}, { strict: false }), 'services');

    // Generează slug-uri pentru branduri
    const brands = await Brand.find({});
    for (const brand of brands) {
      if (!brand.slug) {
        brand.slug = slugify(brand.name);
        await brand.save();
        console.log(`✅ Brand: ${brand.name} → ${brand.slug}`);
      }
    }

    // Generează slug-uri pentru servicii
    const services = await Service.find({});
    for (const service of services) {
      if (!service.slug) {
        const brand = await Brand.findById(service.brand);
        const brandSlug = brand?.slug || slugify(brand?.name || 'general');
        const serviceSlug = slugify(service.name);
        service.slug = `${brandSlug}/${serviceSlug}`;
        service.brandSlug = brandSlug;
        await service.save();
        console.log(`✅ Serviciu: ${service.name} → ${service.slug}`);
      }
    }

    console.log('🎉 Toate slug-urile au fost generate!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err);
    process.exit(1);
  }
}
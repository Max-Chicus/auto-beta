// scripts/generateSlugs.js
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Conectat la MongoDB');
    generateAllSlugs();
  })
  .catch(err => {
    console.error('❌ Eroare conectare:', err.message);
    process.exit(1);
  });

// Scheme
const brandSchema = new mongoose.Schema({}, { strict: false });
const serviceSchema = new mongoose.Schema({}, { strict: false });

const Brand = mongoose.model('Brand', brandSchema, 'brands');
const Service = mongoose.model('Service', serviceSchema, 'services');

// Funcția care generează slug din text
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
    .replace(/\s+/g, '-')           // spații -> cratimă
    .replace(/[^\w\-]+/g, '')       // elimină caractere speciale
    .replace(/\-\-+/g, '-')         // multiple cratime -> una singură
    .replace(/^-+/, '')             // elimină cratima de la început
    .replace(/-+$/, '');            // elimină cratima de la sfârșit
}

async function generateAllSlugs() {
  try {
    // ========== PAS 1: Generează slug-uri pentru branduri ==========
    console.log('\n📌 PAS 1: Generez slug-uri pentru branduri...\n');
    
    const brands = await Brand.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    
    console.log(`📊 Am găsit ${brands.length} branduri fără slug\n`);
    
    for (const brand of brands) {
      let slug = slugify(brand.name);
      
      // Verifică unicitatea slug-ului
      const existing = await Brand.findOne({ slug, _id: { $ne: brand._id } });
      if (existing) {
        slug = `${slug}-${brand._id.toString().slice(-4)}`;
      }
      
      await Brand.updateOne(
        { _id: brand._id },
        { $set: { slug } }
      );
      
      console.log(`✅ ${brand.name} → ${slug}`);
    }
    
    // ========== PAS 2: Generează slug-uri pentru servicii ==========
    console.log('\n📌 PAS 2: Generez slug-uri pentru servicii...\n');
    
    const services = await Service.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });
    
    console.log(`📊 Am găsit ${services.length} servicii fără slug\n`);
    
    let updated = 0;
    
    for (const service of services) {
      // Găsește brandul asociat
      const brand = await Brand.findById(service.brand);
      const brandSlug = brand?.slug || slugify(brand?.name || 'general');
      
      // Generează slug-ul serviciului
      let serviceSlug = slugify(service.name);
      let uniqueSlug = `${brandSlug}/${serviceSlug}`;
      
      // Verifică unicitatea slug-ului complet
      let counter = 1;
      let existing = await Service.findOne({ 
        slug: uniqueSlug, 
        _id: { $ne: service._id } 
      });
      
      while (existing) {
        uniqueSlug = `${brandSlug}/${serviceSlug}-${counter}`;
        existing = await Service.findOne({ 
          slug: uniqueSlug, 
          _id: { $ne: service._id } 
        });
        counter++;
      }
      
      await Service.updateOne(
        { _id: service._id },
        { 
          $set: { 
            slug: uniqueSlug,
            brandSlug: brandSlug
          } 
        }
      );
      
      console.log(`✅ ${service.name} (${brand?.name}) → ${uniqueSlug}`);
      updated++;
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 REZUMAT FINAL:`);
    console.log(`   ✅ Branduri actualizate: ${brands.length}`);
    console.log(`   ✅ Servicii actualizate: ${updated}`);
    console.log(`${'='.repeat(50)}`);
    
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Eroare:', err.message);
    process.exit(1);
  }
}
const mongoose = require('mongoose');
require('dotenv').config();

// Conectare la MongoDB - FOLOSEȘTE MONGO_URI din .env
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/auto-db';
console.log('📡 Conectare la:', mongoURI.replace(/\/\/.*:.*@/, '//***:***@')); // Ascunde parola în log

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ Conectat la MongoDB Atlas');
  updateBrandLogos();
})
.catch(err => {
  console.error('❌ Eroare conectare:', err.message);
  console.log('\n💡 Verifică:');
  console.log('   1. Conexiunea la internet');
  console.log('   2. Variabila MONGO_URI din .env');
  console.log('   3. Dacă IP-ul tău e în whitelist-ul MongoDB Atlas');
  process.exit(1);
});

const brandSchema = new mongoose.Schema({
  name: String,
  logo: String
}, { collection: 'brands', strict: false });

const Brand = mongoose.model('Brand', brandSchema);

async function updateBrandLogos() {
  try {
    // Verifică dacă există branduri
    const count = await Brand.countDocuments();
    console.log(`\n📊 Total branduri în DB: ${count}\n`);
    
    if (count === 0) {
      console.log('⚠️ Nu există branduri în baza de date!');
      process.exit(0);
    }
    
    // Găsește toate brandurile
    const brands = await Brand.find({});
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const brand of brands) {
      console.log(`\n🔍 Brand: ${brand.name}`);
      console.log(`   Logo vechi: ${brand.logo || '(null)'}`);
      
      let newLogo = null;
      
      if (brand.logo) {
        // Caz 1: URL Vercel Storage
        if (brand.logo.includes('vercel-storage.com')) {
          const filename = brand.logo.split('/').pop();
          newLogo = `/uploads/${filename}`;
          console.log(`   🔄 URL Vercel -> /uploads/${filename}`);
        }
        // Caz 2: URL cu localhost
        else if (brand.logo.includes('localhost:5000') || brand.logo.includes('127.0.0.1:5000')) {
          const match = brand.logo.match(/\/uploads\/(.+)$/);
          if (match) {
            newLogo = `/uploads/${match[1]}`;
            console.log(`   🔄 URL localhost -> /uploads/${match[1]}`);
          }
        }
        // Caz 3: Deja e cale relativă corectă
        else if (brand.logo.startsWith('/uploads/')) {
          console.log(`   ℹ️ Deja în format corect`);
          skipped++;
          continue;
        }
        // Caz 4: E doar numele fișierului
        else if (!brand.logo.includes('/') && !brand.logo.includes('http')) {
          newLogo = `/uploads/${brand.logo}`;
          console.log(`   🔄 Doar nume fișier -> /uploads/${brand.logo}`);
        }
        else {
          console.log(`   ⚠️ Format necunoscut, se păstrează`);
          skipped++;
          continue;
        }
      } else {
        console.log(`   ℹ️ Logo lipsă`);
        skipped++;
        continue;
      }
      
      if (newLogo && newLogo !== brand.logo) {
        try {
          await Brand.updateOne(
            { _id: brand._id },
            { $set: { logo: newLogo } }
          );
          console.log(`   ✅ ACTUALIZAT`);
          updated++;
        } catch (updateErr) {
          console.error(`   ❌ Eroare:`, updateErr.message);
          errors++;
        }
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 REZUMAT:`);
    console.log(`   ✅ Actualizate: ${updated}`);
    console.log(`   ℹ️ Neschimbate: ${skipped}`);
    console.log(`   ❌ Erori: ${errors}`);
    console.log(`   📊 Total: ${brands.length}`);
    console.log(`${'='.repeat(50)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare:', error.message);
    process.exit(1);
  }
}
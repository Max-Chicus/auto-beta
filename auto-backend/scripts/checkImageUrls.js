// scripts/checkImageUrls.js
const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://chicusmaxim81_db_user:Chicus2026!@cluster0.mtpfskc.mongodb.net/autoDB?retryWrites=true&w=majority";

const serviceSchema = new mongoose.Schema({
  name: String,
  images: [{ url: String, name: String }]
}, { collection: 'services' });

const Service = mongoose.model('Service', serviceSchema);

async function checkUrls() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectat\n');

    // Găsește primele 5 servicii cu imagini
    const services = await Service.find({ 
      'images.0': { $exists: true } 
    }).limit(10);

    console.log(`📦 Primele ${services.length} servicii cu imagini:\n`);
    console.log('=' .repeat(80));

    for (const service of services) {
      console.log(`\n📋 Serviciu: ${service.name || service._id}`);
      console.log(`   ID: ${service._id}`);
      
      for (let i = 0; i < service.images.length; i++) {
        const img = service.images[i];
        console.log(`\n   Imagine ${i + 1}:`);
        console.log(`      URL complet: ${img.url}`);
        
        if (img.url) {
          if (img.url.startsWith('/uploads/')) {
            console.log(`      ✅ Format: Local (corect)`);
            const filename = img.url.replace('/uploads/', '');
            console.log(`      📁 Fișier: ${filename}`);
          } else if (img.url.includes('blob.vercel-storage.com')) {
            console.log(`      ⚠️ Format: Vercel (trebuie actualizat)`);
          } else if (img.url.startsWith('http')) {
            console.log(`      ⚠️ Format: URL extern (${img.url})`);
          } else {
            console.log(`      ❌ Format necunoscut!`);
          }
        } else {
          console.log(`      ❌ URL gol!`);
        }
      }
      console.log('\n' + '-'.repeat(80));
    }

    // Numără total servicii cu diferite formate
    const totalServices = await Service.countDocuments({ 'images.0': { $exists: true } });
    const vercelUrls = await Service.countDocuments({ 'images.url': /blob\.vercel-storage\.com/ });
    const localUrls = await Service.countDocuments({ 'images.url': /^\/uploads\// });
    const httpUrls = await Service.countDocuments({ 'images.url': /^http/ });

    console.log('\n' + '=' .repeat(80));
    console.log('📊 STATISTICI GENERALE:');
    console.log('=' .repeat(80));
    console.log(`   Total servicii cu imagini: ${totalServices}`);
    console.log(`   Cu URL-uri Vercel: ${vercelUrls}`);
    console.log(`   Cu URL-uri locale (/uploads): ${localUrls}`);
    console.log(`   Cu alte URL-uri HTTP: ${httpUrls}`);
    console.log('=' .repeat(80));

  } catch (err) {
    console.error('❌ Eroare:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUrls();
// scripts/updateDatabaseImages.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = "mongodb+srv://chicusmaxim81_db_user:Chicus2026!@cluster0.mtpfskc.mongodb.net/autoDB?retryWrites=true&w=majority";
const uploadDir = path.join(__dirname, '../uploads');

// Schema Service
const serviceSchema = new mongoose.Schema({
  name: String,
  images: [{ url: String, name: String, size: Number }]
}, { collection: 'services' });

const Service = mongoose.model('Service', serviceSchema);

async function updateDatabase() {
  try {
    console.log('🔌 Conectare la MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectat cu succes\n');

    // Obține lista fișierelor locale
    const localFiles = fs.readdirSync(uploadDir);
    console.log(`📁 Fișiere locale în uploads: ${localFiles.length}\n`);

    // Găsește toate serviciile
    const services = await Service.find({});
    console.log(`📦 Total servicii în baza de date: ${services.length}\n`);
    console.log('=' .repeat(60));

    let updatedServices = 0;
    let totalImagesUpdated = 0;

    for (const service of services) {
      let needsUpdate = false;
      
      if (service.images && service.images.length > 0) {
        for (let i = 0; i < service.images.length; i++) {
          const img = service.images[i];
          const oldUrl = img.url;
          
          // Verifică dacă URL-ul e de pe Vercel sau e invalid
          if (oldUrl && (oldUrl.includes('blob.vercel-storage.com') || oldUrl.includes('/uploads/'))) {
            
            // Extrage numele fișierului din URL
            let filename = '';
            if (oldUrl.includes('/uploads/')) {
              filename = oldUrl.split('/uploads/')[1];
            } else if (oldUrl.includes('blob.vercel-storage.com')) {
              filename = oldUrl.split('/').pop();
            }
            
            // Verifică dacă fișierul există local
            if (filename && localFiles.includes(filename)) {
              const filePath = path.join(uploadDir, filename);
              const stats = fs.statSync(filePath);
              const newUrl = `/uploads/${filename}`;
              
              if (oldUrl !== newUrl) {
                console.log(`📋 Serviciu: ${service.name || service._id}`);
                console.log(`   Imagine ${i + 1}: ${filename}`);
                console.log(`   Vechi URL: ${oldUrl.substring(0, 60)}...`);
                console.log(`   Nou URL: ${newUrl}`);
                
                service.images[i].url = newUrl;
                service.images[i].size = stats.size;
                needsUpdate = true;
                totalImagesUpdated++;
              }
            } else if (filename) {
              console.log(`⚠️ Fișier lipsă: ${filename} pentru serviciul ${service.name || service._id}`);
            }
          }
        }
        
        if (needsUpdate) {
          await service.save();
          updatedServices++;
          console.log(`   ✅ Serviciu actualizat\n`);
        }
      }
    }

    console.log('=' .repeat(60));
    console.log('📊 REZUMAT FINAL:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Servicii actualizate: ${updatedServices}`);
    console.log(`   🖼️ Imagini actualizate: ${totalImagesUpdated}`);
    console.log(`   📁 Total fișiere locale: ${localFiles.length}`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ EROARE:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Deconectat de la MongoDB');
  }
}

updateDatabase();
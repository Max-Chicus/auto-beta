// scripts/restoreImagesToServices.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = "mongodb+srv://chicusmaxim81_db_user:Chicus2026!@cluster0.mtpfskc.mongodb.net/autoDB?retryWrites=true&w=majority";

// Schema Service
const serviceSchema = new mongoose.Schema({
  name: String,
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  serviceType: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType' },
  images: [{ url: String, name: String, size: Number }]
}, { collection: 'services' });

const Service = mongoose.model('Service', serviceSchema);

async function restoreImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectat la MongoDB\n');

    // Obține toate fișierele din uploads
    const uploadDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadDir);
    const imageFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'));
    
    console.log(`📁 Imagini în folderul uploads: ${imageFiles.length}\n`);
    console.log('=' .repeat(60));

    // Grupează imaginile după posibile pattern-uri
    // Presupunem că numele imaginilor conține timestamp sau ID-ul serviciului
    const imagesByPattern = {};
    
    for (const file of imageFiles) {
      // Extrage posibile pattern-uri din numele fișierului
      const timestamp = file.match(/service-(\d+)/);
      if (timestamp) {
        const date = timestamp[1];
        if (!imagesByPattern[date]) imagesByPattern[date] = [];
        imagesByPattern[date].push(file);
      }
    }

    console.log(`📊 Găsite ${Object.keys(imagesByPattern).length} pattern-uri unice\n`);

    // Găsește toate serviciile
    const services = await Service.find({});
    console.log(`📦 Total servicii în baza de date: ${services.length}\n`);

    let updatedServices = 0;
    let totalImagesAdded = 0;

    // Pentru fiecare serviciu, încearcă să găsești imagini asociate
    for (const service of services) {
      // Dacă serviciul are deja imagini, skip
      if (service.images && service.images.length > 0) {
        continue;
      }
      
      // Caută imagini care ar putea aparține acestui serviciu
      // Bazat pe numele serviciului sau data creării
      const serviceDate = service.createdAt ? new Date(service.createdAt).getTime() : null;
      
      let foundImages = [];
      
      for (const file of imageFiles) {
        const fileTimestamp = file.match(/service-(\d+)/);
        if (fileTimestamp) {
          const fileDate = parseInt(fileTimestamp[1]);
          
          // Dacă data fișierului e aproape de data serviciului (diferență < 1 zi)
          if (serviceDate && Math.abs(fileDate - serviceDate) < 86400000) {
            const stats = fs.statSync(path.join(uploadDir, file));
            foundImages.push({
              url: `/uploads/${file}`,
              name: file,
              size: stats.size
            });
          }
        }
      }
      
      if (foundImages.length > 0) {
        service.images = foundImages;
        await service.save();
        updatedServices++;
        totalImagesAdded += foundImages.length;
        console.log(`✅ Serviciu: ${service.name}`);
        console.log(`   Adăugate ${foundImages.length} imagini`);
        console.log(`   Imagini: ${foundImages.map(i => i.url).join(', ')}\n`);
      }
    }

    console.log('=' .repeat(60));
    console.log('📊 REZUMAT FINAL:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Servicii actualizate: ${updatedServices}`);
    console.log(`   🖼️ Imagini adăugate: ${totalImagesAdded}`);
    console.log(`   📁 Total fișiere locale: ${imageFiles.length}`);
    console.log('=' .repeat(60));

    // Verifică câte servicii au rămas fără imagini
    const servicesWithoutImages = await Service.countDocuments({ 
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });
    
    console.log(`\n⚠️ Servicii încă fără imagini: ${servicesWithoutImages}`);

  } catch (err) {
    console.error('❌ Eroare:', err);
  } finally {
    await mongoose.disconnect();
  }
}

restoreImages();
// scripts/migrateFromVercel.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGO_URI;

// Schema Service (simplificată)
const serviceSchema = new mongoose.Schema({
  name: String,
  images: [{
    url: String,
    name: String,
    size: Number
  }]
}, { collection: 'services' });

const Service = mongoose.model('Service', serviceSchema);

// Funcție pentru descărcat imagini de pe Vercel
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', reject);
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Redirect
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Funcție pentru a verifica dacă URL-ul e accesibil
function isUrlAccessible(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (response) => {
      resolve(response.statusCode === 200);
      request.destroy();
    });
    request.on('error', () => resolve(false));
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function migrateImages() {
  try {
    console.log('🔌 Conectare la MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectat cu succes');

    // Asigură-te că directorul uploads există
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Director uploads creat');
    }

    // Găsește toate serviciile care au imagini
    const services = await Service.find({
      'images.0': { $exists: true }
    });

    console.log(`📦 Găsite ${services.length} servicii cu imagini`);

    let totalImagesMigrated = 0;
    let totalImagesSkipped = 0;
    let totalImagesFailed = 0;
    let servicesUpdated = 0;

    for (const service of services) {
      let serviceNeedsUpdate = false;
      console.log(`\n📋 Procesare serviciu: ${service.name || service._id}`);
      console.log(`   Imagini: ${service.images.length}`);
      
      const newImages = [];
      
      for (let i = 0; i < service.images.length; i++) {
        const image = service.images[i];
        const isVercelUrl = image.url && image.url.includes('blob.vercel-storage.com');
        
        if (isVercelUrl) {
          console.log(`   🖼️ Imagine ${i + 1}: Vercel URL detectat`);
          
          // Verifică dacă URL-ul e accesibil
          const isAccessible = await isUrlAccessible(image.url);
          
          if (isAccessible) {
            // Generează nume nou pentru imagine
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            const originalExt = image.name ? image.name.split('.').pop() : 'png';
            const extension = originalExt.length > 5 ? 'png' : originalExt;
            const fileName = `${timestamp}-${randomString}.${extension}`;
            const filePath = path.join(uploadDir, fileName);
            
            try {
              console.log(`   ⬇️ Descărcare...`);
              await downloadImage(image.url, filePath);
              
              // Obține dimensiunea fișierului
              const stats = fs.statSync(filePath);
              
              // Creează URL-ul nou
              const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
              const newUrl = `${baseUrl}/uploads/${fileName}`;
              
              newImages.push({
                url: newUrl,
                name: image.name || fileName,
                size: stats.size
              });
              
              console.log(`   ✅ Migrat cu succes: ${fileName}`);
              totalImagesMigrated++;
              serviceNeedsUpdate = true;
              
            } catch (err) {
              console.log(`   ❌ Eroare la descărcare: ${err.message}`);
              totalImagesFailed++;
              // Păstrează imaginea veche
              newImages.push(image);
            }
          } else {
            console.log(`   ⚠️ URL Vercel inaccesibil (403), imaginea va fi ignorată`);
            totalImagesSkipped++;
            serviceNeedsUpdate = true; // Eliminăm imaginea moartă
            // Nu adăugăm nimic - imaginea e ștearsă
          }
        } else if (image.url && !image.url.includes('blob.vercel-storage.com')) {
          // URL local sau alt URL valid
          console.log(`   🖼️ Imagine ${i + 1}: URL local - ${image.url.substring(0, 50)}...`);
          newImages.push(image);
        } else {
          console.log(`   ⚠️ Imagine ${i + 1}: URL invalid, ignorat`);
          serviceNeedsUpdate = true;
        }
      }
      
      // Actualizează serviciul dacă s-au schimbat imaginile
      if (serviceNeedsUpdate && newImages.length !== service.images.length) {
        service.images = newImages;
        await service.save();
        servicesUpdated++;
        console.log(`   💾 Serviciu actualizat (${service.images.length} -> ${newImages.length} imagini)`);
      } else if (serviceNeedsUpdate && newImages.length === service.images.length) {
        // Doar URL-urile s-au schimbat
        service.images = newImages;
        await service.save();
        servicesUpdated++;
        console.log(`   💾 Serviciu actualizat (URL-uri înlocuite)`);
      } else {
        console.log(`   ℹ️ Nicio schimbare necesară`);
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 REZUMAT MIGRARE:`);
    console.log(`${'='.repeat(50)}`);
    console.log(`   📦 Servicii procesate: ${services.length}`);
    console.log(`   💾 Servicii actualizate: ${servicesUpdated}`);
    console.log(`   ✅ Imagini migrate: ${totalImagesMigrated}`);
    console.log(`   ⏭️ Imagini ignorate (Vercel inaccesibil): ${totalImagesSkipped}`);
    console.log(`   ❌ Imagini eșuate: ${totalImagesFailed}`);
    console.log(`${'='.repeat(50)}`);
    
  } catch (error) {
    console.error('❌ EROARE GENERALĂ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Deconectat de la MongoDB');
  }
}

// Rulează migrarea
migrateImages();
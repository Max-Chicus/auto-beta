// scripts/migrateAllFromVercel.js
const { list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const uploadDir = path.join(__dirname, '../uploads');

// Schema Service
const serviceSchema = new mongoose.Schema({
  name: String,
  images: [{ url: String, name: String, size: Number }]
}, { collection: 'services' });

const Service = mongoose.model('Service', serviceSchema);

async function migrateAll() {
  try {
    // 1. Conectare la MongoDB
    console.log('🔌 Conectare la MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectat la MongoDB\n');

    // 2. Asigură-te că folderul uploads există
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Folder uploads creat\n');
    }

    // 3. Obține toate fișierele din Vercel Blob
    console.log('📋 Listare fișiere din Vercel Blob...');
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      limit: 1000
    });
    
    console.log(`📦 Găsite ${blobs.length} fișiere în Vercel Blob\n`);
    console.log('=' .repeat(60));

    // 4. Descarcă fiecare fișier
    let downloaded = 0;
    let failed = 0;
    const downloadedFiles = [];

    for (const blob of blobs) {
      console.log(`⬇️ [${downloaded + 1}/${blobs.length}] ${blob.pathname}`);
      
      try {
        const response = await axios({
          method: 'get',
          url: blob.url,
          responseType: 'stream',
          timeout: 30000
        });
        
        const filepath = path.join(uploadDir, blob.pathname);
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        downloadedFiles.push({
          originalUrl: blob.url,
          filename: blob.pathname,
          localPath: `/uploads/${blob.pathname}`,
          size: blob.size
        });
        
        console.log(`   ✅ Salvat (${(blob.size / 1024).toFixed(2)} KB)`);
        downloaded++;
        
      } catch (err) {
        console.log(`   ❌ Eșuat: ${err.message}`);
        failed++;
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 Descărcare completă: ${downloaded} succese, ${failed} eșuate\n`);
    
    // 5. Actualizează baza de date cu noile URL-uri locale
    console.log('🔄 Actualizare baza de date...');
    
    const services = await Service.find({});
    let updatedServices = 0;
    
    for (const service of services) {
      let needsUpdate = false;
      
      for (let i = 0; i < service.images.length; i++) {
        const img = service.images[i];
        
        // Caută fișierul corespunzător după nume
        const originalFilename = img.url?.split('/').pop();
        const matchingFile = downloadedFiles.find(f => 
          f.filename === originalFilename || 
          f.originalUrl === img.url
        );
        
        if (matchingFile && img.url !== matchingFile.localPath) {
          console.log(`   🔄 Actualizare: ${service.name} - imagine ${i + 1}`);
          console.log(`      Vechi URL: ${img.url}`);
          console.log(`      Nou URL: ${matchingFile.localPath}`);
          
          service.images[i].url = matchingFile.localPath;
          service.images[i].size = matchingFile.size;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await service.save();
        updatedServices++;
      }
    }
    
    console.log(`\n✅ Actualizate ${updatedServices} servicii în baza de date`);
    
    // 6. Rezumat final
    console.log('\n' + '=' .repeat(60));
    console.log('📊 REZUMAT FINAL:');
    console.log('=' .repeat(60));
    console.log(`   📁 Fișiere descărcate: ${downloaded}`);
    console.log(`   💾 Servicii actualizate: ${updatedServices}`);
    console.log(`   📍 Locație fișiere: ${uploadDir}`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ EROARE:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Deconectat de la MongoDB');
  }
}

migrateAll();
// scripts/listOrphanImages.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
const uploadsDir = path.join(__dirname, '../uploads');

async function listOrphanImages() {
  try {
    // Conectare la MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Conectat la MongoDB\n');

    const serviceSchema = new mongoose.Schema({}, { strict: false });
    const Service = mongoose.model('Service', serviceSchema, 'services');

    // 1. Colectează toate imaginile din DB
    const services = await Service.find({ images: { $exists: true, $ne: [] } });
    const dbImages = new Set();

    for (const service of services) {
      for (const img of service.images) {
        const filename = img.url.split('/').pop();
        dbImages.add(filename);
      }
    }

    console.log(`📊 Imagini înregistrate în DB: ${dbImages.size}\n`);

    // 2. Colectează toate fișierele de pe disk (local)
    const diskFiles = fs.readdirSync(uploadsDir);
    
    // Filtrează doar imaginile (exclude folderele)
    const imageFiles = diskFiles.filter(file => {
      const fullPath = path.join(uploadsDir, file);
      const isDirectory = fs.statSync(fullPath).isDirectory();
      return !isDirectory && /\.(png|jpg|jpeg|webp)$/i.test(file);
    });

    console.log(`💾 Imagini pe disk (local): ${imageFiles.length}\n`);

    // 3. Găsește imaginile orfane (pe disk dar nu în DB)
    const orphanImages = imageFiles.filter(file => !dbImages.has(file));

    console.log('=' .repeat(80));
    console.log(`🗑️ IMAGINI ORFANE (pe disk dar NU în DB): ${orphanImages.length}`);
    console.log('=' .repeat(80));

    if (orphanImages.length > 0) {
      orphanImages.forEach((file, index) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`${index + 1}. ${file} (${sizeKB} KB)`);
      });
    } else {
      console.log('✅ Nu există imagini orfane!');
    }

    console.log('\n' + '=' .repeat(80));
    console.log('💡 Aceste imagini pot fi șterse pentru a elibera spațiu (opțional).');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err);
    process.exit(1);
  }
}

listOrphanImages();
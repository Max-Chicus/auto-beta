const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Conectat la MongoDB');
    compareImages();
  })
  .catch(err => console.error('❌ Eroare conectare:', err));

let uploadsDir;
if (process.env.RENDER) {
  uploadsDir = '/opt/render/project/data/uploads';
  console.log('📡 Rulează pe Render');
} else {
  uploadsDir = path.join(__dirname, '../uploads');
  console.log('💻 Rulează local');
}

const serviceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.model('Service', serviceSchema, 'services');

async function compareImages() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPARAȚIE IMAGINI: DISK vs MONGODB');
    console.log('='.repeat(80));

    // 1. Colectează toate imaginile din baza de date
    const services = await Service.find({
      images: { $exists: true, $ne: [] }
    });

    const dbImages = new Map(); // nume_fișier -> { serviceName, serviceId, url }
    
    for (const service of services) {
      for (const img of service.images) {
        const filename = img.url.split('/').pop();
        dbImages.set(filename, {
          filename,
          serviceName: service.name,
          serviceId: service._id,
          dbUrl: img.url
        });
      }
    }

    // 2. Colectează toate fișierele de pe disk
    let diskFiles = [];
    try {
      diskFiles = fs.readdirSync(uploadsDir);
    } catch (err) {
      console.log(`⚠️ Folderul ${uploadsDir} nu există sau nu poate fi citit`);
    }

    const diskFileSet = new Set(diskFiles);

    // 3. Analiză
    const imagesOnlyInDB = [];
    const imagesOnlyOnDisk = [];
    const imagesMatched = [];

    for (const [filename, info] of dbImages) {
      if (diskFileSet.has(filename)) {
        imagesMatched.push(info);
      } else {
        imagesOnlyInDB.push(info);
      }
    }

    for (const file of diskFiles) {
      if (!dbImages.has(file)) {
        // Verifică dacă fișierul e imagine (png, jpg, jpeg, webp)
        if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
          imagesOnlyOnDisk.push(file);
        }
      }
    }

    // 4. Raport
    console.log(`\n📈 STATISTICI:`);
    console.log(`   📸 Imagini în DB: ${dbImages.size}`);
    console.log(`   💾 Imagini pe disk: ${diskFiles.length}`);
    console.log(`   ✅ Imagini care se potrivesc (DB + Disk): ${imagesMatched.length}`);
    console.log(`   ❌ Imagini doar în DB (lipsă pe disk): ${imagesOnlyInDB.length}`);
    console.log(`   🗑️ Imagini doar pe disk (orfane, nefolosite): ${imagesOnlyOnDisk.length}`);

    if (imagesOnlyInDB.length > 0) {
      console.log(`\n🔴 IMAGINI LIPSĂ PE DISK (${imagesOnlyInDB.length}):`);
      console.log('   (Acestea sunt în DB dar nu există fizic pe disk)');
      imagesOnlyInDB.slice(0, 20).forEach(img => {
        console.log(`   📌 ${img.filename}`);
        console.log(`      → Serviciu: ${img.serviceName}`);
      });
      if (imagesOnlyInDB.length > 20) {
        console.log(`   ... și alte ${imagesOnlyInDB.length - 20} imagini`);
      }
    }

    if (imagesOnlyOnDisk.length > 0) {
      console.log(`\n🟡 IMAGINI ORFANE PE DISK (${imagesOnlyOnDisk.length}):`);
      console.log('   (Acestea sunt pe disk dar nu sunt folosite în DB)');
      imagesOnlyOnDisk.slice(0, 20).forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`   📁 ${file} (${sizeKB} KB)`);
      });
      if (imagesOnlyOnDisk.length > 20) {
        console.log(`   ... și alte ${imagesOnlyOnDisk.length - 20} fișiere`);
      }
    }

    // 5. Recomandări
    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMANDĂRI:');
    console.log('='.repeat(80));

    if (imagesOnlyInDB.length > 0) {
      console.log(`\n🔴 ${imagesOnlyInDB.length} imagini sunt înregistrate în DB dar nu există pe disk.`);
      console.log('   Soluție: Clientul trebuie să reîncarce aceste imagini prin panoul admin.');
    }

    if (imagesOnlyOnDisk.length > 0) {
      console.log(`\n🟡 ${imagesOnlyOnDisk.length} fișiere există pe disk dar nu sunt folosite.`);
      console.log('   Soluție: Poți șterge aceste fișiere pentru a elibera spațiu (opțional).');
    }

    if (imagesMatched.length === dbImages.size && imagesOnlyInDB.length === 0) {
      console.log('\n✅ TOATE imaginile din DB sunt prezente pe disk! Totul este în regulă.');
    }

    console.log('\n🎯 Acest script NU a modificat nimic. Doar raportează.\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err);
    process.exit(1);
  }
}
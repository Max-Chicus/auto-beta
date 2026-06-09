// scripts/searchMissingFiles.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Conectat la MongoDB');
    searchMissingFiles();
  })
  .catch(err => console.error('❌ Eroare conectare:', err));

let uploadsDir;
if (process.env.RENDER) {
  uploadsDir = '/opt/render/project/data/uploads';
} else {
  uploadsDir = path.join(__dirname, '../uploads');
}

const serviceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.model('Service', serviceSchema, 'services');

async function searchMissingFiles() {
  try {
    // Ia toate fișierele de pe disk
    const diskFiles = fs.readdirSync(uploadsDir);
    console.log(`📁 Total fișiere pe disk: ${diskFiles.length}\n`);

    // Ia serviciile cu imagini
    const services = await Service.find({
      images: { $exists: true, $ne: [] }
    });

    let foundMatches = 0;
    let stillMissing = 0;

    console.log('🔍 CĂUTARE FIȘIERE SIMILARE:\n');
    console.log('='.repeat(80));

    for (const service of services) {
      for (const img of service.images) {
        const dbFilename = img.url.split('/').pop();
        const expectedPath = path.join(uploadsDir, dbFilename);
        
        // Dacă fișierul nu există exact cu numele din DB
        if (!fs.existsSync(expectedPath)) {
          // Caută fișiere care conțin o parte din nume
          const partialMatches = diskFiles.filter(file => {
            // Extrage ID-ul sau numărul din numele fișierului
            const dbId = dbFilename.match(/\d+/g)?.[0];
            const fileId = file.match(/\d+/g)?.[0];
            return dbId && fileId && dbId === fileId;
          });

          if (partialMatches.length > 0) {
            console.log(`\n📌 Serviciu: ${service.name}`);
            console.log(`   Nume în DB: ${dbFilename}`);
            console.log(`   Fișiere similare găsite pe disk:`);
            partialMatches.forEach(match => {
              const matchPath = path.join(uploadsDir, match);
              const stats = fs.statSync(matchPath);
              console.log(`      → ${match} (${(stats.size / 1024).toFixed(2)} KB)`);
            });
            foundMatches++;
          } else {
            stillMissing++;
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 REZUMAT CĂUTARE:');
    console.log(`   ✅ Fișiere similare găsite: ${foundMatches}`);
    console.log(`   ❌ Fișiere încă lipsă: ${stillMissing}`);
    
    if (foundMatches > 0) {
      console.log('\n💡 Pentru a repara, rulează scriptul: node scripts/fixImagePaths.js');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err);
    process.exit(1);
  }
}
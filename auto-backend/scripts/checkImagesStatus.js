const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Conectat la MongoDB');
    checkImagesStatus();
  })
  .catch(err => console.error('❌ Eroare conectare:', err));

// Determină calea folderului uploads
let uploadsDir;
if (process.env.RENDER) {
  uploadsDir = '/opt/render/project/data/uploads';
} else {
  uploadsDir = path.join(__dirname, '../uploads');
}

const serviceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.model('Service', serviceSchema, 'services');

async function checkImagesStatus() {
  try {
    // Ia TOATE serviciile
    const services = await Service.find({}).lean();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPORT COMPLET IMAGINI SERVICII');
    console.log('='.repeat(80));
    console.log(`📦 Total servicii în baza de date: ${services.length}\n`);

    let stats = {
      hasImages: 0,           // Are imagini în DB
      noImages: 0,            // Nu are imagini în DB
      imagesNotFoundOnDisk: 0, // Are imagini în DB dar nu există pe disk
      imagesOk: 0,            // Are imagini în DB și există pe disk
      totalImagesInDB: 0,     // Total imagini înregistrate în DB
      totalImagesOnDisk: 0     // Total imagini găsite pe disk
    };

    const missingOnDisk = [];    // Imagini în DB dar lipsă pe disk
    const servicesWithIssues = []; // Servicii cu probleme

    for (const service of services) {
      let serviceHasIssue = false;
      
      if (service.images && Array.isArray(service.images) && service.images.length > 0) {
        stats.hasImages++;
        stats.totalImagesInDB += service.images.length;
        
        for (const img of service.images) {
          const filename = img.url.split('/').pop();
          const filePath = path.join(uploadsDir, filename);
          const exists = fs.existsSync(filePath);
          
          if (exists) {
            stats.imagesOk++;
            stats.totalImagesOnDisk++;
          } else {
            stats.imagesNotFoundOnDisk++;
            missingOnDisk.push({
              serviceId: service._id,
              serviceName: service.name,
              filename: filename,
              dbUrl: img.url
            });
            serviceHasIssue = true;
          }
        }
      } else {
        stats.noImages++;
        serviceHasIssue = true;
      }
      
      if (serviceHasIssue) {
        servicesWithIssues.push({
          id: service._id,
          name: service.name,
          hasImagesInDB: (service.images && service.images.length > 0),
          imagesCount: service.images?.length || 0
        });
      }
    }

    // Rezumat general
    console.log('📈 STATISTICI GENERALE:');
    console.log(`   ✅ Servicii CU imagini în DB: ${stats.hasImages}`);
    console.log(`   ⚠️ Servicii FĂRĂ imagini în DB: ${stats.noImages}`);
    console.log(`   📸 Total imagini înregistrate în DB: ${stats.totalImagesInDB}`);
    console.log(`   💾 Total imagini găsite pe disk: ${stats.totalImagesOnDisk}`);
    console.log(`   ✅ Imagini OK (există în DB și pe disk): ${stats.imagesOk}`);
    console.log(`   ❌ Imagini în DB dar LIPSĂ pe disk: ${stats.imagesNotFoundOnDisk}\n`);

    // Lista serviciilor cu probleme
    if (servicesWithIssues.length > 0) {
      console.log('🔴 SERVICII CU PROBLEME:');
      console.log('=' .repeat(80));
      
      for (const service of servicesWithIssues) {
        console.log(`\n📌 Serviciu: ${service.name}`);
        console.log(`   ID: ${service.id}`);
        console.log(`   Are imagini în DB: ${service.hasImagesInDB ? `DA (${service.imagesCount} imagini)` : 'NU'}`);
      }
    }

    // Lista detaliată a imaginilor lipsă pe disk
    if (missingOnDisk.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('🖼️ IMAGINI ÎNREGISTRATE ÎN DB DAR LIPSĂ PE DISK:');
      console.log('='.repeat(80));
      
      for (const item of missingOnDisk) {
        console.log(`\n📌 Serviciu: ${item.serviceName}`);
        console.log(`   Fișier lipsă: ${item.filename}`);
        console.log(`   URL în DB: ${item.dbUrl}`);
      }
    }

    // Recomandări
    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMANDĂRI:');
    console.log('='.repeat(80));
    
    if (stats.imagesNotFoundOnDisk > 0) {
      console.log(`\n🔴 ${stats.imagesNotFoundOnDisk} imagini sunt înregistrate în DB dar nu există pe disk.`);
      console.log('   Soluție: Trebuie să reîncarci aceste imagini prin panoul admin.');
    }
    
    if (stats.noImages > 0) {
      console.log(`\n🟡 ${stats.noImages} servicii nu au nicio imagine încărcată în DB.`);
      console.log('   Soluție: Poți adăuga imagini prin panoul admin pentru aceste servicii.');
    }
    
    if (stats.imagesOk > 0) {
      console.log(`\n✅ ${stats.imagesOk} imagini funcționează corect.`);
    }

    console.log('\n🎯 Acest script NU a modificat nimic în baza de date sau pe disk.');
    console.log('   Este doar un raport de diagnostic.\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err);
    process.exit(1);
  }
}
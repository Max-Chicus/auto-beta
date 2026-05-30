// scripts/restoreByFilenamePattern.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = "mongodb+srv://chicusmaxim81_db_user:Chicus2026!@cluster0.mtpfskc.mongodb.net/autoDB?retryWrites=true&w=majority";

const serviceSchema = new mongoose.Schema({
  name: String,
  createdAt: Date,
  images: Array
}, { collection: 'services' });

const Service = mongoose.model('Service', serviceSchema);

async function restore() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectat\n');

  const uploadDir = path.join(__dirname, '../uploads');
  const files = fs.readdirSync(uploadDir);
  
  console.log(`📁 ${files.length} imagini în folder\n`);
  
  let restored = 0;
  let matched = 0;
  
  // Grupează imaginile după timestamp-ul din nume
  const imagesByTimestamp = {};
  
  for (const file of files) {
    const match = file.match(/service-(\d+)/);
    if (match) {
      const timestamp = parseInt(match[1]);
      if (!imagesByTimestamp[timestamp]) {
        imagesByTimestamp[timestamp] = [];
      }
      imagesByTimestamp[timestamp].push(file);
    }
  }
  
  console.log(`📊 ${Object.keys(imagesByTimestamp).length} timestamp-uri unice\n`);
  
  // Pentru fiecare serviciu, caută imagini cu timestamp apropiat
  const services = await Service.find({});
  
  for (const service of services) {
    const serviceTime = service.createdAt?.getTime();
    if (!serviceTime) continue;
    
    // Caută timestamp-ul cel mai apropiat
    let bestMatch = null;
    let smallestDiff = Infinity;
    
    for (const imgTimestamp of Object.keys(imagesByTimestamp)) {
      const diff = Math.abs(serviceTime - parseInt(imgTimestamp));
      if (diff < smallestDiff && diff < 86400000) { // Mai puțin de 24h diferență
        smallestDiff = diff;
        bestMatch = imgTimestamp;
      }
    }
    
    if (bestMatch && imagesByTimestamp[bestMatch].length > 0) {
      const newImages = [];
      
      for (const file of imagesByTimestamp[bestMatch]) {
        const stats = fs.statSync(path.join(uploadDir, file));
        newImages.push({
          url: `/uploads/${file}`,
          name: file,
          size: stats.size
        });
      }
      
      if (newImages.length > 0) {
        service.images = newImages;
        await service.save();
        restored++;
        matched += newImages.length;
        console.log(`✅ ${service.name} → ${newImages.length} imagini (dif: ${smallestDiff}ms)`);
      }
    }
  }
  
  console.log(`\n📊 REZUMAT:`);
  console.log(`   Servicii restaurate: ${restored}`);
  console.log(`   Imagini asociate: ${matched}`);
  
  process.exit();
}

restore();
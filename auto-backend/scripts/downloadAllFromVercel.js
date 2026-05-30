const https = require('https');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://chicusmaxim81_db_user:Chicus2026!@cluster0.mtpfskc.mongodb.net/autoDB?retryWrites=true&w=majority";

const serviceSchema = new mongoose.Schema({
  images: [{ url: String, name: String }]
}, { collection: 'services' });

const Service = mongoose.model('Service', serviceSchema);

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectat');

  const services = await Service.find({ 'images.0': { $exists: true } });
  const uploadDir = path.join(__dirname, '../uploads');
  
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  let total = 0;
  let success = 0;
  let failed = 0;

  for (const service of services) {
    for (const img of service.images) {
      if (img.url && img.url.includes('vercel-storage.com')) {
        total++;
        const filename = img.url.split('/').pop();
        const filepath = path.join(uploadDir, filename);
        
        console.log(`⬇️ Descarc: ${filename}`);
        try {
          await downloadFile(img.url, filepath);
          success++;
          console.log(`   ✅ Salvat`);
        } catch (err) {
          failed++;
          console.log(`   ❌ Eșuat: ${err.message}`);
        }
      }
    }
  }

  console.log(`\n📊 Rezultat: ${success} succese, ${failed} eșuate din ${total}`);
  process.exit();
}

downloadAllImages();
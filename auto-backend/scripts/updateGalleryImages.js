// scripts/updateGalleryImages.js
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Conectat');
    updateGalleryImages();
  })
  .catch(err => console.error('❌ Eroare:', err));

async function updateGalleryImages() {
  try {
    // Verifică dacă există colecția galleries
    const collections = await mongoose.connection.db.listCollections().toArray();
    const galleryExists = collections.some(col => col.name === 'galleries');
    
    if (!galleryExists) {
      console.log('⚠️ Colecția galleries nu există');
      process.exit(0);
    }
    
    const Gallery = mongoose.model('Gallery', new mongoose.Schema({
      url: String,
      alt: String,
      order: Number
    }), 'galleries');
    
    const images = await Gallery.find({});
    console.log(`📊 Am găsit ${images.length} imagini\n`);
    
    let updated = 0;
    
    for (const image of images) {
      let newUrl = null;
      
      if (image.url.includes('vercel-storage.com')) {
        const filename = image.url.split('/').pop();
        newUrl = `/uploads/${filename}`;
      }
      else if (image.url.includes('localhost:5000')) {
        const match = image.url.match(/\/uploads\/(.+)$/);
        if (match) newUrl = `/uploads/${match[1]}`;
      }
      
      if (newUrl && newUrl !== image.url) {
        await Gallery.updateOne(
          { _id: image._id },
          { $set: { url: newUrl } }
        );
        console.log(`✅ Actualizat: ${image.url} -> ${newUrl}`);
        updated++;
      }
    }
    
    console.log(`\n🎉 Actualizate: ${updated} imagini`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Eroare:', err);
    process.exit(1);
  }
}
// scripts/migrateContinue.js
const { list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BLOB_TOKEN = "vercel_blob_rw_rg7RPlgfdfpiDdPF_Vywcjw7PMipMPYBJhYe942fPkod6GP";
const uploadDir = path.join(__dirname, '../uploads');

async function continueMigration() {
  try {
    // Obține lista fișierelor deja descărcate
    const existingFiles = new Set();
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(f => existingFiles.add(f));
      console.log(`📁 Fișiere deja existente: ${existingFiles.size}\n`);
    }

    // Obține toate fișierele din Vercel
    console.log('📋 Listare fișiere din Vercel...');
    const { blobs } = await list({
      token: BLOB_TOKEN,
      limit: 1000
    });
    
    console.log(`📦 Total fișiere în Vercel: ${blobs.length}\n`);
    
    // Filtrează fișierele care nu au fost încă descărcate
    const missingFiles = blobs.filter(blob => !existingFiles.has(blob.pathname));
    
    console.log(`📥 Fișiere rămase de descărcat: ${missingFiles.length}\n`);
    console.log('=' .repeat(60));
    
    let downloaded = 0;
    let failed = 0;
    
    for (let i = 0; i < missingFiles.length; i++) {
      const blob = missingFiles[i];
      console.log(`⬇️ [${i + 1}/${missingFiles.length}] ${blob.pathname}`);
      
      try {
        const response = await axios({
          method: 'get',
          url: blob.url,
          responseType: 'stream',
          timeout: 60000, // 60 secunde timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        
        const filepath = path.join(uploadDir, blob.pathname);
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        console.log(`   ✅ Salvat (${(blob.size / 1024).toFixed(2)} KB)`);
        downloaded++;
        
      } catch (err) {
        console.log(`   ❌ Eșuat: ${err.message}`);
        failed++;
        
        // Dacă e timeout, așteaptă și încearcă din nou
        if (err.message.includes('timeout')) {
          console.log(`   ⏳ Aștept 3 secunde...`);
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 Rezultat: ${downloaded} succese, ${failed} eșuate`);
    console.log(`📁 Total fișiere în uploads: ${existingFiles.size + downloaded}`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ EROARE:', error);
  }
}

continueMigration();
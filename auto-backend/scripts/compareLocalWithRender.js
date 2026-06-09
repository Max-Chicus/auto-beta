const fs = require('fs');
const path = require('path');

const localUploadsDir = path.join(__dirname, '../uploads');
const files = fs.readdirSync(localUploadsDir);

console.log(`📁 Am găsit ${files.length} fișiere în folderul local uploads\n`);

// Caută fișierul specific
const missingFile = '1780432632329-4e93s-39.png';
if (files.includes(missingFile)) {
  console.log(`✅ Fișierul ${missingFile} EXISTĂ local!`);
  console.log(`   Cale: ${path.join(localUploadsDir, missingFile)}`);
  
  const stats = fs.statSync(path.join(localUploadsDir, missingFile));
  console.log(`   Dimensiune: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
  console.log(`❌ Fișierul ${missingFile} NU EXISTĂ local.`);
}
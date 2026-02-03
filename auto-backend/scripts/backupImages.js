// scripts/backupImages.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const uploadsPath = path.join(__dirname, '../uploads');
const backupPath = path.join(__dirname, '../backups/uploads');

// Creează backup zilnic
if (!fs.existsSync(backupPath)) {
  fs.mkdirSync(backupPath, { recursive: true });
}

const timestamp = new Date().toISOString().split('T')[0];
const backupFolder = path.join(backupPath, timestamp);

if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}

// Copiază fișierele
fs.readdirSync(uploadsPath).forEach(file => {
  const source = path.join(uploadsPath, file);
  const destination = path.join(backupFolder, file);
  fs.copyFileSync(source, destination);
});

console.log(`✅ Backup creat: ${backupFolder}`);
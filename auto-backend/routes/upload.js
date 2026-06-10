const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('✅ Upload router loaded - using LOCAL storage');

// ========== DETERMINĂ CALEA CORECTĂ PENTRU UPLOADS ==========
let uploadDir;
if (process.env.RENDER) {
  // Pe Render: folosește calea persistentă a discului
  uploadDir = '/opt/render/project/data/uploads';
  console.log('📡 Rulează pe Render, folosește disk persistent:', uploadDir);
} else {
  // Pe Windows (local): folosește calea relativă
  uploadDir = path.join(__dirname, '../uploads');
  console.log('💻 Rulează local, folosește folderul:', uploadDir);
}

// Asigură-te că directorul uploads există
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Director uploads creat:', uploadDir);
}

// Configurare multer cu storage local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Curăță numele fișierului
    const cleanName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, '_')
      .substring(0, 50);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomString}-${cleanName}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Doar imagini sunt permise!'));
    }
  }
});

// Test GET
router.get('/', (req, res) => {
  res.json({ message: 'Upload route is working (local storage)!' });
});

// Endpoint POST pentru upload imagini servicii
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nicio imagine încărcată' });
    }

    console.log('📸 Imagine salvată local:', req.file.filename);
    console.log('   Cale:', req.file.path);
    console.log('   Dimensiune:', req.file.size, 'bytes');

    // Construiește URL-ul pentru frontend
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      url: imageUrl,
      name: req.file.originalname,
      size: req.file.size,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('❌ Eroare la upload:', error);
    res.status(500).json({ error: error.message || 'Eroare la încărcarea imaginii' });
  }
});

// Endpoint pentru upload logo-uri brand
router.post('/brand-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Niciun logo încărcat' });
    }

    console.log('📸 Logo salvat local:', req.file.filename);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      url: imageUrl,
      name: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Eroare la upload logo:', error);
    res.status(500).json({ error: error.message || 'Eroare la încărcarea logo-ului' });
  }
});


module.exports = router;
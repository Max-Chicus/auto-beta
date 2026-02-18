// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');

// ✅ ADĂUGĂ ASTA LA ÎNCEPUT PENTRU DEBUG
console.log('✅ Upload router loaded - endpoints: /, / (POST), /brand-logo (POST)');

// Test GET
router.get('/', (req, res) => {
    res.json({ message: 'Upload route is working!' });
});

// Configurare multer pentru a procesa fișierul în memory (nu pe disk)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Endpoint POST pentru upload imagini
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // Verifică dacă există fișier
        if (!req.file) {
            return res.status(400).json({ error: 'Nicio imagine încărcată' });
        }

        console.log('📸 Primit fișier pentru upload:', req.file.originalname);

        // Generează nume unic pentru fișier
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `service-${timestamp}-${randomString}.${fileExtension}`;

        // Încarcă în Vercel Blob
        const blob = await put(fileName, req.file.buffer, {
            access: 'public',
            contentType: req.file.mimetype,
            addRandomSuffix: false,
        });

        console.log('✅ Imagine încărcată pe Vercel Blob:', blob.url);

        // Returnează URL-ul către frontend
        res.json({
            url: blob.url,
            name: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error('❌ Eroare la upload:', error);
        res.status(500).json({
            error: error.message || 'Eroare la încărcarea imaginii'
        });
    }
});

// Adaugă acest endpoint nou pentru logo-uri
router.post('/brand-logo', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Niciun logo încărcat' });
        }

        console.log('📸 Primit logo pentru upload:', req.file.originalname);

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `brand-logo-${timestamp}-${randomString}.${fileExtension}`;

        const blob = await put(fileName, req.file.buffer, {
            access: 'public',
            contentType: req.file.mimetype,
            addRandomSuffix: false,
        });

        console.log('✅ Logo încărcat pe Vercel Blob:', blob.url);

        res.json({
            url: blob.url,
            name: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error('❌ Eroare la upload logo:', error);
        res.status(500).json({
            error: error.message || 'Eroare la încărcarea logo-ului'
        });
    }
});

module.exports = router;
// routes/public.js
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Brand = require('../models/Brand');
const ServiceRequest = require('../models/ServiceRequest');
const Announcement = require('../models/Announcement');

// Statistici pentru homepage
router.get('/stats', async (req, res) => {
  try {
    const [servicesCount, brandsCount, requestsCount] = await Promise.all([
      Service.countDocuments({ isActive: true }),
      Brand.countDocuments(),
      ServiceRequest.countDocuments()
    ]);

    res.json({
      totalServices: servicesCount,
      totalBrands: brandsCount,
      totalRequests: requestsCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ADĂUGĂ RUTA PENTRU ANUNȚ ==========
router.get('/announcement', async (req, res) => {
  try {
    const announcement = await Announcement.findOne({ isActive: true });
    res.json(announcement || { isActive: false, title: '', message: '', type: 'info' });
  } catch (err) {
    console.error('Eroare la obținerea anunțului public:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== RUTE PUBLICE PENTRU GALERIE ==========

// GET toate imaginile din galerie pentru frontend
router.get('/gallery', async (req, res) => {
  try {
    // Încercăm să încărcăm modelul Gallery
    let Gallery;
    try {
      Gallery = require('../models/Gallery');
    } catch (err) {
      console.log('⚠️ Modelul Gallery nu există, returnez array gol');
      return res.json([]);
    }

    const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error('Eroare la încărcarea galeriei publice:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET o singură imagine din galerie (opțional)
router.get('/gallery/:id', async (req, res) => {
  try {
    let Gallery;
    try {
      Gallery = require('../models/Gallery');
    } catch (err) {
      return res.status(404).json({ error: 'Modelul Gallery nu există' });
    }

    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Imaginea nu a fost găsită' });
    }

    res.json(image);
  } catch (err) {
    console.error('Eroare la încărcarea imaginii:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
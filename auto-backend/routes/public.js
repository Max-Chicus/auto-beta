// routes/public.js
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Brand = require('../models/Brand');
const ServiceRequest = require('../models/ServiceRequest');

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

module.exports = router;
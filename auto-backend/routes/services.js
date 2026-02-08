// routes/services.js
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Brand = require('../models/Brand');

// GET all services (for catalog)
router.get('/', async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      serviceType,
      search,
      featured,
      limit = 50
    } = req.query;

    let query = { isActive: true };

    // Filtrare după brand (nume sau ID)
    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        query.brand = brand;
      } else {
        // Caută brand după nume
        const brandDoc = await Brand.findOne({ name: new RegExp(brand, 'i') });
        if (brandDoc) {
          query.brand = brandDoc._id;
        }
      }
    }

    // Filtrare după tip serviciu
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Căutare text
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'compatibleModels.modelName': { $regex: search, $options: 'i' } },
        { 'compatibleModels.modelCode': { $regex: search, $options: 'i' } }
      ];
    }

    // Servicii recomandate
    if (featured === 'true') {
      query.featured = true;
    }

    let services = await Service.find(query)
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon')
      .limit(parseInt(limit))
      .sort({ featured: -1, popularity: -1, name: 1 });

    // FILTRARE AVANSATĂ: model + an (dacă sunt specificate)
    if (model && year) {
      services = services.filter(service =>
        service.compatibleModels.some(cm => {
          const matchesModel = cm.modelName.toLowerCase().includes(model.toLowerCase()) ||
            (cm.modelCode && cm.modelCode.toLowerCase().includes(model.toLowerCase()));
          const matchesYear = parseInt(year) >= cm.yearFrom && parseInt(year) <= cm.yearTo;
          return matchesModel && matchesYear;
        })
      );
    }

    res.json(services);
  } catch (err) {
    console.error('Eroare la preluarea serviciilor:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET newest services
router.get('/newest', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const services = await Service.find({ isActive: true })
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon')
      .sort({ createdAt: -1 }) // Sortează după data creării (cele mai noi)
      .limit(parseInt(limit));

    res.json(services);
  } catch (err) {
    console.error('Eroare la preluarea serviciilor noi:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET services for specific vehicle
router.get('/for-vehicle', async (req, res) => {
  try {
    const { brandId, modelName, year } = req.query;

    if (!brandId || !modelName || !year) {
      return res.status(400).json({
        error: 'Brand, model și an sunt obligatorii'
      });
    }

    const services = await Service.find({
      brand: brandId,
      isActive: true
    })
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon')
      .sort({ serviceType: 1, name: 1 });

    // Filtrează serviciile compatibile
    const compatibleServices = services.filter(service =>
      service.compatibleModels.some(cm => {
        const matchesModel = cm.modelName.toLowerCase().includes(modelName.toLowerCase()) ||
          (cm.modelCode && cm.modelCode.toLowerCase().includes(modelName.toLowerCase()));
        const matchesYear = parseInt(year) >= cm.yearFrom && parseInt(year) <= cm.yearTo;
        return matchesModel && matchesYear;
      })
    );

    res.json(compatibleServices);
  } catch (err) {
    console.error('Eroare la căutarea serviciilor pentru vehicul:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon');

    if (!service) {
      return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    }

    // Incrementează popularitatea
    service.popularity += 1;
    await service.save();

    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET service types (categorii)
router.get('/types/all', async (req, res) => {
  try {
    const ServiceType = require('../models/ServiceType');
    const serviceTypes = await ServiceType.find({ isActive: true }).sort({ name: 1 });
    res.json(serviceTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
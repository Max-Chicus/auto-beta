// routes/services.js
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Brand = require('../models/Brand');
const ServiceType = require('../models/ServiceType'); // ← IMPORTANT: Adaugă asta

router.get('/', async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      serviceType,
      serviceTypeName,
      search,
      featured,
      page = 1,
      limit = 21
    } = req.query;

    console.log('🔍 PRIMIT PARAMETRII:', { brand, model, year, serviceType, serviceTypeName, search, featured, page, limit });

    // Construim query-ul de bază
    let query = { isActive: true };

    // Filtrare după brand
    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        query.brand = brand;
      } else {
        const brandDoc = await Brand.findOne({ name: new RegExp(brand, 'i') });
        if (brandDoc) {
          query.brand = brandDoc._id;
        }
      }
    }

    // Filtrare după tip serviciu - după ID
    if (serviceType) {
      if (mongoose.Types.ObjectId.isValid(serviceType)) {
        query.serviceType = serviceType;
      } else {
        const typeDoc = await ServiceType.findOne({ name: new RegExp(serviceType, 'i') });
        if (typeDoc) {
          query.serviceType = typeDoc._id;
        }
      }
    }

    // Filtrare după numele tipului de serviciu
    if (serviceTypeName && serviceTypeName.trim() !== '') {
      console.log('🎯 CAUT DUPA SERVICE TYPE NAME:', serviceTypeName);
      const typeDoc = await ServiceType.findOne({
        name: { $regex: serviceTypeName, $options: 'i' }
      });
      if (typeDoc) {
        console.log('✅ GĂSIT TIP SERVICIU:', typeDoc.name, 'cu ID:', typeDoc._id);
        query.serviceType = typeDoc._id;
      } else {
        console.log('❌ NU S-A GĂSIT tipul de serviciu:', serviceTypeName);
      }
    }

    // Căutare text în nume
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Servicii recomandate
    if (featured === 'true') {
      query.featured = true;
    }

    console.log('📦 Query MongoDB:', JSON.stringify(query));

    // CALCULEAZĂ PAGINAȚIA
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execută query-ul CU PAGINAȚIE
    let services = await Service.find(query)
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon')
      .sort({ featured: -1, popularity: -1, name: 1 })
      .skip(skip)
      .limit(limitNum);

    console.log('📊 Total servicii înainte de filtrare model:', services.length);

    // FILTRU MANUAL pentru model
    if (model && model.trim() !== '') {
      console.log('🎯 FILTREZ DUPA MODEL:', model);
      const modelSearch = model.toLowerCase().trim();
      services = services.filter(service => {
        if (!service.compatibleModels || service.compatibleModels.length === 0) {
          return false;
        }
        const hasMatch = service.compatibleModels.some(cm => {
          if (!cm.modelName) return false;
          const dbModel = cm.modelName.toLowerCase().trim();
          return dbModel === modelSearch ||
            dbModel.includes(modelSearch) ||
            modelSearch.includes(dbModel);
        });
        return hasMatch;
      });
      console.log('📊 Servicii după filtrare model:', services.length);
    }

    // FILTRU pentru model + an
    if (model && year) {
      console.log('🎯 FILTREZ DUPA MODEL + AN:', model, year);
      const modelSearch = model.toLowerCase().trim();
      const yearNum = parseInt(year);
      services = services.filter(service => {
        if (!service.compatibleModels) return false;
        return service.compatibleModels.some(cm => {
          if (!cm.modelName) return false;
          const dbModel = cm.modelName.toLowerCase().trim();
          const matchesModel = dbModel === modelSearch ||
            dbModel.includes(modelSearch) ||
            modelSearch.includes(dbModel);
          const matchesYear = yearNum >= cm.yearFrom && yearNum <= cm.yearTo;
          return matchesModel && matchesYear;
        });
      });
      console.log('📊 Servicii după filtrare model+an:', services.length);
    }

    // CALCULEAZĂ TOTALUL PENTRU PAGINAȚIE
    const total = await Service.countDocuments(query);
    let totalAfterModelFilter = total;
    
    if (model && model.trim() !== '') {
      const allServicesForCount = await Service.find(query)
        .populate('brand', 'name logo')
        .populate('serviceType', 'name icon');
      const filteredCount = allServicesForCount.filter(service => {
        if (!service.compatibleModels || service.compatibleModels.length === 0) return false;
        return service.compatibleModels.some(cm => {
          if (!cm.modelName) return false;
          const dbModel = cm.modelName.toLowerCase().trim();
          const modelSearch = model.toLowerCase().trim();
          return dbModel === modelSearch || dbModel.includes(modelSearch) || modelSearch.includes(dbModel);
        });
      }).length;
      totalAfterModelFilter = filteredCount;
    }

    const totalPages = Math.ceil(totalAfterModelFilter / limitNum);
    console.log(`📄 Pagina ${pageNum} din ${totalPages} (${totalAfterModelFilter} total servicii)`);

    // ✅ RETURNEAZĂ FORMATUL CORECT CU PAGINAȚIE
    res.json({
      services: services,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalAfterModelFilter,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (err) {
    console.error('❌ EROARE:', err);
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
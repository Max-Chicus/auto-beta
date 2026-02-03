const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const ServiceType = require('../models/ServiceType');
const Service = require('../models/Service'); // Adaugă acest import

// GET all filters for frontend
router.get('/', async (req, res) => {
  try {
    const [brands, serviceTypes] = await Promise.all([
      Brand.find().sort({ name: 1 }),
      ServiceType.find({ isActive: true }).sort({ name: 1 })
    ]);

    res.json({
      success: true,
      brands,
      serviceTypes
      // Modelele nu se returnează aici - se iau separat
    });
  } catch (err) {
    console.error('❌ Eroare la preluarea filtrelor:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la încărcarea filtrelor' 
    });
  }
});

// ✅ NOU: GET models for a specific brand
router.get('/models', async (req, res) => {
  try {
    const { brand } = req.query;
    
    if (!brand) {
      return res.status(400).json({ 
        success: false, 
        message: 'Brand ID este necesar' 
      });
    }

    // Verifică dacă brandul există
    const brandExists = await Brand.findById(brand);
    if (!brandExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Marca nu a fost găsită' 
      });
    }

    // Găsește toate serviciile pentru acest brand
    const services = await Service.find({ brand })
      .select('compatibleModels')
      .lean();

    // Extrage modelele unice din compatibleModels
    const allModels = [];
    
    services.forEach(service => {
      if (service.compatibleModels && Array.isArray(service.compatibleModels)) {
        service.compatibleModels.forEach(model => {
          if (model.modelName) {
            // Verifică dacă modelul există deja
            const existingModel = allModels.find(m => 
              m.modelName.toLowerCase() === model.modelName.toLowerCase()
            );
            
            if (!existingModel) {
              allModels.push({
                modelName: model.modelName,
                modelCode: model.modelCode || '',
                brandId: brand,
                brandName: brandExists.name
              });
            }
          }
        });
      }
    });

    // Sortează alfabetic
    allModels.sort((a, b) => a.modelName.localeCompare(b.modelName));

    res.json({
      success: true,
      brand: brandExists.name,
      models: allModels,
      count: allModels.length
    });

  } catch (err) {
    console.error('❌ Eroare la obținerea modelelor:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea modelelor' 
    });
  }
});

module.exports = router;
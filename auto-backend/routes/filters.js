const express = require('express');
const router = express.Router();

const Brand = require('../models/Brand');
const Model = require('../models/Model');
const Engine = require('../models/Engine');
const Year = require('../models/Year');
const Category = require('../models/Category');

router.get('/', async (req, res) => {
  try {
    const [brands, models, engines, years, categories] = await Promise.all([
      Brand.find(),
      Model.find().populate('brand', 'name'),
      Engine.find().populate('model', 'name'),
      Year.find().sort({ value: -1 }),
      Category.find()
    ]);

    // Format pentru frontend (include și brand name pentru model)
    const formattedModels = models.map(m => ({
      _id: m._id,
      name: m.name,
      brand: m.brand.name, // pentru filtrare în Home page
      brandId: m.brand._id
    }));

    // Format pentru frontend (include și model name pentru engine)
    const formattedEngines = engines.map(e => ({
      _id: e._id,
      name: e.name,
      model: e.model.name, // pentru filtrare în Home page
      modelId: e.model._id
    }));

    res.json({
      brands,
      models: formattedModels,
      engines: formattedEngines,
      years,
      categories
    });
  } catch (err) {
    console.error('Eroare la preluarea filtrelor:', err);
    res.status(500).json({ message: 'Eroare filtre' });
  }
});

module.exports = router;
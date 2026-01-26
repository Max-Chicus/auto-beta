const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Model = require('../models/Model');
const Engine = require('../models/Engine');
const Category = require('../models/Category');

router.get('/', async (req, res) => {
  try {
    console.log('Query params primite:', req.query);
    
    const query = {};

    // ========== FILTRARE BRAND ==========
    if (req.query.brand && req.query.brand.length > 0) {
      const brandNames = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
      console.log('Caut brand-uri cu numele:', brandNames);
      
      const brands = await Brand.find({ name: { $in: brandNames } });
      console.log('Brand-uri găsite:', brands);
      
      if (brands.length > 0) {
        query.brand = { $in: brands.map(b => b._id) };
      }
    }

    // ========== FILTRARE MODEL ==========
    if (req.query.model && req.query.model.length > 0) {
      const modelNames = Array.isArray(req.query.model) ? req.query.model : [req.query.model];
      console.log('Caut modele cu numele:', modelNames);
      
      const models = await Model.find({ name: { $in: modelNames } });
      console.log('Modele găsite:', models);
      
      if (models.length > 0) {
        query.model = { $in: models.map(m => m._id) };
      }
    }

    // ========== FILTRARE ENGINE ==========
    if (req.query.engine && req.query.engine.length > 0) {
      const engineNames = Array.isArray(req.query.engine) ? req.query.engine : [req.query.engine];
      console.log('Caut motoare cu numele:', engineNames);
      
      const engines = await Engine.find({ name: { $in: engineNames } });
      console.log('Motoare găsite:', engines);
      
      if (engines.length > 0) {
        query.engine = { $in: engines.map(e => e._id) };
      }
    }

    // ========== FILTRARE YEAR ==========
    if (req.query.year && req.query.year.length > 0) {
      const years = Array.isArray(req.query.year) ? req.query.year : [req.query.year];
      query.year = { $in: years.map(y => parseInt(y)) };
    }

    // ========== FILTRARE CATEGORY ==========
    if (req.query.category && req.query.category.length > 0) {
      const categories = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
      query.category = { $in: categories };
    }

    console.log('Query final pentru MongoDB:', JSON.stringify(query, null, 2));
    
    // ========== EXECUTĂ QUERY CU POPULARE ==========
    const products = await Product.find(query)
      .populate('brand', 'name')
      .populate('model', 'name')
      .populate('engine', 'name')
      .populate('category', 'name');

    console.log(`Găsite ${products.length} produse`);
    
    res.json(products);
  } catch (err) {
    console.error('Eroare la filtrare:', err);
    res.status(500).json({ message: 'Eroare produse', error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name')
      .populate('model', 'name')
      .populate('engine', 'name')
      .populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Produsul nu a fost găsit' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Model = require('../models/Model');
const Engine = require('../models/Engine');
const Category = require('../models/Category');
const Year = require('../models/Year');

// ========== MIDDLEWARE DE AUTENTIFICARE SIMPLĂ ==========
// const authMiddleware = (req, res, next) => {
//   // Poți folosi un token simplu sau autentificare basic
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader) {
//     return res.status(401).json({ error: 'Acces neautorizat. Token necesar.' });
//   }
  
//   // Token simplu - în producție folosește JWT
//   const token = authHeader.replace('Bearer ', '');
  
//   if (token === process.env.ADMIN_TOKEN || token === 'admin123') {
//     next();
//   } else {
//     res.status(401).json({ error: 'Token invalid' });
//   }
// };

// Aplică middleware-ul pentru toate rutele admin
// router.use(authMiddleware);
console.log('✅ Admin routes loaded (no auth for development)');

// ========== DASHBOARD STATISTICS ==========
router.get('/stats', async (req, res) => {
  try {
    const [
      productsCount,
      brandsCount,
      modelsCount,
      enginesCount,
      categoriesCount,
      yearsCount
    ] = await Promise.all([
      Product.countDocuments(),
      Brand.countDocuments(),
      Model.countDocuments(),
      Engine.countDocuments(),
      Category.countDocuments(),
      Year.countDocuments()
    ]);

    // Ultimele 5 produse adăugate
    const recentProducts = await Product.find()
      .populate('brand', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      counts: {
        products: productsCount,
        brands: brandsCount,
        models: modelsCount,
        engines: enginesCount,
        categories: categoriesCount,
        years: yearsCount
      },
      recentProducts
    });
  } catch (err) {
    console.error('Eroare stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== CRUD PENTRU PRODUSE ==========

// GET all products (with filters for admin)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Căutare după nume
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('brand', 'name')
        .populate('model', 'name')
        .populate('engine', 'name')
        .populate('category', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Eroare get products:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('brand', 'name')
      .populate('model', 'name')
      .populate('engine', 'name')
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE product
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // Validare simplă
    if (!productData.name || !productData.price) {
      return res.status(400).json({ error: 'Numele și prețul sunt obligatorii' });
    }

    const product = await Product.create(productData);
    
    // Returnează produsul populat
    const populatedProduct = await Product.findById(product._id)
      .populate('brand', 'name')
      .populate('model', 'name')
      .populate('engine', 'name')
      .populate('category', 'name');

    res.status(201).json({
      message: 'Produs creat cu succes',
      product: populatedProduct
    });
  } catch (err) {
    console.error('Eroare create product:', err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('brand', 'name')
     .populate('model', 'name')
     .populate('engine', 'name')
     .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    }

    res.json({
      message: 'Produs actualizat cu succes',
      product
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    }

    res.json({ 
      message: 'Produs șters cu succes',
      deletedId: product._id 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CRUD PENTRU BRAND-URI ==========

// GET all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE brand
router.post('/brands', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Numele este obligatoriu' });
    }

    // Verifică dacă brandul există deja
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({ error: 'Brandul există deja' });
    }

    const brand = await Brand.create({ name });
    res.status(201).json({
      message: 'Brand creat cu succes',
      brand
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE brand
router.delete('/brands/:id', async (req, res) => {
  try {
    // Verifică dacă brandul are produse asociate
    const productsCount = await Product.countDocuments({ brand: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: `Nu poți șterge acest brand. Are ${productsCount} produse asociate.` 
      });
    }

    const brand = await Brand.findByIdAndDelete(req.params.id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brandul nu a fost găsit' });
    }

    res.json({ 
      message: 'Brand șters cu succes',
      deletedId: brand._id 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CRUD PENTRU MODELE ==========

// GET all models (with brand name)
router.get('/models', async (req, res) => {
  try {
    const models = await Model.find()
      .populate('brand', 'name')
      .sort({ name: 1 });
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE model
router.post('/models', async (req, res) => {
  try {
    const { name, brand } = req.body;
    
    if (!name || !brand) {
      return res.status(400).json({ error: 'Numele și brandul sunt obligatorii' });
    }

    // Verifică dacă modelul există deja pentru acest brand
    const existingModel = await Model.findOne({ name, brand });
    if (existingModel) {
      return res.status(400).json({ error: 'Modelul există deja pentru acest brand' });
    }

    const model = await Model.create({ name, brand });
    
    // Returnează modelul populat
    const populatedModel = await Model.findById(model._id)
      .populate('brand', 'name');

    res.status(201).json({
      message: 'Model creat cu succes',
      model: populatedModel
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== CRUD PENTRU MOTOARE ==========

// GET all engines (with model name)
router.get('/engines', async (req, res) => {
  try {
    const engines = await Engine.find()
      .populate('model', 'name')
      .sort({ name: 1 });
    res.json(engines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE engine
router.post('/engines', async (req, res) => {
  try {
    const { name, model } = req.body;
    
    if (!name || !model) {
      return res.status(400).json({ error: 'Numele și modelul sunt obligatorii' });
    }

    const engine = await Engine.create({ name, model });
    
    // Returnează motorul populat
    const populatedEngine = await Engine.findById(engine._id)
      .populate('model', 'name');

    res.status(201).json({
      message: 'Motor creat cu succes',
      engine: populatedEngine
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== CRUD PENTRU CATEGORII ==========

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE category
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Numele este obligatoriu' });
    }

    const category = await Category.create({ name });
    res.status(201).json({
      message: 'Categorie creată cu succes',
      category
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== CRUD PENTRU ANI ==========

// GET all years
router.get('/years', async (req, res) => {
  try {
    const years = await Year.find().sort({ value: -1 });
    res.json(years);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE year
router.post('/years', async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Valoarea anului este obligatorie' });
    }

    // Verifică dacă anul există deja
    const existingYear = await Year.findOne({ value });
    if (existingYear) {
      return res.status(400).json({ error: 'Anul există deja' });
    }

    const year = await Year.create({ value });
    res.status(201).json({
      message: 'An creat cu succes',
      year
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
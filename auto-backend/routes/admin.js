const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Service = require('../models/Service');
const ServiceType = require('../models/ServiceType');
const ServiceRequest = require('../models/ServiceRequest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

console.log('✅ Admin routes loaded');

// ========== LOGIN ADMIN ==========
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('🔐 Admin login attempt:', username);

  // Pentru demo, acceptă admin/admin123
  if (username === 'vasile' && password === 'Busuiocnmtec20e90r011076') {
    res.json({
      success: true,
      token: 'admin-jwt-token-' + Date.now(),
      user: {
        username: 'admin',
        role: 'admin',
        id: 'admin-001'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credențiale incorecte'
    });
  }
});

// Middleware pentru logging
router.use((req, res, next) => {
  console.log(`[ADMIN] ${req.method} ${req.path}`);
  next();
});

// ========== DASHBOARD STATISTICS ==========
router.get('/stats', async (req, res) => {
  try {
    const [
      servicesCount,
      serviceTypesCount,
      brandsCount,
      requestsCount,
      newRequestsCount
    ] = await Promise.all([
      Service.countDocuments({ isActive: true }),
      ServiceType.countDocuments({ isActive: true }),
      Brand.countDocuments(),
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: 'new' })
    ]);

    res.json({
      services: servicesCount,
      serviceTypes: serviceTypesCount,
      brands: brandsCount,
      serviceRequests: requestsCount,
      newServiceRequests: newRequestsCount
    });
  } catch (err) {
    console.error('Eroare stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== CRUD PENTRU BRAND-URI ==========
router.post('/brands', async (req, res) => {
  try {
    const { name, logo } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Numele este obligatoriu' });
    }

    // Verifică dacă brandul există deja
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingBrand) {
      return res.status(400).json({ error: 'Brandul există deja' });
    }

    // 🔥 NOU: Transformă URL-ul complet în cale relativă
    let logoPath = null;
    if (logo) {
      // Dacă e URL complet de la Vercel sau localhost, extrage doar calea
      if (logo.includes('vercel-storage.com') || logo.includes('localhost') || logo.includes('127.0.0.1')) {
        // Extrage partea după /uploads/
        const match = logo.match(/\/uploads\/(.+)$/);
        if (match) {
          logoPath = `/uploads/${match[1]}`;
        } else {
          // Dacă nu găsește pattern-ul, folosește ca atare
          logoPath = logo;
        }
      } else if (logo.startsWith('/uploads/')) {
        // Deja e cale relativă corectă
        logoPath = logo;
      } else {
        // Alt caz - păstrează originalul
        logoPath = logo;
      }
    }

    const brandData = {
      name,
      logo: logoPath  // ← Acum salvează calea relativă: /uploads/...
    };

    // Creează brandul
    const brand = await Brand.create(brandData);

    console.log(`✅ Brand creat: ${name} cu logo: ${logoPath}`);

    res.status(201).json({
      message: 'Brand creat cu succes',
      brand
    });

  } catch (err) {
    console.error('Eroare la crearea brandului:', err);
    res.status(400).json({ error: err.message });
  }
});

// ========== CRUD PENTRU TIPURI DE SERVICII ==========
router.get('/service-types', async (req, res) => {
  try {
    const serviceTypes = await ServiceType.find().sort({ name: 1 });
    res.json(serviceTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/service-types', async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Numele este obligatoriu' });

    const serviceType = await ServiceType.create({
      name,
      description: description || '',
      icon: icon || '⚙️'
    });

    res.status(201).json({ message: 'Tip serviciu creat cu succes', serviceType });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== CRUD PENTRU SERVICII ==========
// ========== CRUD PENTRU SERVICII ==========
router.get('/services', async (req, res) => {
  try {
    const { search = '', brand = '', serviceType = '', featured = '' } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'compatibleModels.modelName': { $regex: search, $options: 'i' } }
      ];
    }

    if (brand) query.brand = brand;
    if (serviceType) query.serviceType = serviceType;
    if (featured === 'true') query.featured = true;

    const services = await Service.find(query)
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon')
      .sort({ createdAt: -1 });

    res.json({ services, total: services.length });
  } catch (err) {
    console.error('Eroare get services:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('brand', 'name')
      .populate('serviceType', 'name icon');

    if (!service) return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE service - CU SUPPORT PENTRU PREȚ FIX SAU PREȚ DE LA
// CREATE service - CU CONVERSIE URL-URI IMAGINI
router.post('/services', async (req, res) => {
  console.log('🚀 CREATE SERVICE REQUEST');
  console.log('📦 Date primite:', req.body);

  try {
    const serviceData = req.body;

    // VALIDĂRI DE BAZĂ
    if (!serviceData.name) return res.status(400).json({ error: 'Numele este obligatoriu' });
    if (!serviceData.brand) return res.status(400).json({ error: 'Brandul este obligatoriu' });
    if (!serviceData.serviceType) return res.status(400).json({ error: 'Tipul serviciului este obligatoriu' });

    // VALIDARE PREȚURI în funcție de tip
    if (serviceData.repairPriceType === 'fixed') {
      if (!serviceData.repairPrice && serviceData.repairPrice !== 0) {
        return res.status(400).json({ error: 'Pentru preț fix, prețul reparației este obligatoriu' });
      }
    } else if (serviceData.repairPriceType === 'from') {
      if (!serviceData.repairPriceFrom && serviceData.repairPriceFrom !== 0) {
        return res.status(400).json({ error: 'Pentru preț "de la", prețul minim al reparației este obligatoriu' });
      }
    } else {
      serviceData.repairPriceType = 'fixed';
    }

    // Validare preț testare
    if (!serviceData.testPrice && serviceData.testPrice !== 0) {
      return res.status(400).json({ error: 'Prețul testării este obligatoriu' });
    }

    // Validare modele compatibile
    if (!serviceData.compatibleModels || serviceData.compatibleModels.length === 0) {
      return res.status(400).json({ error: 'Adaugă cel puțin un model compatibil' });
    }

    // VALIDARE MODELE
    for (const [index, model] of serviceData.compatibleModels.entries()) {
      if (!model.modelName) return res.status(400).json({ error: `Modelul #${index + 1} nu are nume` });
      if (!model.yearFrom) return res.status(400).json({ error: `Modelul "${model.modelName}" nu are anul "de la"` });
      if (!model.yearTo) return res.status(400).json({ error: `Modelul "${model.modelName}" nu are anul "până la"` });

      const yearFrom = Number(model.yearFrom);
      const yearTo = Number(model.yearTo);

      if (isNaN(yearFrom) || isNaN(yearTo)) {
        return res.status(400).json({ error: `Modelul "${model.modelName}" are ani invalizi` });
      }

      if (yearFrom > yearTo) {
        return res.status(400).json({
          error: `Modelul "${model.modelName}": anul "de la" (${yearFrom}) trebuie să fie <= "până la" (${yearTo})`
        });
      }
    }

    // VALIDARE ID-URI
    if (!mongoose.Types.ObjectId.isValid(serviceData.brand)) {
      return res.status(400).json({ error: 'ID brand invalid' });
    }
    if (!mongoose.Types.ObjectId.isValid(serviceData.serviceType)) {
      return res.status(400).json({ error: 'ID tip serviciu invalid' });
    }

    // CONVERTEȘTE PREȚURILE
    serviceData.testPrice = Number(serviceData.testPrice);
    if (isNaN(serviceData.testPrice)) {
      return res.status(400).json({ error: 'Prețul testării trebuie să fie un număr' });
    }

    if (serviceData.repairPriceType === 'fixed') {
      serviceData.repairPrice = Number(serviceData.repairPrice);
      if (isNaN(serviceData.repairPrice)) {
        return res.status(400).json({ error: 'Prețul reparației trebuie să fie un număr' });
      }
      serviceData.repairPriceFrom = null;
    } else {
      serviceData.repairPriceFrom = Number(serviceData.repairPriceFrom);
      if (isNaN(serviceData.repairPriceFrom)) {
        return res.status(400).json({ error: 'Prețul minim al reparației trebuie să fie un număr' });
      }
      serviceData.repairPrice = null;
    }

    // PROCESEAZĂ COMMONFAULTS
    if (typeof serviceData.commonFaults === 'string') {
      serviceData.commonFaults = serviceData.commonFaults
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);
    }

    // PROCESEAZĂ ENGINE CODES
    if (serviceData.compatibleModels) {
      serviceData.compatibleModels = serviceData.compatibleModels.map(model => ({
        modelName: model.modelName,
        modelCode: model.modelCode || '',
        yearFrom: Number(model.yearFrom),
        yearTo: Number(model.yearTo),
        engineCodes: Array.isArray(model.engineCodes)
          ? model.engineCodes
          : (model.engineCodes ? model.engineCodes.split(',').map(c => c.trim()).filter(c => c) : []),
        notes: model.notes || ''
      }));
    }

    // ADAUGĂ CÂMPURI DEFAULT
    if (serviceData.isActive === undefined) serviceData.isActive = true;
    if (!serviceData.popularity) serviceData.popularity = 0;
    if (!serviceData.currency) serviceData.currency = 'EUR';
    if (!serviceData.duration) serviceData.duration = '2-3 zile lucrătoare';
    if (!serviceData.warranty) serviceData.warranty = '12 luni';

    // ========== CONVERSIE URL-URI IMAGINI (SOLUȚIA PENTRU PROBLEMĂ) ==========
    if (serviceData.images && Array.isArray(serviceData.images)) {
      for (let i = 0; i < serviceData.images.length; i++) {
        if (serviceData.images[i].url) {
          // Extrage doar numele fișierului din URL
          let url = serviceData.images[i].url;
          const filename = url.split('/').pop();
          // Salvează doar calea relativă
          serviceData.images[i].url = `/uploads/${filename}`;
          console.log(`✅ Imagine serviciu salvată: /uploads/${filename}`);
        }
      }
    }

    // ========== GENEREAZĂ SLUG AUTOMAT ==========
    function slugify(text) {
      if (!text) return '';
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[șȘ]/g, 's')
        .replace(/[țȚ]/g, 't')
        .replace(/[ăĂ]/g, 'a')
        .replace(/[îÎ]/g, 'i')
        .replace(/[âÂ]/g, 'a')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    // Verifică dacă slug-ul lipsește sau e gol
    if (!serviceData.slug || serviceData.slug === '') {
      // Convertește brand-ul la ObjectId dacă e string
      const brandId = mongoose.Types.ObjectId.isValid(serviceData.brand)
        ? serviceData.brand
        : serviceData.brand;

      const brand = await Brand.findById(brandId);

      if (brand) {
        const brandSlug = brand.slug || slugify(brand.name);
        const serviceSlug = slugify(serviceData.name);
        serviceData.slug = `${brandSlug}/${serviceSlug}`;
        serviceData.brandSlug = brandSlug;
        console.log(`✅ Slug generat: ${serviceData.slug}`);
      } else {
        console.log(`❌ Brand negăsit pentru ID: ${serviceData.brand}`);
        // Fallback
        const serviceSlug = slugify(serviceData.name);
        serviceData.slug = `general/${serviceSlug}`;
        serviceData.brandSlug = 'general';
      }
    }

    // CREEAZĂ SERVICIUL
    console.log('💾 Salvez în MongoDB...');
    const service = await Service.create(serviceData);
    console.log(`✅ Serviciu creat: ${service._id}`);

    // POPULEAZĂ ȘI RETURNEAZĂ
    const populatedService = await Service.findById(service._id)
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon');

    res.status(201).json({
      message: 'Serviciu creat cu succes',
      service: populatedService
    });

  } catch (err) {
    console.error('❌ CREATE SERVICE ERROR:', err.message);
    console.error('Stack:', err.stack);

    if (err.name === 'ValidationError') {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ error: 'Eroare de validare', details: errors });
    }

    if (err.code === 11000) {
      return res.status(400).json({ error: 'Există deja un serviciu cu acest cod' });
    }

    res.status(400).json({
      error: err.message || 'Eroare necunoscută la salvare',
      type: err.name
    });
  }
});

// UPDATE service - CU CONVERSIE URL-URI IMAGINI
router.put('/services/:id', async (req, res) => {
  console.log('🔄 UPDATE SERVICE REQUEST');
  console.log('📦 Date primite:', req.body);

  try {
    const serviceData = req.body;
    const serviceId = req.params.id;

    // VALIDĂRI DE BAZĂ
    if (!serviceData.name) return res.status(400).json({ error: 'Numele este obligatoriu' });
    if (!serviceData.brand) return res.status(400).json({ error: 'Brandul este obligatoriu' });
    if (!serviceData.serviceType) return res.status(400).json({ error: 'Tipul serviciului este obligatoriu' });

    // VALIDARE PREȚURI
    if (serviceData.repairPriceType === 'fixed') {
      if (!serviceData.repairPrice && serviceData.repairPrice !== 0) {
        return res.status(400).json({ error: 'Pentru preț fix, prețul reparației este obligatoriu' });
      }
    } else if (serviceData.repairPriceType === 'from') {
      if (!serviceData.repairPriceFrom && serviceData.repairPriceFrom !== 0) {
        return res.status(400).json({ error: 'Pentru preț "de la", prețul minim al reparației este obligatoriu' });
      }
    }

    if (!serviceData.testPrice && serviceData.testPrice !== 0) {
      return res.status(400).json({ error: 'Prețul testării este obligatoriu' });
    }

    if (!serviceData.compatibleModels || serviceData.compatibleModels.length === 0) {
      return res.status(400).json({ error: 'Adaugă cel puțin un model compatibil' });
    }

    for (const [index, model] of serviceData.compatibleModels.entries()) {
      if (!model.modelName) return res.status(400).json({ error: `Modelul #${index + 1} nu are nume` });
      if (!model.yearFrom) return res.status(400).json({ error: `Modelul "${model.modelName}" nu are anul "de la"` });
      if (!model.yearTo) return res.status(400).json({ error: `Modelul "${model.modelName}" nu are anul "până la"` });

      const yearFrom = Number(model.yearFrom);
      const yearTo = Number(model.yearTo);

      if (isNaN(yearFrom) || isNaN(yearTo)) {
        return res.status(400).json({ error: `Modelul "${model.modelName}" are ani invalizi` });
      }

      if (yearFrom > yearTo) {
        return res.status(400).json({
          error: `Modelul "${model.modelName}": anul "de la" (${yearFrom}) trebuie să fie <= "până la" (${yearTo})`
        });
      }
    }

    serviceData.testPrice = Number(serviceData.testPrice);
    if (isNaN(serviceData.testPrice)) {
      return res.status(400).json({ error: 'Prețul testării trebuie să fie un număr' });
    }

    if (serviceData.repairPriceType === 'fixed') {
      serviceData.repairPrice = Number(serviceData.repairPrice);
      if (isNaN(serviceData.repairPrice)) {
        return res.status(400).json({ error: 'Prețul reparației trebuie să fie un număr' });
      }
      serviceData.repairPriceFrom = null;
    } else if (serviceData.repairPriceType === 'from') {
      serviceData.repairPriceFrom = Number(serviceData.repairPriceFrom);
      if (isNaN(serviceData.repairPriceFrom)) {
        return res.status(400).json({ error: 'Prețul minim al reparației trebuie să fie un număr' });
      }
      serviceData.repairPrice = null;
    }

    if (serviceData.compatibleModels) {
      serviceData.compatibleModels = serviceData.compatibleModels.map(model => ({
        modelName: model.modelName,
        modelCode: model.modelCode || '',
        yearFrom: Number(model.yearFrom),
        yearTo: Number(model.yearTo),
        engineCodes: Array.isArray(model.engineCodes)
          ? model.engineCodes
          : (model.engineCodes ? model.engineCodes.split(',').map(c => c.trim()).filter(c => c) : []),
        notes: model.notes || ''
      }));
    }

    // ========== CONVERSIE URL-URI IMAGINI LA UPDATE ==========
    if (serviceData.images && Array.isArray(serviceData.images)) {
      for (let i = 0; i < serviceData.images.length; i++) {
        if (serviceData.images[i].url) {
          const filename = serviceData.images[i].url.split('/').pop();
          serviceData.images[i].url = `/uploads/${filename}`;
          console.log(`✅ Imagine serviciu actualizată: /uploads/${filename}`);
        }
      }
    }

    const service = await Service.findByIdAndUpdate(
      serviceId,
      serviceData,
      { new: true, runValidators: true }
    )
      .populate('brand', 'name logo')
      .populate('serviceType', 'name icon');

    if (!service) {
      return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    }

    console.log(`✅ Serviciu actualizat: ${service._id}`);

    res.json({
      message: 'Serviciu actualizat cu succes',
      service
    });

  } catch (err) {
    console.error('❌ UPDATE SERVICE ERROR:', err.message);
    console.error('Stack:', err.stack);
    res.status(400).json({ error: err.message });
  }
});

// DELETE service
router.delete('/services/:id', async (req, res) => {
  console.log('🗑️ DELETE service:', req.params.id);

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalid' });
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    }

    console.log(`✅ Serviciu șters: ${service.name}`);

    res.json({
      message: 'Serviciu șters cu succes',
      serviceId: service._id
    });

  } catch (err) {
    console.error('❌ Eroare la ștergere:', err);
    res.status(500).json({ error: err.message });
  }
});


// ========== SERVICE REQUESTS ==========
router.post('/service-requests', async (req, res) => {
  try {
    // Salvează în DB
    const serviceRequest = await ServiceRequest.create(req.body);

    // Returnează răspuns
    res.status(201).json({
      success: true,
      requestNumber: serviceRequest._id,
      message: 'Cerere salvată'
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ========== UPDATE SERVICE REQUEST STATUS ==========
router.patch('/service-requests/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = ['new', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status invalid' });
    }

    const updateData = { status };
    if (notes) {
      updateData.contactNotes = notes;
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('service.serviceId', 'name')
      .populate('vehicle.brand', 'name');

    if (!request) {
      return res.status(404).json({ error: 'Cererea nu a fost găsită' });
    }

    res.json({
      message: `Status actualizat la: ${request.statusRomanian}`,
      request
    });

  } catch (err) {
    console.error('Eroare update status:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== SERVICE REQUESTS (ADMIN) ==========

// GET all service requests (cu filtrare avansată pentru admin)
// GET all service requests (FĂRĂ LIMITĂ)
router.get('/service-requests', async (req, res) => {
  try {
    const {
      status = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;

    let query = {};

    // Filtre
    if (status) {
      query.status = status;
    }

    // Filtrare după dată
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Căutare
    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'vehicle.model': { $regex: search, $options: 'i' } },
        { 'service.serviceName': { $regex: search, $options: 'i' } }
      ];
    }

    const requests = await ServiceRequest.find(query)
      .populate('service.serviceId', 'name code')
      .populate('vehicle.brand', 'name')
      .sort({ createdAt: -1 });

    // Statistici
    const stats = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      requests,
      total: requests.length,
      stats: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });

  } catch (err) {
    console.error('Eroare service requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single request (admin view)
router.get('/service-requests/:id', async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('service.serviceId', 'name code repairPrice duration')
      .populate('vehicle.brand', 'name')
      .populate('assignedTo', 'name email');

    if (!request) {
      return res.status(404).json({ error: 'Cererea nu a fost găsită' });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE request status
router.patch('/service-requests/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = ['new', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status invalid' });
    }

    const updateData = { status };
    if (notes) {
      updateData.contactNotes = notes;
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('service.serviceId', 'name')
      .populate('vehicle.brand', 'name');

    if (!request) {
      return res.status(404).json({ error: 'Cererea nu a fost găsită' });
    }

    res.json({
      message: `Status actualizat la: ${request.statusRomanian}`,
      request
    });

  } catch (err) {
    console.error('Eroare update status:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== CRUD PENTRU GALERIE ==========

// GET toate imaginile din galerie
router.get('/gallery', async (req, res) => {
  try {
    // Verifică dacă modelul Gallery există, dacă nu, returnează array gol
    let Gallery;
    try {
      Gallery = require('../models/Gallery');
    } catch (err) {
      console.log('⚠️ Modelul Gallery nu există încă, returnez array gol');
      return res.json([]);
    }

    const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error('Eroare la încărcarea galeriei:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST imagine nouă în galerie
// POST imagine nouă în galerie
router.post('/gallery', async (req, res) => {
  console.log('🚀 CREATE GALLERY IMAGE REQUEST');

  try {
    // Verifică dacă modelul Gallery există
    let Gallery;
    try {
      Gallery = require('../models/Gallery');
    } catch (err) {
      return res.status(500).json({ error: 'Modelul Gallery nu este definit' });
    }

    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Nu s-au primit imagini' });
    }

    const savedImages = [];

    for (const img of images) {
      // Validează URL-ul imaginii
      if (!img.url) {
        return res.status(400).json({ error: 'URL-ul imaginii este obligatoriu' });
      }

      // 🔥 NOU: Convertește URL-ul complet în cale relativă
      let cleanUrl = img.url;

      // Dacă e URL de pe Vercel
      if (cleanUrl.includes('vercel-storage.com')) {
        const filename = cleanUrl.split('/').pop();
        cleanUrl = `/uploads/${filename}`;
        console.log(`   🔄 Convertit URL Vercel: ${cleanUrl}`);
      }
      // Dacă e URL cu localhost
      else if (cleanUrl.includes('localhost:5000') || cleanUrl.includes('127.0.0.1:5000')) {
        const match = cleanUrl.match(/\/uploads\/(.+)$/);
        if (match) {
          cleanUrl = `/uploads/${match[1]}`;
          console.log(`   🔄 Convertit URL localhost: ${cleanUrl}`);
        }
      }
      // Dacă e deja cale relativă, păstreaz-o
      else if (cleanUrl.startsWith('/uploads/')) {
        // Deja e corect
        console.log(`   ✅ URL deja corect: ${cleanUrl}`);
      }
      // Altfel, încearcă să adauge /uploads/ dacă e doar nume de fișier
      else if (!cleanUrl.startsWith('http')) {
        cleanUrl = `/uploads/${cleanUrl}`;
        console.log(`   🔄 Adăugat prefix /uploads/: ${cleanUrl}`);
      }

      // Creează intrarea în galerie
      const galleryImage = new Gallery({
        url: cleanUrl,  // ← Acum salvează calea curată
        alt: img.alt || 'Galerie imagine',
        order: img.order || 0
      });

      await galleryImage.save();
      savedImages.push(galleryImage);
    }

    console.log(`✅ ${savedImages.length} imagini salvate în galerie`);
    res.status(201).json(savedImages);

  } catch (err) {
    console.error('❌ CREATE GALLERY ERROR:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// PUT actualizare imagine din galerie
router.put('/gallery/:id', async (req, res) => {
  try {
    let Gallery;
    try {
      Gallery = require('../models/Gallery');
    } catch (err) {
      return res.status(500).json({ error: 'Modelul Gallery nu este definit' });
    }

    const { alt, order } = req.body;
    const updateData = {};

    if (alt !== undefined) updateData.alt = alt;
    if (order !== undefined) updateData.order = order;

    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({ error: 'Imaginea nu a fost găsită' });
    }

    res.json({
      message: 'Imagine actualizată cu succes',
      image
    });

  } catch (err) {
    console.error('Eroare update imagine:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE șterge imagine din galerie
router.delete('/gallery/:id', async (req, res) => {
  try {
    let Gallery;
    try {
      Gallery = require('../models/Gallery');
    } catch (err) {
      return res.status(500).json({ error: 'Modelul Gallery nu este definit' });
    }

    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Imaginea nu a fost găsită' });
    }

    // Șterge intrarea din baza de date
    await image.deleteOne();

    res.json({
      message: 'Imagine ștearsă cu succes',
      imageId: image._id
    });

  } catch (err) {
    console.error('Eroare ștergere imagine:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST reordonare imagini
router.post('/gallery/reorder', async (req, res) => {
  try {
    let Gallery;
    try {
      Gallery = require('../models/Gallery');
    } catch (err) {
      return res.status(500).json({ error: 'Modelul Gallery nu este definit' });
    }

    const { images } = req.body; // array de { id, order }

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Date invalide pentru reordonare' });
    }

    // Actualizează fiecare imagine
    for (const item of images) {
      await Gallery.findByIdAndUpdate(item.id, { order: item.order });
    }

    res.json({
      message: 'Ordine actualizată cu succes',
      count: images.length
    });

  } catch (err) {
    console.error('Eroare reordonare:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== SHIPPING REQUESTS (EXPEDIERI) ==========

// GET toate cererile de expediere
// GET toate cererile de expediere (FĂRĂ LIMITĂ)
router.get('/shipping-requests', async (req, res) => {
  console.log('📦 GET shipping requests');

  try {
    const {
      status = '',
      search = ''
    } = req.query;

    let query = {};

    // Filtrare după status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Căutare
    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'trackingNumber': { $regex: search, $options: 'i' } },
        { 'serviceName': { $regex: search, $options: 'i' } }
      ];
    }

    // Verifică dacă modelul ShippingRequest există
    let ShippingRequest;
    try {
      ShippingRequest = require('../models/ShippingRequest');
    } catch (err) {
      console.log('⚠️ Modelul ShippingRequest nu există încă, returnez array gol');
      return res.json({
        requests: [],
        total: 0,
        stats: { pending: 0, received: 0, returned: 0 }
      });
    }

    const requests = await ShippingRequest.find(query)
      .sort({ createdAt: -1 });

    // Statistici
    const stats = await ShippingRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = {
      pending: 0,
      received: 0,
      in_repair: 0,
      returned: 0,
      cancelled: 0
    };

    stats.forEach(item => {
      statsObj[item._id] = item.count;
    });

    res.json({
      requests,
      total: requests.length,
      stats: statsObj
    });

  } catch (err) {
    console.error('❌ Eroare la încărcarea expedierilor:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET o singură expediere
router.get('/shipping-requests/:id', async (req, res) => {
  try {
    let ShippingRequest;
    try {
      ShippingRequest = require('../models/ShippingRequest');
    } catch (err) {
      return res.status(500).json({ error: 'Modelul ShippingRequest nu este definit' });
    }

    const request = await ShippingRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Expedierea nu a fost găsită' });
    }

    res.json(request);

  } catch (err) {
    console.error('❌ Eroare la preluarea expedierii:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST crează o nouă cerere de expediere (din frontend)
router.post('/shipping-requests', async (req, res) => {
  console.log('📦 CREATE shipping request');

  try {
    const shippingData = req.body;

    // Validări de bază
    if (!shippingData.customer?.name || !shippingData.customer?.phone || !shippingData.customer?.address) {
      return res.status(400).json({ error: 'Numele, telefonul și adresa sunt obligatorii' });
    }

    if (!shippingData.trackingNumber) {
      // Generează un număr de tracking dacă nu există
      const prefix = 'DER';
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      shippingData.trackingNumber = `${prefix}-${timestamp}-${random}`;
    }

    // Setează statusul inițial
    shippingData.status = shippingData.status || 'pending';

    // Verifică dacă modelul ShippingRequest există
    let ShippingRequest;
    try {
      ShippingRequest = require('../models/ShippingRequest');
    } catch (err) {
      console.log('⚠️ Modelul ShippingRequest nu există, nu pot salva');
      return res.status(201).json({
        message: 'Cerere procesată (fără salvare în DB)',
        trackingNumber: shippingData.trackingNumber
      });
    }

    // Salvează în baza de date
    const shippingRequest = await ShippingRequest.create(shippingData);

    console.log(`✅ Shipping request salvat: ${shippingRequest._id} - ${shippingRequest.trackingNumber}`);

    res.status(201).json({
      message: 'Cerere de expediere salvată cu succes',
      trackingNumber: shippingRequest.trackingNumber,
      id: shippingRequest._id
    });

  } catch (err) {
    console.error('❌ Eroare la salvarea expedierii:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT actualizează statusul unei expedieri
router.put('/shipping-requests/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'received', 'in_repair', 'returned', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status invalid' });
    }

    let ShippingRequest;
    try {
      ShippingRequest = require('../models/ShippingRequest');
    } catch (err) {
      return res.status(500).json({ error: 'Modelul ShippingRequest nu este definit' });
    }

    const updateData = { status };
    if (notes) {
      updateData.adminNotes = notes;
    }

    const request = await ShippingRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Expedierea nu a fost găsită' });
    }

    res.json({
      message: `Status actualizat la: ${status}`,
      request
    });

  } catch (err) {
    console.error('❌ Eroare la actualizarea statusului:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE șterge o expediere (doar admin)
router.delete('/shipping-requests/:id', async (req, res) => {
  try {
    let ShippingRequest;
    try {
      ShippingRequest = require('../models/ShippingRequest');
    } catch (err) {
      return res.status(500).json({ error: 'Modelul ShippingRequest nu este definit' });
    }

    const request = await ShippingRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Expedierea nu a fost găsită' });
    }

    res.json({
      message: 'Expediere ștearsă cu succes',
      id: request._id
    });

  } catch (err) {
    console.error('❌ Eroare la ștergerea expedierii:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET statistici expedieri (pentru dashboard)
router.get('/shipping-requests/stats/summary', async (req, res) => {
  try {
    let ShippingRequest;
    try {
      ShippingRequest = require('../models/ShippingRequest');
    } catch (err) {
      return res.json({
        pending: 0,
        received: 0,
        in_repair: 0,
        returned: 0,
        cancelled: 0,
        total: 0
      });
    }

    const stats = await ShippingRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await ShippingRequest.countDocuments();

    const result = {
      pending: 0,
      received: 0,
      in_repair: 0,
      returned: 0,
      cancelled: 0,
      total
    };

    stats.forEach(item => {
      result[item._id] = item.count;
    });

    res.json(result);

  } catch (err) {
    console.error('❌ Eroare la statistici expedieri:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== ANUNȚURI ==========

// GET - Obține anunțul pentru admin (fără autentificare, doar pentru admin panel)
router.get('/announcement', async (req, res) => {
  try {
    const announcement = await Announcement.findOne();
    res.json(announcement || { isActive: false, title: '', message: '', type: 'info', expiresAt: null });
  } catch (err) {
    console.error('Eroare la obținerea anunțului:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Salvează anunțul (fără autentificare)
router.post('/announcement', async (req, res) => {
  console.log('📢 Salvare anunț:', req.body);

  try {
    const { isActive, title, message, type, expiresAt } = req.body;

    let announcement = await Announcement.findOne();

    if (announcement) {
      announcement.isActive = isActive || false;
      announcement.title = title || '';
      announcement.message = message || '';
      announcement.type = type || 'info';
      announcement.expiresAt = expiresAt || null;
      await announcement.save();
      console.log('✅ Anunț actualizat');
    } else {
      announcement = await Announcement.create({
        isActive: isActive || false,
        title: title || '',
        message: message || '',
        type: type || 'info',
        expiresAt: expiresAt || null
      });
      console.log('✅ Anunț creat');
    }

    res.json({ message: 'Anunț salvat cu succes', announcement });
  } catch (err) {
    console.error('❌ Eroare la salvarea anunțului:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Șterge anunțul (fără autentificare)
router.delete('/announcement', async (req, res) => {
  console.log('🗑️ Ștergere anunț');

  try {
    await Announcement.deleteMany({});
    res.json({ message: 'Anunț șters cu succes' });
  } catch (err) {
    console.error('❌ Eroare la ștergerea anunțului:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
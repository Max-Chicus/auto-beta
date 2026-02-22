const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Service = require('../models/Service');
const ServiceType = require('../models/ServiceType');
const ServiceRequest = require('../models/ServiceRequest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

console.log('✅ Admin routes loaded');

// ========== LOGIN ADMIN ==========
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('🔐 Admin login attempt:', username);

  // Pentru demo, acceptă admin/admin123
  if (username === 'vasile' && password === 'Busuioc2026!') {
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

    // 🔥 IMPORTANT: Folosește direct URL-ul primit de la Vercel Blob
    const brandData = {
      name,
      logo: logo || null  // logo este deja URL-ul complet de la Vercel
    };

    // Creează brandul
    const brand = await Brand.create(brandData);

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
router.get('/services', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', brand = '', serviceType = '', featured = '' } = req.query;
    const skip = (page - 1) * limit;
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

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('brand', 'name logo')
        .populate('serviceType', 'name icon')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Service.countDocuments(query)
    ]);

    res.json({ services, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
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

// CREATE service - VERSIUNE SIMPLIFICATĂ (FĂRĂ PROCESARE IMAGINI)
router.post('/services', async (req, res) => {
  console.log('🚀 CREATE SERVICE REQUEST');

  try {
    const serviceData = req.body;

    // VALIDĂRI
    if (!serviceData.name) return res.status(400).json({ error: 'Numele este obligatoriu' });
    if (!serviceData.brand) return res.status(400).json({ error: 'Brandul este obligatoriu' });
    if (!serviceData.serviceType) return res.status(400).json({ error: 'Tipul serviciului este obligatoriu' });
    if (!serviceData.repairPrice) return res.status(400).json({ error: 'Prețul este obligatoriu' });
    if (!serviceData.compatibleModels || serviceData.compatibleModels.length === 0) {
      return res.status(400).json({ error: 'Adaugă cel puțin un model compatibil' });
    }

    // VALIDARE MODELE - fă-o aici, nu în middleware
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

    // CONVERTEȘTE PREȚUL
    serviceData.repairPrice = Number(serviceData.repairPrice);
    if (isNaN(serviceData.repairPrice)) {
      return res.status(400).json({ error: 'Prețul trebuie să fie un număr' });
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

    // 🔥 AM ȘTERS TOT BLOCUL DE PROCESARE IMAGINI 🔥
    // Acum imaginile vin direct ca URL-uri de la Vercel Blob

    // ADAUGĂ CÂMPURI DEFAULT
    if (!serviceData.isActive) serviceData.isActive = true;
    if (!serviceData.popularity) serviceData.popularity = 0;
    if (!serviceData.currency) serviceData.currency = 'EUR';
    if (!serviceData.duration) serviceData.duration = '2-3 zile lucrătoare';
    if (!serviceData.warranty) serviceData.warranty = '12 luni';

    // VALIDARE IMAGINI înainte de salvare
    if (serviceData.images && Array.isArray(serviceData.images)) {
      for (let i = 0; i < serviceData.images.length; i++) {
        if (!serviceData.images[i].url) {
          return res.status(400).json({ error: `Imaginea ${i + 1} nu are URL` });
        }
      }
    }

    // CREEAZĂ SERVICIUL
    console.log('💾 Salvez în MongoDB...');
    const service = await Service.create(serviceData);
    console.log(`✅ Serviciu creat: ${service._id}`);

    // POPULEAZĂ ȘI RETURNEAZĂ
    const populatedService = await Service.findById(service._id)
      .populate('brand', 'name')
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

// UPDATE service - VERSIUNE SIMPLIFICATĂ (FĂRĂ PROCESARE IMAGINI)
router.put('/services/:id', async (req, res) => {
  try {
    const serviceData = req.body;

    // 🔥 AM ȘTERS TOT BLOCUL DE PROCESARE IMAGINI DE AICI 🔥
    // Acum imaginile vin direct ca URL-uri de la Vercel Blob

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      serviceData,
      { new: true, runValidators: true }
    )
      .populate('brand', 'name')
      .populate('serviceType', 'name icon');

    if (!service) {
      return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    }

    res.json({
      message: 'Serviciu actualizat cu succes',
      service
    });
  } catch (err) {
    console.error('Eroare update service:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE service
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    }

    res.json({
      message: 'Serviciu dezactivat cu succes',
      serviceId: service._id
    });
  } catch (err) {
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
router.get('/service-requests', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;

    const skip = (page - 1) * limit;
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

    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate('service.serviceId', 'name code')
        .populate('vehicle.brand', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ServiceRequest.countDocuments(query)
    ]);

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
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
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

      // Creează intrarea în galerie
      const galleryImage = new Gallery({
        url: img.url,
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

module.exports = router;
const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');
const Brand = require('../models/Brand');

// ✅ FORMULAR PUBLIC - trimite cerere de serviciu
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      vehicle,
      serviceId,  // ← Poate fi undefined
      issueDescription,
      symptoms = [],
      errorCodes = [],
      preferredContactTime
    } = req.body;

    // Validări de bază
    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Numele și telefonul sunt obligatorii' 
      });
    }

    if (!vehicle?.brand || !vehicle?.model || !vehicle?.year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Brand, model și anul mașinii sunt obligatorii' 
      });
    }

    // Verifică dacă serviciul există (doar dacă serviceId este furnizat și nu e gol)
    let service = null;
    if (serviceId && serviceId.trim() !== '') {
      service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ 
          success: false, 
          message: 'Serviciul selectat nu a fost găsit' 
        });
      }
    }

    // Verifică dacă brandul există
    const brand = await Brand.findById(vehicle.brand);
    if (!brand) {
      return res.status(404).json({ 
        success: false, 
        message: 'Marca selectată nu a fost găsită' 
      });
    }

    // Creează cererea
    const serviceRequestData = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || '',
        city: customer.city?.trim() || ''
      },
      vehicle: {
        brand: vehicle.brand,
        brandName: brand.name,
        model: vehicle.model.trim(),
        year: parseInt(vehicle.year),
        vin: vehicle.vin?.trim() || '',
        registration: vehicle.registration?.trim() || '',
        notes: vehicle.notes?.trim() || ''
      },
      issueDescription: issueDescription?.trim() || '',  // Poate fi gol
      symptoms: Array.isArray(symptoms) ? symptoms.filter(s => s.trim() !== '') : [],
      errorCodes: Array.isArray(errorCodes) ? errorCodes.filter(c => c.trim() !== '') : [],
      preferredContactTime: preferredContactTime?.trim() || '',
      source: 'website'
    };

    // Adaugă datele serviciului doar dacă există
    if (service) {
      serviceRequestData.service = {
        serviceId: service._id,
        serviceName: service.name
      };
    }

    const serviceRequest = await ServiceRequest.create(serviceRequestData);

    res.status(201).json({
      success: true,
      message: 'Cererea a fost trimisă cu succes! Vă vom contacta în cel mai scurt timp.',
      requestId: serviceRequest._id,
      requestNumber: `SR-${serviceRequest._id.toString().slice(-6).toUpperCase()}`
    });

  } catch (err) {
    console.error('Eroare la trimiterea cererii:', err);
    res.status(500).json({ 
      success: false, 
      message: 'A apărut o eroare. Vă rugăm încercați din nou.' 
    });
  }
});

// ✅ ADMIN - GET all service requests
router.get('/admin', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = '',
      dateFrom = '',
      dateTo = ''
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
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADMIN - GET single request
router.get('/admin/:id', async (req, res) => {
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

// ✅ ADMIN - Update request status
router.patch('/admin/:id/status', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUBLIC - Verify request status (pentru client)
router.get('/status/:id', async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .select('status createdAt service.serviceName vehicle.brandName vehicle.model vehicle.year')
      .lean();

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cererea nu a fost găsită' 
      });
    }

    // Nu returnăm date personale pentru securitate
    res.json({
      success: true,
      requestNumber: `SR-${request._id.toString().slice(-6).toUpperCase()}`,
      status: request.status,
      statusRomanian: request.statusRomanian,
      createdAt: request.createdAt,
      service: request.service?.serviceName || 'Nespecificat',
      vehicle: `${request.vehicle.brandName} ${request.vehicle.model} (${request.vehicle.year})`
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la verificarea statusului' 
    });
  }
});

module.exports = router;
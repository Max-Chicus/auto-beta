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

    // 🔥 CHEIE: Ia TOATE serviciile care îndeplinesc condițiile
    let allServices = await Service.find(query)
      .populate('brand', 'name logo slug')
      .populate('serviceType', 'name icon')
      .sort({ featured: -1, popularity: -1, name: 1 })
      .lean();

    console.log('📊 Total servicii înainte de filtrare model:', allServices.length);

    // 🔥 FILTRARE MODEL (pe TOATE serviciile)
    if (model && model.trim() !== '') {
      console.log('🎯 FILTREZ DUPA MODEL:', model);
      const modelSearch = model.toLowerCase().trim();

      allServices = allServices.filter(service => {
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
      console.log('📊 Servicii după filtrare model:', allServices.length);
    }

    // FILTRU pentru model + an
    if (model && year) {
      console.log('🎯 FILTREZ DUPA MODEL + AN:', model, year);
      const modelSearch = model.toLowerCase().trim();
      const yearNum = parseInt(year);

      allServices = allServices.filter(service => {
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
      console.log('📊 Servicii după filtrare model+an:', allServices.length);
    }

    // 🔥 ACUM aplică paginăția pe rezultatele deja filtrate
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalAfterModelFilter = allServices.length;
    const totalPages = Math.ceil(totalAfterModelFilter / limitNum);

    // Aplică paginăția
    const paginatedServices = allServices.slice(skip, skip + limitNum);

    console.log(`📄 Pagina ${pageNum} din ${totalPages} (${totalAfterModelFilter} total servicii, afișate ${paginatedServices.length})`);

    // Răspuns cu paginăție
    res.json({
      services: paginatedServices,
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
      .populate('brand', 'name logo slug')
      .populate('serviceType', 'name icon')
      .sort({ createdAt: -1 })
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
      .populate('brand', 'name logo slug')
      .populate('serviceType', 'name icon')
      .sort({ serviceType: 1, name: 1 });

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

// GET service by slug (brand-slug/service-slug)
router.get('/slug/:brandSlug/:serviceSlug', async (req, res) => {
  try {
    const { brandSlug, serviceSlug } = req.params;
    const fullSlug = `${brandSlug}/${serviceSlug}`;

    const service = await Service.findOne({ slug: fullSlug })
      .populate('brand', 'name logo slug')
      .populate('serviceType', 'name icon');

    if (!service) {
      return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    }

    service.popularity += 1;
    await service.save();

    res.json(service);
  } catch (err) {
    console.error('Eroare la căutarea serviciului după slug:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET sitemap.xml (generate XML)
router.get('/all-slugs/sitemap', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }, 'slug brandSlug updatedAt').lean();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.derstronik.md/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/request-service</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.derstronik.md/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    for (const service of services) {
      if (service.slug && service.brandSlug) {
        const slugPart = service.slug.split('/').pop();
        sitemap += `
  <url>
    <loc>https://www.derstronik.md/servicii/${service.brandSlug}/${slugPart}</loc>
    <lastmod>${service.updatedAt ? service.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    sitemap += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET service by ID - TREBUIE SĂ FIE ULTIMA RUTĂ
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('brand', 'name logo slug')
      .populate('serviceType', 'name icon');

    if (!service) {
      return res.status(404).json({ error: 'Serviciul nu a fost găsit' });
    }

    service.popularity += 1;
    await service.save();

    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
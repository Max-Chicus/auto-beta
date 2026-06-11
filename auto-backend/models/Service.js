const mongoose = require('mongoose');

// Subschema pentru modele compatibile (FĂRĂ slug aici)
const CompatibleModelSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  modelCode: {
    type: String,
    trim: true
  },
  generation: {
    type: String,
    trim: true
  },
  yearFrom: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  yearTo: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  engineCodes: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema pentru imagini
const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  size: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Schema principală Service
const ServiceSchema = new mongoose.Schema({
  // Identificare
  name: {
    type: String,
    required: true,
    trim: true
  },

  // 🔥 SLUG-URI - MUTATE AICI (în schema principală) 🔥
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  brandSlug: {
    type: String,
    trim: true
  },

  // Categorizare
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  serviceType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceType',
    required: true
  },

  // Compatibilitate
  compatibleModels: [CompatibleModelSchema],

  // Detalii serviciu
  commonFaults: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },

  // Tip preț pentru reparație: 'fixed' sau 'from'
  repairPriceType: {
    type: String,
    enum: ['fixed', 'from'],
    default: 'fixed'
  },
  // Preț reparație fix
  repairPrice: {
    type: Number,
    min: 0,
    default: null
  },
  // Preț reparație "de la" (minim)
  repairPriceFrom: {
    type: Number,
    min: 0,
    default: null
  },

  // Preț testare - mereu fix
  testPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'MDL', 'USD']
  },
  duration: {
    type: String,
    default: '2-3 zile lucrătoare',
    trim: true
  },
  warranty: {
    type: String,
    default: '12 luni',
    trim: true
  },

  // Media
  images: [ImageSchema],
  diagramImage: {
    type: String,
    trim: true
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pentru căutare rapidă
ServiceSchema.index({ name: 'text', 'compatibleModels.modelName': 'text' });
ServiceSchema.index({ brand: 1 });
ServiceSchema.index({ serviceType: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ slug: 1 });

// Virtual pentru numele brandului
ServiceSchema.virtual('brandName', {
  ref: 'Brand',
  localField: 'brand',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name' }
});

// Virtual pentru numele tipului serviciului
ServiceSchema.virtual('serviceTypeName', {
  ref: 'ServiceType',
  localField: 'serviceType',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name icon' }
});

module.exports = mongoose.model('Service', ServiceSchema);
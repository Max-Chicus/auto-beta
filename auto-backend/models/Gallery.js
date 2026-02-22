// models/Gallery.js
const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'URL-ul imaginii este obligatoriu']
  },
  alt: {
    type: String,
    default: 'Galerie imagine',
    trim: true
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adaugă automat createdAt și updatedAt
});

// Index pentru sortare rapidă
galleryImageSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('Gallery', galleryImageSchema);
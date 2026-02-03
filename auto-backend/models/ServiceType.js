const mongoose = require('mongoose');

const ServiceTypeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  description: { 
    type: String, 
    default: '' 
  },
  icon: { 
    type: String, 
    default: '⚙️' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceType', ServiceTypeSchema);
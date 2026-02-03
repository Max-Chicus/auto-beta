const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    city: { type: String, default: '' }
  },
  vehicle: {
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    brandName: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vin: { type: String, default: '' },
    registration: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  service: {
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Service',
      required: false // SCHIMBĂ DIN true ÎN false
    },
    serviceName: { type: String, default: '' }
  },
  issueDescription: { 
    type: String, 
    required: false, // SCHIMBĂ DIN true ÎN false
    default: '' 
  },
  symptoms: [{ type: String }],
  errorCodes: [{ type: String }],
  preferredContactTime: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'new'
  },
  source: { type: String, default: 'website' },
  contactNotes: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Virtual pentru status în română
serviceRequestSchema.virtual('statusRomanian').get(function() {
  const statusMap = {
    'new': 'Nouă',
    'contacted': 'Contactată',
    'scheduled': 'Programată',
    'in_progress': 'În lucru',
    'completed': 'Finalizată',
    'cancelled': 'Anulată'
  };
  return statusMap[this.status] || this.status;
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
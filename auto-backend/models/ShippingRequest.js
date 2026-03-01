const mongoose = require('mongoose');

const ShippingRequestSchema = new mongoose.Schema({
  // Număr de urmărire unic
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  // Date client
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },

  // Date colet
  package: {
    description: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: String,
      trim: true
    },
    dimensions: {
      type: String,
      trim: true
    },
    isFragile: {
      type: Boolean,
      default: true
    }
  },

  // Serviciu asociat
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  serviceName: {
    type: String,
    trim: true
  },

  // Status expediere
  status: {
    type: String,
    enum: ['pending', 'received', 'in_repair', 'returned', 'cancelled'],
    default: 'pending'
  },

  // Observații admin
  adminNotes: {
    type: String,
    trim: true
  },

  // Observații client
  notes: {
    type: String,
    trim: true
  },

  // Date return
  returnedAt: {
    type: Date
  },
  returnTrackingNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index pentru căutare
ShippingRequestSchema.index({ trackingNumber: 1 });
ShippingRequestSchema.index({ 'customer.name': 'text', 'customer.phone': 'text' });
ShippingRequestSchema.index({ status: 1 });
ShippingRequestSchema.index({ createdAt: -1 });

// Virtual pentru status în română
ShippingRequestSchema.virtual('statusRomanian').get(function() {
  const statusMap = {
    pending: 'În așteptare',
    received: 'Primit',
    in_repair: 'În reparație',
    returned: 'Returnat',
    cancelled: 'Anulat'
  };
  return statusMap[this.status] || this.status;
});

module.exports = mongoose.model('ShippingRequest', ShippingRequestSchema);
const mongoose = require('mongoose');

const EngineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true }
});

module.exports = mongoose.model('Engine', EngineSchema);

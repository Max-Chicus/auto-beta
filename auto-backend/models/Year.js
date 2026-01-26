const mongoose = require('mongoose');

const YearSchema = new mongoose.Schema({
  value: { type: Number, required: true }
});

module.exports = mongoose.model('Year', YearSchema);

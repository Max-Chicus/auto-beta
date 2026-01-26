const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },

  brand: { type: String, required: true },      // ⚠️ Schimbat ObjectId → String
  model: { type: String, required: true },      // ⚠️ Schimbat ObjectId → String
  engine: { type: String, required: true },     // ⚠️ Schimbat ObjectId → String
  year: { type: Number, required: true },
  category: { type: String, required: true }    // ⚠️ Schimbat ObjectId → String
});

module.exports = mongoose.model('Product', ProductSchema);

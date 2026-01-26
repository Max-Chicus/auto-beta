const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // sort alfabetică
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Eroare la server' });
  }
});

module.exports = router;

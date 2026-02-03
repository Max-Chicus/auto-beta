// routes/service-quote.js
const express = require('express');
const router = express.Router();

// Calcul preț estimativ (poate fi extins)
router.post('/estimate', async (req, res) => {
  try {
    const { brandId, model, year, serviceTypeId, symptoms } = req.body;
    
    // Logica de estimare (simplificată)
    // În realitate, poți avea algoritmi mai complecși
    
    const basePrice = 100; // Preț de bază
    let estimatedPrice = basePrice;
    
    // Factor de vechime
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - year;
    
    if (carAge > 15) estimatedPrice *= 1.2; // +20% pentru mașini vechi
    if (carAge > 25) estimatedPrice *= 1.3; // +30% pentru mașini foarte vechi
    
    // Factor complexitate bazat pe simptome
    const complexSymptoms = ['nu pornește', 'erori multiple', 'comunicare imposibilă'];
    const hasComplexIssue = symptoms?.some(s => 
      complexSymptoms.some(cs => s.toLowerCase().includes(cs))
    );
    
    if (hasComplexIssue) estimatedPrice *= 1.5;
    
    res.json({
      success: true,
      estimatedPrice: Math.round(estimatedPrice),
      currency: 'EUR',
      notes: [
        'Preț estimativ - prețul final poate varia',
        'Diagnosticul gratuit stabilește prețul exact',
        'Prețul include garanție 12-24 luni'
      ]
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
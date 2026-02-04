const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors());

// Debug middleware - arată toate requesturile
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 100000
}));

// ✅ SERVESTE FIȘIERELE STATICE CORECT
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '30d', // Cache pentru 30 de zile
  setHeaders: (res, filePath) => {
    // Setează headere pentru cache și securitate
    res.set('Cache-Control', 'public, max-age=2592000'); // 30 zile
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));

// Middleware pentru logging (opțional)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/services', require('./routes/services'));
app.use('/api/service-requests', require('./routes/service-requests'));
app.use('/api/service-quote', require('./routes/service-quote'));
app.use('/api/filters', require('./routes/filters'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/public', require('./routes/public'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
connectDB();

// CORS configurat pentru production + development
const corsOptions = {
  origin: ['https://auto-beta-front.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Middleware pentru body parsing (MARE IMPORTANȚĂ să fie înainte de rute!)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 100000
}));

// Debug middleware - DOAR O DATĂ
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ SERVESTE FIȘIERELE STATICE CORECT
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'public, max-age=2592000');
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));

// RUTA DE BAZĂ - pentru a evita "Not Found"
app.get('/', (req, res) => {
  res.json({
    message: 'Auto Beta Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      '/api/services',
      '/api/service-requests',
      '/api/service-quote',
      '/api/filters',
      '/api/admin',
      '/api/public',
      '/uploads'
    ]
  });
});

// RUTA API DE BAZĂ
app.get('/api', (req, res) => {
  res.json({
    message: 'Auto Beta API v1.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    mongo: 'connected'
  });
});

// RUTA DE TEST pentru CORS
app.get('/api/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    frontend: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString()
  });
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
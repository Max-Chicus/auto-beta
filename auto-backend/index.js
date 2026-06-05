const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const uploadRouter = require('./routes/upload');
require('dotenv').config();

const helmet = require('helmet');

const app = express();

// ========== HELMET - SECURITATE ==========
app.use(helmet());

// Configurare HSTS (forțează HTTPS)
app.use(helmet.hsts({
  maxAge: 15552000, // 180 de zile
  includeSubDomains: true,
  preload: true
}));

// Configurare CSP (Content Security Policy)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://via.placeholder.com", "https://ui-avatars.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://auto-beta.onrender.com"],
    },
  })
);

connectDB();

// ========== DETERMINĂ CALEA CORECTĂ PENTRU UPLOADS ==========
let uploadsDir;
if (process.env.RENDER) {
  // Pe Render: folosește calea persistentă a discului
  uploadsDir = '/opt/render/project/data/uploads';
  console.log('📡 Rulează pe Render, folosește disk persistent:', uploadsDir);
} else {
  // Pe Windows (local): folosește calea relativă
  uploadsDir = path.join(__dirname, 'uploads');
  console.log('💻 Rulează local, folosește folderul:', uploadsDir);
}

// Asigură-te că directorul uploads există
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Director uploads creat:', uploadsDir);
}

// ========== CORS CONFIGURAT COMPLET ==========
const allowedOrigins = [
  'http://localhost:5173',                    // Frontend local (Vite)
  'http://localhost:3000',                    // Frontend local (alternativ)
  'https://auto-beta-front.vercel.app',       // Frontend pe Vercel (vechi)
  'https://auto-beta.vercel.app',             // Frontend pe Vercel (alternativ)
  'https://derstronik.md',                    // Noul tău domeniu (fără www)
  'https://www.derstronik.md',                // Noul tău domeniu (cu www)
  'https://auto-beta.onrender.com'            // Backend-ul însuși (pentru teste)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite cereri fără origin (ex: Postman, aplicații mobile, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocat pentru originea:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware pentru body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 100000
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`  Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// ========== SERVEȘTE FIȘIERELE STATICE DIN CALEA CORECTĂ ==========
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'public, max-age=2592000');
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));

// Rutele de bază
app.get('/', (req, res) => {
  res.json({
    message: 'Auto Beta Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      '/services',
      '/service-requests',
      '/service-quote',
      '/filters',
      '/admin',
      '/public',
      '/uploads'
    ]
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Auto Beta API v1.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    mongo: 'connected'
  });
});

app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    frontend: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/services', require('./routes/services'));
app.use('/service-requests', require('./routes/service-requests'));
app.use('/service-quote', require('./routes/service-quote'));
app.use('/filters', require('./routes/filters'));
app.use('/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/admin'));
app.use('/public', require('./routes/public'));
app.use('/api/upload-image', uploadRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
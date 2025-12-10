// ============================================
// 🚀 QIANLUNSHOP BACKEND - Main Server
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
require('dotenv').config();

// ==========================================
// 🔧 App Configuration
// ==========================================
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==========================================
// 🗄️ Database Connection
// ==========================================
const connectDB = require('./config/db');
connectDB();

// ==========================================
// 🛡️ Security Middleware
// ==========================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now, configure later
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// ==========================================
// 📊 Middleware
// ==========================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==========================================
// 📍 Routes
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QianlunShop API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes (will be added)
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// ==========================================
// ❌ Error Handling
// ==========================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// ==========================================
// 🚀 Server Start
// ==========================================

const server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🐉 QianlunShop Backend Server       ║
  ║   ✅ Running on port ${PORT}              ║
  ║   🌍 Environment: ${NODE_ENV.padEnd(20)}║
  ║   🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'.padEnd(18)}║
  ╚════════════════════════════════════════╝
  `);
});

// ==========================================
// 🛑 Graceful Shutdown
// ==========================================

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close(false, () => {
      console.log('🗄️  MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    mongoose.connection.close(false, () => {
      console.log('🗄️  MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
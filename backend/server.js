const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectMongoDB = require('./config/mongodb');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to both databases
const initializeDatabases = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Test PostgreSQL connection
    await testConnection();
    
    console.log('✅ All databases connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Initialize databases
initializeDatabases();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'https://soft-elf-876a48.netlify.app', // Production URL
    'http://localhost:3000',               // Development URL
    'http://127.0.0.1:3000',              // Alternative localhost
    'http://localhost:3001',               // Alternative port
    process.env.Frontend_URL               // Environment variable
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Import routes
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Root route - redirect to frontend
app.get('/', (req, res) => {
  const frontendUrl = process.env.Frontend_URL || 'https://soft-elf-876a48.netlify.app';
  res.redirect(`${frontendUrl}`);
});

// API info route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Todo API with Authentication is running!',
    version: '1.0.0',
    databases: {
      mongodb: 'Connected (Users)',
      postgresql: 'Connected (Tasks)'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Catch-all handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /api',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/verify',
      'GET /api/tasks',
      'POST /api/tasks',
      'PUT /api/tasks/:id',
      'DELETE /api/tasks/:id'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.Frontend_URL || 'https://soft-elf-876a48.netlify.app'}`);
  console.log('🔗 CORS enabled for origins:', corsOptions.origin);
});

module.exports = app;
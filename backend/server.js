const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectMongoDB = require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectMongoDB();

// Single CORS configuration
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

// Apply CORS middleware once
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Import routes
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Root route - redirect to frontend login page
app.get('/', (req, res) => {
  // Redirect to your frontend login page
  const frontendUrl = process.env.Frontend_URL || 'https://soft-elf-876a48.netlify.app';
  res.redirect(`${frontendUrl}`);
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Todo API with Authentication is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for origins:', corsOptions.origin);
});

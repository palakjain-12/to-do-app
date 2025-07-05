// api/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connections
const connectMongoDB = require('../backend/config/mongodb');

// Create Express app
const app = express();

// Connect to MongoDB
connectMongoDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json());

// Import routes
const taskRoutes = require('../backend/routes/tasks');
const authRoutes = require('../backend/routes/auth');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Todo API with Authentication is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle all other routes
app.all('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export for Vercel serverless functions
module.exports = app;
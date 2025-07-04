// api/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connections
const connectMongoDB = require('../backend/config/mongodb');

const app = express();

// Connect to MongoDB
connectMongoDB();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for simplicity
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

// Export for Vercel
module.exports = app;
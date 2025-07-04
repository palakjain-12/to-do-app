const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connections
const connectMongoDB = require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectMongoDB();

// Middleware - Updated CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-vercel-app.vercel.app']
    : ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Import routes
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Todo API with Authentication is running!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    }
  });
}

// For Vercel deployment
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  - Auth: http://localhost:${PORT}/api/auth`);
    console.log(`  - Tasks: http://localhost:${PORT}/api/tasks`);
  });
}
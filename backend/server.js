const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectMongoDB = require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectMongoDB();

// Middleware
app.use(cors({
  origin:process.env.Frontend_URL ,
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
app.get('/api', (req, res) => {
  res.json({ message: 'Todo API with Authentication is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { Pool } = require('pg');
require('dotenv').config();

// Enhanced PostgreSQL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Changed from DB_HOST to DATABASE_URL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connection successful');
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
    throw err;
  }
};

// Function to create tables if they don't exist
const createTables = async () => {
  try {
    const client = await pool.connect();
    
    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tasks table created/verified');
    client.release();
  } catch (err) {
    console.error('Error creating tables:', err);
    throw err;
  }
};

// Export both pool and test function
module.exports = { pool, testConnection, createTables };
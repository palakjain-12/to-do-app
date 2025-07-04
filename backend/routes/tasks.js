const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all task routes
router.use(authenticateToken);

// GET all tasks for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', 
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single task for authenticated user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2', 
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /tasks/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new task for authenticated user
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id.toString();
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description || '', userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update task for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const userId = req.user._id.toString();
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    if (title === undefined || title === null || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (completed === undefined || completed === null) {
      return res.status(400).json({ error: 'Completed status is required' });
    }
    
    // Check if task exists and belongs to user
    const existsResult = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2', 
      [parseInt(id), userId]
    );
    
    if (existsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update the task
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
      [title.trim(), description || '', Boolean(completed), parseInt(id), userId]
    );
    
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE task for authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', 
      [parseInt(id), userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
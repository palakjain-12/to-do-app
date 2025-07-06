const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all task routes
router.use(authenticateToken);

// GET all tasks for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const tasks = await Task.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean();

    // Transform the response to match your frontend expectations
    const transformedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      user_id: task.user_id,
      created_at: task.created_at,
      updated_at: task.updated_at
    }));

    res.json(transformedTasks);
  } catch (error) {
    console.error('GET /tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single task for authenticated user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    
    const task = await Task.findOne({ _id: id, user_id: userId }).lean();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Transform the response
    const transformedTask = {
      id: task._id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      user_id: task.user_id,
      created_at: task.created_at,
      updated_at: task.updated_at
    };

    res.json(transformedTask);
  } catch (error) {
    console.error('GET /tasks/:id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new task for authenticated user
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newTask = new Task({
      title: title.trim(),
      description: description || '',
      user_id: userId
    });
    
    const savedTask = await newTask.save();
    
    // Transform the response
    const transformedTask = {
      id: savedTask._id,
      title: savedTask.title,
      description: savedTask.description,
      completed: savedTask.completed,
      user_id: savedTask.user_id,
      created_at: savedTask.created_at,
      updated_at: savedTask.updated_at
    };
    
    res.status(201).json(transformedTask);
  } catch (error) {
    console.error('POST /tasks error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update task for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const userId = req.user._id;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    
    if (title === undefined || title === null || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (completed === undefined || completed === null) {
      return res.status(400).json({ error: 'Completed status is required' });
    }
    
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user_id: userId },
      {
        title: title.trim(),
        description: description || '',
        completed: Boolean(completed),
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Transform the response
    const transformedTask = {
      id: updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      completed: updatedTask.completed,
      user_id: updatedTask.user_id,
      created_at: updatedTask.created_at,
      updated_at: updatedTask.updated_at
    };
    
    res.json(transformedTask);
  } catch (error) {
    console.error('PUT /tasks/:id error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE task for authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    
    const deletedTask = await Task.findOneAndDelete({ 
      _id: id, 
      user_id: userId 
    }).lean();
    
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Transform the response
    const transformedTask = {
      id: deletedTask._id,
      title: deletedTask.title,
      description: deletedTask.description,
      completed: deletedTask.completed,
      user_id: deletedTask.user_id,
      created_at: deletedTask.created_at,
      updated_at: deletedTask.updated_at
    };
    
    res.json({ 
      message: 'Task deleted successfully', 
      task: transformedTask 
    });
  } catch (error) {
    console.error('DELETE /tasks/:id error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
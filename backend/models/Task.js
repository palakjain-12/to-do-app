const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Add indexes for better performance
taskSchema.index({ user_id: 1, created_at: -1 });
taskSchema.index({ user_id: 1, completed: 1 });

// Transform output to match your frontend expectations
taskSchema.methods.toJSON = function() {
  const task = this.toObject();
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    user_id: task.user_id,
    created_at: task.created_at,
    updated_at: task.updated_at
  };
};

module.exports = mongoose.model('Task', taskSchema);
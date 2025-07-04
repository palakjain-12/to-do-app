import React from 'react';
import './styles.css';

const TaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <p>No tasks yet!</p>
        <span>Add your first task above to get started</span>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          <div className="task-content">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="task-checkbox"
              />
              <span className="checkmark"></span>
            </label>
            <span className="task-text">{task.text}</span>
            <span className="task-status">
              {task.completed ? '✅ Complete' : '⏳ Pending'}
            </span>
          </div>
          <div className="task-actions">
            <button
              onClick={() => onToggleTask(task.id)}
              className={`toggle-btn ${task.completed ? 'completed' : 'pending'}`}
              title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.completed ? '↩️ Undo' : '✅ Complete'}
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="delete-btn"
              title="Delete task"
            >
              🗑️ Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
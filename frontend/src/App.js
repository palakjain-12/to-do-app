import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import TodoInput from './components/TodoInput';
import TaskList from './components/TaskList';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './components/styles.css';

// Main Todo Component (protected)
const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // API base URL - use environment variable or default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/tasks';

  // Fetch tasks from backend with authentication
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data to frontend format
      const transformedTasks = data.map(task => ({
        id: task.id,
        text: task.title,
        completed: task.completed,
        createdAt: task.created_at
      }));
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(
        err.message.includes('fetch') 
          ? 'Cannot connect to server. Make sure your backend is running on port 5000.'
          : `Failed to load tasks: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  // Fetch all tasks when component mounts
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, fetchTasks]);

  // Add new task to backend with authentication
  const addTask = async (text) => {
    if (!text.trim()) return;
    
    try {
      setError(null);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: text.trim(),
          description: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      
      // Add the new task to local state
      setTasks(prevTasks => [...prevTasks, {
        id: newTask.id,
        text: newTask.title,
        completed: newTask.completed,
        createdAt: newTask.created_at
      }]);
      
    } catch (err) {
      console.error('Error adding task:', err);
      setError(`Failed to add task: ${err.message}`);
    }
  };

  // Toggle task completion status with authentication
  const toggleTask = async (id) => {
    try {
      setError(null);
      
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: task.text,
          description: '',
          completed: !task.completed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
      
    } catch (err) {
      console.error('Error updating task:', err);
      setError(`Failed to update task: ${err.message}`);
    }
  };

  // Delete task from backend with authentication
  const deleteTask = async (id) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      // Remove from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(`Failed to delete task: ${err.message}`);
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={fetchTasks} className="retry-btn">
              Retry
            </button>
          </div>
        )}
        
        <TodoInput onAddTask={addTask} />
        
        {totalCount > 0 && (
          <div className="task-summary">
            <p>📊 {completedCount} of {totalCount} tasks completed</p>
          </div>
        )}
        
        <TaskList 
          tasks={tasks} 
          onToggleTask={toggleTask} 
          onDeleteTask={deleteTask} 
        />
      </main>
    </div>
  );
};

// Main App Component with Router
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <TodoApp />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

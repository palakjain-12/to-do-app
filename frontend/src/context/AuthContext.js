import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('todo_token'));
  const [loading, setLoading] = useState(true);

  // Use production API URL or fall back to development
  const API_URL = "https://to-do-app-if4l.onrender.com";

  // Check if user is authenticated when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          console.log('Verifying token with URL:', `${API_URL}/auth/verify`);
          const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Verify response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token is invalid
            console.log('Token verification failed, removing token');
            localStorage.removeItem('todo_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('todo_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token, API_URL]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with URL:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok) {
        localStorage.setItem('todo_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration with URL:', `${API_URL}/auth/register`);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('Registration response status:', response.status);

      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.ok) {
        localStorage.setItem('todo_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('todo_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
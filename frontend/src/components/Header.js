import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>TaskMaster</h1>
          <p>Organize your day, achieve your goals</p>
        </div>
        
        {isAuthenticated && (
          <div className="user-info">
            <span className="welcome-text">
              Welcome, <strong>{user?.username}</strong>!
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
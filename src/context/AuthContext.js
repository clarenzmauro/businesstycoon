import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useGameContext } from './GameContext';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // We need to handle circular dependency by using a ref instead of the hook directly
  const gameContextRef = React.useRef(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Register new user
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(username, email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(username, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // First reset authentication state
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    
    // Then reset game state if gameContextRef is available
    if (gameContextRef.current && gameContextRef.current.resetGame) {
      gameContextRef.current.resetGame();
    }
  };

  // Clear any auth errors
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// This component wraps the GameProvider to avoid circular dependencies
export const AuthProviderWithGameContext = ({ children }) => {
  const gameContext = useGameContext();
  
  return (
    <AuthProvider>
      {React.cloneElement(children, { ref: { current: gameContext } })}
    </AuthProvider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

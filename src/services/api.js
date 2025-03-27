import axios from 'axios';

// Create an axios instance with default configuration
// Determine the API base URL based on the current environment
const getApiBaseUrl = () => {
  // Check if we're in production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    // Use the environment variable if available, or default to your Vercel API URL
    return process.env.REACT_APP_API_URL || 'https://businesstycoon.vercel.app/';
  }
  
  // For local development, use the current hostname with port 3000
  const hostname = window.location.hostname;
  return `http://${hostname}:3000`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service for user authentication
export const authService = {
  // Register a new user
  register: async (username, email, password) => {
    try {
      const response = await api.post('/api/users/register', { username, email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  
  // Login user
  login: async (username, password) => {
    try {
      const response = await api.post('/api/users/login', { username, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Game state service for saving and loading game state
export const gameStateService = {
  // Save game state
  saveGameState: async (gameState) => {
    try {
      const response = await api.post('/api/gamestate/save', gameState);
      return response.data;
    } catch (error) {
      console.error('Save game state error:', error);
      throw new Error(error.response?.data?.message || 'Failed to save game state');
    }
  },
  
  // Load game state
  loadGameState: async () => {
    try {
      const response = await api.get('/api/gamestate/load');
      return response.data;
    } catch (error) {
      console.error('Load game state error:', error);
      
      // If it's a 404 error, it means the user doesn't have a saved game yet
      // This is normal for new users, so we'll return null instead of throwing an error
      if (error.response && error.response.status === 404) {
        console.log('No saved game found for this user (normal for new users)');
        return null;
      }
      
      throw new Error(error.response?.data?.message || 'Failed to load game state');
    }
  }
};

// Leaderboard service for fetching leaderboard data
export const leaderboardService = {
  // Get leaderboard
  getLeaderboard: async () => {
    try {
      const response = await api.get('/api/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Leaderboard error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
};

// User related API calls
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Game state related API calls
export const saveGameState = async (gameState) => {
  try {
    const response = await api.post('/api/gamestate/save', gameState);
    return response.data;
  } catch (error) {
    console.error('Save game state error:', error);
    throw error;
  }
};

export const loadGameState = async () => {
  try {
    const response = await api.get('/api/gamestate/load');
    return response.data;
  } catch (error) {
    console.error('Load game state error:', error);
    throw error;
  }
};

export default api;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin to access the API
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/businesstycoon';
const JWT_SECRET = process.env.JWT_SECRET || 'businesstycoon-secret-key';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Game State Schema
const gameStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  money: { type: Number, required: true },
  day: { type: Number, required: true },
  level: { type: Number, required: true, default: 1 },
  experience: { type: Number, required: true, default: 0 },
  experienceToNextLevel: { type: Number, required: true, default: 1000 },
  businesses: { type: Array, required: true },
  staff: { type: Array, required: true },
  marketEvents: { type: Array, required: true },
  stats: {
    totalRevenue: { type: Number, required: true },
    totalExpenses: { type: Number, required: true },
    netWorth: { type: Number, required: true, default: 10000 }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const GameState = mongoose.model('GameState', gameStateSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

// Routes

// Register User
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with that email or username' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Game State
app.post('/api/gamestate/save', auth, async (req, res) => {
  try {
    const { money, day, level, experience, experienceToNextLevel, businesses, staff, marketEvents, stats } = req.body;
    
    // Find existing game state for user
    let gameState = await GameState.findOne({ userId: req.user._id });
    
    if (gameState) {
      // Update existing game state
      gameState.money = money;
      gameState.day = day;
      gameState.level = level || 1;
      gameState.experience = experience || 0;
      gameState.experienceToNextLevel = experienceToNextLevel || 1000;
      gameState.businesses = businesses;
      gameState.staff = staff;
      gameState.marketEvents = marketEvents;
      gameState.stats = stats;
      // Ensure netWorth is included in stats
      if (!gameState.stats.netWorth) {
        gameState.stats.netWorth = money;
      }
      gameState.lastUpdated = Date.now();
    } else {
      // Create new game state
      gameState = new GameState({
        userId: req.user._id,
        money,
        day,
        level: level || 1,
        experience: experience || 0,
        experienceToNextLevel: experienceToNextLevel || 1000,
        businesses,
        staff,
        marketEvents,
        stats: {
          ...stats,
          netWorth: stats.netWorth || money // Ensure netWorth is included
        },
      });
    }
    
    await gameState.save();
    res.status(200).json({ message: 'Game state saved successfully' });
  } catch (error) {
    console.error('Save game state error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Load Game State
app.get('/api/gamestate/load', auth, async (req, res) => {
  try {
    const gameState = await GameState.findOne({ userId: req.user._id });
    
    if (!gameState) {
      return res.status(404).json({ message: 'No saved game found' });
    }
    
    res.status(200).json(gameState);
  } catch (error) {
    console.error('Load game state error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await GameState.find()
      .sort({ 'money': -1 })
      .limit(10)
      .populate('userId', 'username')
      .select('money day stats userId');
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

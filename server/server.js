const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartstudy';

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // Timeout for server selection
  socketTimeoutMS: 45000, // Timeout for socket operations
  maxPoolSize: 10, // Maximum number of connections
  retryWrites: true, // Retry failed writes
  retryReads: true // Retry failed reads
};

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.log('MongoDB connection error:', err.message);
    console.log('Please ensure MongoDB is running and accessible');
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartStudy API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;


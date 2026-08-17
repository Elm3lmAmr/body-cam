const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const streamRoutes = require('./routes/streamRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const recordingRoutes = require('./routes/recordingRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();

// Serve uploads directory statically for video playback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

module.exports = app;

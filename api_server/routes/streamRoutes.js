const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const streamController = require('../controllers/streamController');
const registry = require('../db/streamRegistry');

// POST /api/stream/initialize  — start or stop a stream session
router.post('/initialize', authMiddleware, streamController.initializeStream);

// GET  /api/stream/active       — list all active sessions (supervisor only)
router.get('/active', authMiddleware, (req, res) => {
  if (req.user.role !== 'supervisor') {
    return res.status(403).json({ error: 'Access restricted to supervisors only' });
  }
  const streams = registry.getAll().map(([employeeCode, data]) => ({
    employeeCode,
    ...data,
  }));
  res.json({ active_streams: streams });
});

module.exports = router;

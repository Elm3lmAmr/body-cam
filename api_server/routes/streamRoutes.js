const express = require('express');
const router = express.Router();

const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');
const streamController = require('../controllers/streamController');
const registry = require('../db/streamRegistry');

// POST /api/stream/initialize  — start or stop a stream session
router.post('/initialize', authMiddleware, streamController.initializeStream);

// GET  /api/stream/active       — list all active sessions
router.get('/active', authMiddleware, authorizeRoles('it_admin', 'manager', 'supervisor', 'operator'), (req, res) => {
  const streams = registry.getAll().map(([employeeCode, data]) => ({
    employeeCode,
    ...data,
  }));
  res.json({ active_streams: streams });
});

module.exports = router;

/**
 * streamController.js
 * Handles body-cam live-stream signaling: initializing and stopping streams.
 */

const registry = require('../db/streamRegistry');

/**
 * POST /api/stream/initialize
 * Body: { device_serial, status, gps: { latitude, longitude } }
 * Auth: JWT — req.user.employeeCode must be present.
 *
 * status === 'STREAMING' → registers the session, returns stream_id + WebRTC endpoint.
 * status === 'IDLE'      → removes the session, confirms the stop.
 */
exports.initializeStream = async (req, res, next) => {
  try {
    const { device_serial, status, gps } = req.body;
    const employeeCode = req.user.employeeCode; // set by authMiddleware

    // --- Validation ---
    if (!device_serial || typeof device_serial !== 'string') {
      return res.status(400).json({ error: 'device_serial is required and must be a string' });
    }

    if (!status || !['STREAMING', 'IDLE'].includes(status)) {
      return res.status(400).json({ error: "status is required and must be 'STREAMING' or 'IDLE'" });
    }

    if (
      !gps ||
      typeof gps.latitude !== 'number' ||
      typeof gps.longitude !== 'number'
    ) {
      return res.status(400).json({ error: 'gps object with numeric latitude and longitude is required' });
    }

    // --- Handle STREAMING ---
    if (status === 'STREAMING') {
      const stream_id = 'str_' + Math.random().toString(36).substr(2, 9);

      registry.set(employeeCode, {
        stream_id,
        device_serial,
        status,
        gps,
        startedAt: new Date().toISOString(),
      });

      return res.status(200).json({
        stream_id,
        webrtc_endpoint: 'ws://127.0.0.1:4000/api/stream/signaling',
        device_serial,
        employee_code: employeeCode,
      });
    }

    // --- Handle IDLE ---
    if (status === 'IDLE') {
      registry.remove(employeeCode);
      return res.status(200).json({
        message: 'Stream stopped',
        employee_code: employeeCode,
      });
    }
  } catch (error) {
    next(error);
  }
};

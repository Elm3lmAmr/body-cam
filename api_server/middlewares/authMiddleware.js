/**
 * authMiddleware.js
 * Verifies the JWT Bearer token present in the Authorization header.
 * On success, attaches the decoded payload to req.user and calls next().
 * On failure, responds with 401 Unauthorized.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecret';

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = authMiddleware;

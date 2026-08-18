const db = require('../config/db');
const jwt = require('jsonwebtoken');

// ─── Runtime flag: whether columns have been confirmed to exist ───
let columnsEnsured = false;

/**
 * Ensures the mobile_number and last_login columns exist in the users table.
 * Checks once per server lifetime and caches the result.
 */
async function ensureColumns() {
  if (columnsEnsured) return;
  const [mobileRows] = await db.query("SHOW COLUMNS FROM users LIKE 'mobile_number'");
  if (mobileRows.length === 0) {
    await db.query('ALTER TABLE users ADD COLUMN mobile_number VARCHAR(20)');
    console.log('Added mobile_number column to users table.');
  }
  const [loginRows] = await db.query("SHOW COLUMNS FROM users LIKE 'last_login'");
  if (loginRows.length === 0) {
    await db.query('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL');
    console.log('Added last_login column to users table.');
  }
  columnsEnsured = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/device-login
// ─────────────────────────────────────────────────────────────────────────────
exports.deviceLogin = async (req, res, next) => {
  try {
    const { employee_code, password } = req.body;

    if (!employee_code || !password) {
      return res.status(400).json({ error: 'Employee code and password are required' });
    }

    // Query using the actual column names: employee_code and password_hash
    const [rows] = await db.query(
      'SELECT * FROM users WHERE employee_code = ? AND password_hash = ? LIMIT 1',
      [employee_code, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid employee code or password' });
    }

    const user = rows[0];

    let normalizedRole = (user.role || '').toLowerCase().replace(' ', '_');
    if (normalizedRole === 'admin') normalizedRole = 'it_admin';

    await ensureColumns();
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, employeeCode: user.employee_code, role: normalizedRole },
      'supersecret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employeeCode: user.employee_code,
        fullName: user.full_name,
        role: normalizedRole
      }
    });
  } catch (error) {
    console.error('Error during device login:', error);
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { employee_code, full_name, mobile_number, password, re_password } = req.body;

    // ── 1. Presence & type validation ────────────────────────────────────────
    const fields = { employee_code, full_name, mobile_number, password, re_password };
    for (const [key, val] of Object.entries(fields)) {
      if (val === undefined || val === null || val === '' || typeof val !== 'string') {
        return res.status(400).json({ error: `Missing or invalid field: ${key}` });
      }
    }

    // ── 2. Mobile number format validation ───────────────────────────────────
    if (!/^[0-9+]{7,15}$/.test(mobile_number)) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    // ── 3. Password match validation ─────────────────────────────────────────
    if (password !== re_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // ── 4. Duplicate employee_code check ─────────────────────────────────────
    const [existing] = await db.query(
      'SELECT id FROM users WHERE employee_code = ?',
      [employee_code]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Employee code is already registered' });
    }

    // ── 5. Ensure columns exist ────────────────────────────────
    await ensureColumns();

    // ── 6. Insert new user ───────────────────────────────────────────────────
    await db.query(
      'INSERT INTO users (employee_code, full_name, mobile_number, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [employee_code, full_name, mobile_number, password, 'guard']
    );

    // ── 7. Success response ──────────────────────────────────────────────────
    return res.status(201).json({
      message: 'User registered successfully',
      employeeCode: employee_code
    });
  } catch (error) {
    console.error('Error during registration:', error);
    next(error);
  }
};

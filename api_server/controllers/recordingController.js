const db = require('../config/db');

let tableEnsured = false;

/**
 * Ensures the recordings table exists in the database.
 */
async function ensureRecordingsTable() {
  if (tableEnsured) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS recordings (
      id INT(11) NOT NULL AUTO_INCREMENT,
      employee_code VARCHAR(50) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_url VARCHAR(255) NOT NULL,
      file_size BIGINT DEFAULT 0,
      duration_seconds INT DEFAULT 0,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY employee_code (employee_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  tableEnsured = true;
}

/**
 * POST /api/recordings/upload
 * Handles multipart/form-data video offloads and records metadata into MySQL.
 */
exports.uploadRecording = async (req, res, next) => {
  try {
    await ensureRecordingsTable();

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { employee_code, guardId, duration_seconds } = req.body;
    const guardCode = employee_code || guardId || (req.user ? req.user.employeeCode : 'G001');
    const duration = Number(duration_seconds) || 0;
    const fileUrl = `/uploads/recordings/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO recordings (employee_code, file_name, file_url, file_size, duration_seconds) VALUES (?, ?, ?, ?, ?)',
      [guardCode, req.file.filename, fileUrl, req.file.size || 0, duration]
    );

    const [rows] = await db.query('SELECT * FROM recordings WHERE id = ?', [result.insertId]);

    res.status(200).json({
      message: 'Recording uploaded and saved successfully',
      recording: rows[0],
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    next(error);
  }
};

/**
 * GET /api/recordings
 * Lists recorded sessions for supervisor viewing.
 */
exports.getRecordings = async (req, res, next) => {
  try {
    await ensureRecordingsTable();

    const { employee_code } = req.query;
    let sql = 'SELECT * FROM recordings ORDER BY recorded_at DESC';
    let params = [];

    if (employee_code) {
      sql = 'SELECT * FROM recordings WHERE employee_code = ? ORDER BY recorded_at DESC';
      params = [employee_code];
    }

    const [rows] = await db.query(sql, params);

    res.status(200).json({
      recordings: rows,
    });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    next(error);
  }
};

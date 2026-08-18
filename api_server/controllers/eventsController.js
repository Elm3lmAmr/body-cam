const db = require('../config/db');

exports.getEvents = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { type, message, source } = req.body;
    await db.query('INSERT INTO events (type, message, source) VALUES (?, ?, ?)', [type, message, source]);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error creating event:', error);
    next(error);
  }
};

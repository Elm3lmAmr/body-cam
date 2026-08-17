const db = require('../config/db');

exports.uploadIncident = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { guardId, deviceId, incidentDetails } = req.body;

    // Ideally, we'd save the incident details and file path to the database here
    // For now, we return success as we successfully received the multipart/form-data video offload
    
    res.status(200).json({
      message: 'Incident video uploaded successfully',
      fileDetails: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      },
      metadata: {
        guardId,
        deviceId,
        incidentDetails
      }
    });
  } catch (error) {
    console.error('Error uploading incident:', error);
    next(error);
  }
};

exports.raiseIncident = async (req, res, next) => {
  try {
    const { description, start_time, end_time } = req.body;
    // Auto-generate UID like INC-12345
    const incident_uid = 'INC-' + Math.floor(10000 + Math.random() * 90000);
    const dispatch_to = 'Head of Security Operations';
    
    // Hardcode user_id for now since we don't have auth middleware applied on this route yet
    const created_by_user_id = 1; 

    const [result] = await db.execute(
      'INSERT INTO incidents (incident_uid, description, dispatch_to, created_by_user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [incident_uid, description, dispatch_to, created_by_user_id, start_time || null, end_time || null, 'Open']
    );

    const incidentId = result.insertId;

    // Create an initial log entry
    await db.execute(
      'INSERT INTO incident_logs (incident_id, action, performed_by_user_id) VALUES (?, ?, ?)',
      [incidentId, 'Incident raised automatically dispatched to Security Head.', created_by_user_id]
    );

    res.status(201).json({
      message: 'Incident raised successfully',
      incident: {
        id: result.insertId,
        incident_uid,
        description,
        dispatch_to,
        created_by_user_id
      }
    });
  } catch (error) {
    console.error('Error raising incident:', error);
    next(error);
  }
};

exports.getIncidents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM incidents';
    let params = [];
    
    if (startDate && endDate) {
      query += ' WHERE created_at >= ? AND created_at <= ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.execute(query, params);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    next(error);
  }
};

exports.getIncidentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [incidentRows] = await db.execute('SELECT * FROM incidents WHERE id = ?', [id]);
    if (incidentRows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const [logs] = await db.execute('SELECT * FROM incident_logs WHERE incident_id = ? ORDER BY created_at DESC', [id]);
    const [attachments] = await db.execute('SELECT * FROM incident_attachments WHERE incident_id = ? ORDER BY uploaded_at DESC', [id]);
    
    res.status(200).json({
      ...incidentRows[0],
      logs,
      attachments
    });
  } catch (error) {
    next(error);
  }
};

exports.addAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    
    await db.execute(
      'INSERT INTO incident_attachments (incident_id, file_name, file_path) VALUES (?, ?, ?)',
      [id, req.file.originalname, req.file.filename]
    );
    
    res.status(201).json({ message: 'Attachment added successfully', file: req.file.filename });
  } catch (error) {
    next(error);
  }
};

exports.addLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const user_id = 1; // Hardcoded for now
    
    await db.execute(
      'INSERT INTO incident_logs (incident_id, action, performed_by_user_id) VALUES (?, ?, ?)',
      [id, action, user_id]
    );
    
    res.status(201).json({ message: 'Log added successfully' });
  } catch (error) {
    next(error);
  }
};

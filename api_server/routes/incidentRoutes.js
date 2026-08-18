const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const incidentController = require('../controllers/incidentController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config for video offloads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/upload', upload.single('video'), incidentController.uploadIncident);
router.post('/raise', incidentController.raiseIncident);

// Routes requiring auth
router.use(authMiddleware);

router.get('/stats', authorizeRoles('it_admin', 'manager'), incidentController.getStats);
router.get('/', authorizeRoles('it_admin', 'manager', 'supervisor', 'operator'), incidentController.getIncidents);
router.get('/:id', incidentController.getIncidentDetails);
router.post('/:id/attachments', upload.single('attachment'), incidentController.addAttachment);
router.post('/:id/logs', incidentController.addLog);

module.exports = router;

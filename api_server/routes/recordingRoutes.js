const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const recordingController = require('../controllers/recordingController');

// Ensure uploads/recordings directory exists
const uploadDir = path.join(__dirname, '../uploads/recordings');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config for recorded video files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'rec-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/upload', upload.single('video'), recordingController.uploadRecording);
router.get('/', authMiddleware, authorizeRoles('it_admin', 'supervisor'), recordingController.getRecordings);

module.exports = router;

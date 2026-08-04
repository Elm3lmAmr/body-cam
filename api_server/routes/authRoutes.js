const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/device-login', authController.deviceLogin);
router.post('/register', authController.register);

module.exports = router;

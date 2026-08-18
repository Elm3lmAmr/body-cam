const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Anyone can view users (so the Guards page can list guards), but only it_admin can manage users
router.get('/', authorizeRoles('it_admin', 'manager', 'supervisor', 'operator'), userController.getUsers);
router.post('/', authorizeRoles('it_admin'), userController.createUser);
router.put('/:id', authorizeRoles('it_admin'), userController.updateUser);
router.delete('/:id', authorizeRoles('it_admin'), userController.deleteUser);

module.exports = router;

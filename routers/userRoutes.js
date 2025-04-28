const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/', authenticateUser, authorizeRoles('admin'), UserController.getAllUsers);
router.get('/:id', authenticateUser, authorizeRoles('admin'), UserController.getUserById);
router.post('/', authenticateUser, authorizeRoles('admin'), UserController.createUser);
router.put('/:id', authenticateUser, authorizeRoles('admin'), UserController.updateUser);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), UserController.deleteUser);
router.post('/import', authenticateUser, authorizeRoles('admin'), UserController.createWithFileExcel);

module.exports = router;
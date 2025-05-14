const express = require('express');
const UserController = require('../controllers/user.controller');
const { authenticateUser, authorizeRoles, authorizePermissions } = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/', authenticateUser, authorizeRoles('admin'), authorizePermissions('user:view') ,UserController.getAllUsers);
router.get('/:id', authenticateUser, authorizeRoles('admin'), authorizePermissions('user:view'), UserController.getUserById);
router.post('/', authenticateUser, authorizeRoles('admin'), authorizePermissions('user:create'), UserController.createUser);
router.put('/:id', authenticateUser, authorizeRoles('admin'), authorizePermissions('user:update'), UserController.updateUser);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), UserController.deleteUser);
router.post('/import', authenticateUser, authorizeRoles('admin'), authorizePermissions('user:create'), UserController.createWithFileExcel);

module.exports = router;
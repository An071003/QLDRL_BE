const express = require('express');
const UserController = require('../controllers/user.controller');
const { authenticateUser, authorizeRoles, authorizePermissions } = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/', authenticateUser, authorizePermissions('user:view'), UserController.getAllUsers);
router.get('/:id', authenticateUser, authorizePermissions('user:view'), UserController.getUserById);
router.post('/', authenticateUser, authorizePermissions('user:create'), UserController.createUser);
router.post('/import', authenticateUser, authorizePermissions('user:create'), UserController.createWithFileExcel);
router.put('/:id', authenticateUser, authorizePermissions('user:update'), UserController.updateUser);
router.delete('/:id', authenticateUser, authorizePermissions('user:delete'), UserController.deleteUser);

module.exports = router;
const express = require('express');
const PermissionController = require('../controllers/permission.controller');
const { authenticateUser, authorizeRoles, authorizePermissions } = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:view'), PermissionController.getAllPermissions);
router.post('/', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:create'), PermissionController.createPermission);
router.put('/:id', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:update'), PermissionController.updatePermission);
router.delete('/:id',  authenticateUser, authorizeRoles('admin'), authorizePermissions('role:delete'), PermissionController.deletePermission);

module.exports = router;

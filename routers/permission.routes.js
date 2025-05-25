const express = require('express');
const PermissionController = require('../controllers/permission.controller');
const { authenticateUser, authorizePermissions } = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/', authenticateUser, authorizePermissions('role:view'), PermissionController.getAllPermissions);
router.post('/', authenticateUser, authorizePermissions('role:create'), PermissionController.createPermission);
router.put('/:id', authenticateUser, authorizePermissions('role:update'), PermissionController.updatePermission);
router.delete('/:id',  authenticateUser, authorizePermissions('role:delete'), PermissionController.deletePermission);

module.exports = router;

const express = require('express');
const RolePermissionController = require('../controllers/rolePermission.controller');
const { authenticateUser, authorizeRoles, authorizePermissions } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:roleId/permissions', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:view'), RolePermissionController.getPermissionsByRole);
router.post('/:roleId/permissions', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:create'), RolePermissionController.assignPermissionsToRole);
router.post('/:roleId/permissions/add', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:create'), RolePermissionController.addPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:delete'), RolePermissionController.removePermissionFromRole);

module.exports = router;

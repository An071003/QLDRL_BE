const express = require('express');
const RolePermissionController = require('../controllers/rolePermission.controller');
const { authenticateUser, authorizeRoles, authorizePermissions } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:roleId/permissions', authenticateUser, authorizePermissions('role:view'), RolePermissionController.getPermissionsByRole);
router.post('/:roleId/permissions', authenticateUser, authorizePermissions('role:create'), RolePermissionController.assignPermissionsToRole);
router.post('/:roleId/permissions/add', authenticateUser, authorizePermissions('role:create'), RolePermissionController.addPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', authenticateUser, authorizePermissions('role:delete'), RolePermissionController.removePermissionFromRole);

module.exports = router;

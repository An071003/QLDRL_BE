const express = require('express');
const RolePermissionController = require('../controllers/rolePermission.controller');

const router = express.Router();

router.get('/:roleId/permissions', RolePermissionController.getPermissionsByRole);
router.post('/:roleId/permissions', RolePermissionController.assignPermissionsToRole);
router.post('/:roleId/permissions/add', RolePermissionController.addPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', RolePermissionController.removePermissionFromRole);

module.exports = router;

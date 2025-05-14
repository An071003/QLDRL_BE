const express = require('express');
const RoleController = require('../controllers/role.controller');
const { authenticateUser, authorizePermissions, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:view'), RoleController.getAllRoles);
router.get('/:id', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:view'), RoleController.getRolesById);
router.post('/', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:create'), RoleController.createRole);
router.put('/:id', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:update'), RoleController.updateRole);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), authorizePermissions('role:delete'), RoleController.deleteRole);

module.exports = router;

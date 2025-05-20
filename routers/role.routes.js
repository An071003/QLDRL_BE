const express = require('express');
const RoleController = require('../controllers/role.controller');
const { authenticateUser, authorizePermissions, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', RoleController.getAllRoles);
router.get('/:id', authenticateUser, authorizePermissions('role:view'), RoleController.getRolesById);
router.post('/', authenticateUser, authorizePermissions('role:create'), RoleController.createRole);
router.put('/:id', authenticateUser, authorizePermissions('role:update'), RoleController.updateRole);
router.delete('/:id', authenticateUser, authorizePermissions('role:delete'), RoleController.deleteRole);

module.exports = router;

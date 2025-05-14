const express = require('express');
const RoleController = require('../controllers/role.controller');

const router = express.Router();

router.get('/', RoleController.getAllRoles);
router.get('/:id', RoleController.getRolesById);
router.post('/', RoleController.createRole);
router.put('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

module.exports = router;

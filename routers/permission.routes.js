const express = require('express');
const PermissionController = require('../controllers/permission.controller');

const router = express.Router();
router.get('/', PermissionController.getAllPermissions);
router.post('/', PermissionController.createPermission);
router.put('/:id', PermissionController.updatePermission);
router.delete('/:id', PermissionController.deletePermission);

module.exports = router;

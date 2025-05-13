const express = require('express');
const RoleController = require('../controllers/role.controller');

const router = express.Router();

router.get('/', RoleController.getAllRoles);

module.exports = router;

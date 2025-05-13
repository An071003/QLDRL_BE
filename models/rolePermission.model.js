const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RolePermission = sequelize.define('RolePermission', {}, {
    tableName: 'role_permissions',
    timestamps: false,
});

module.exports = RolePermission;
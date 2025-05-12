const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permission = sequelize.define('Permission', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(10), unique: true, allowNull: false },
}, {
    tableName: 'permissions',
    timestamps: false,
});

module.exports = Permission;
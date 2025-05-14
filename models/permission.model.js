const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permission = sequelize.define('Permission', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(10), allowNull: false },
    action: { type: DataTypes.STRING(20), allowNull: false },
}, {
    tableName: 'permissions',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['name', 'action']
        }
    ]
});

module.exports = Permission;
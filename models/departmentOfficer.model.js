const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DepartmentOfficer = sequelize.define('DepartmentOfficer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  officer_name: { type: DataTypes.STRING(25), allowNull: false },
  officer_phone: { type: DataTypes.STRING(10) },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'department_officers',
  timestamps: false,
});

module.exports = DepartmentOfficer;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  faculty_id: { type: DataTypes.INTEGER, allowNull: false },
  cohort: { type: DataTypes.INTEGER, allowNull: false },
  class_leader_id: { type: DataTypes.STRING(8), allowNull: true },
  advisor_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'classes',
  timestamps: false,
});

module.exports = Class;
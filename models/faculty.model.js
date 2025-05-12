const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Faculty = sequelize.define('Faculty', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  faculty_abbr: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
}, {
  tableName: 'faculties',
  timestamps: false,
});

module.exports = Faculty;

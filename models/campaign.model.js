const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  criteria_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  max_score: { type: DataTypes.INTEGER, allowNull: false },
  semester_no: { type: DataTypes.TINYINT, allowNull: false },
  academic_year: { type: DataTypes.INTEGER, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'campaigns',
  timestamps: false,
});

module.exports = Campaign;

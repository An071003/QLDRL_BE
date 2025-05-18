const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  campaign_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  point: { type: DataTypes.INTEGER, allowNull: false },
  max_participants: { type: DataTypes.INTEGER, defaultValue: 0 },
  number_students: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('ongoing', 'expired'), defaultValue: 'ongoing' },
  registration_start: { type: DataTypes.DATE },
  registration_end: { type: DataTypes.DATE },
  approver_id: { type: DataTypes.INTEGER },
  approved_at: { type: DataTypes.DATE },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'activities',
  timestamps: false,
});

module.exports = Activity;
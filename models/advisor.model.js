const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Advisor = sequelize.define('Advisor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  faculty_id: { type: DataTypes.INTEGER, allowNull: true },
  phone: { type: DataTypes.STRING(10), allowNull: true,},
}, {
  tableName: 'advisors',
  timestamps: false,
});

module.exports = Advisor;

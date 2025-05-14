const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ranking = sequelize.define('Ranking', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  min_score: { type: DataTypes.INTEGER, allowNull: false },
  max_score: { type: DataTypes.INTEGER, allowNull: false },
  label: { type: DataTypes.STRING(20), allowNull: false },
}, {
  tableName: 'rankings',
  timestamps: false,
});

module.exports = Ranking;

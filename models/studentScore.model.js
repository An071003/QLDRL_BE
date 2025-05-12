const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentScore = sequelize.define('StudentScore', {
  student_id: { type: DataTypes.STRING(8), primaryKey: true },
  semester_no: { type: DataTypes.TINYINT, primaryKey: true },
  academic_year: { type: DataTypes.INTEGER, primaryKey: true },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('none', 'disciplined'), defaultValue: 'none' },
  classification: { type: DataTypes.STRING(20) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'student_score',
  timestamps: false,
});

module.exports = StudentScore;

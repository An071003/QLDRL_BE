const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  student_id: { type: DataTypes.STRING(8), primaryKey: true },
  student_name: { type: DataTypes.STRING(50), allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  class_id: { type: DataTypes.INTEGER, allowNull: true },
  faculty_id: { type: DataTypes.INTEGER, allowNull: true },
  phone: { type: DataTypes.STRING(10) },
  birthdate: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('none', 'disciplined'), defaultValue: 'none' },
  classification: { type: DataTypes.STRING(20) },
  sumscore: { type: DataTypes.FLOAT, defaultValue: 0 },
}, {
  tableName: 'students',
  timestamps: false,
});

module.exports = Student;


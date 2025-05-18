const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const db = require('../config/db');

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

// Static method to get the latest semester ID
Student.getLatestSemesterId = async function() {
  try {
    const [result] = await db.promise().query(`SELECT id FROM semester ORDER BY start_year DESC, name DESC LIMIT 1`);
    return result.length > 0 ? result[0].id : null;
  } catch (error) {
    console.error('Error getting latest semester ID:', error);
    throw error;
  }
};

// Static method to get student activities for a specific semester
Student.getStudentActivities = async function(studentId, semesterId) {
  try {
    const [results] = await db.promise().query(
      `SELECT 
        a.id, a.name, a.point, a.status, a.is_negative, a.negativescore,
        a.campaign_id, c.name AS campaign_name,
        s.id AS semester, s.name AS semester_name, s.start_year, s.end_year
      FROM student_activities sa
      JOIN activities a ON sa.activity_id = a.id
      JOIN campaigns c ON a.campaign_id = c.id
      JOIN semester s ON sa.semester = s.id
      WHERE sa.student_id = ? AND sa.semester = ? AND a.approver_id IS NOT NULL
      ORDER BY s.start_year DESC, s.name DESC`,
      [studentId, semesterId]
    );
    return results;
  } catch (error) {
    console.error('Error getting student activities:', error);
    throw error;
  }
};

module.exports = Student;


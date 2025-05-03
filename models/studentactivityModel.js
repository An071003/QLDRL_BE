const db = require('../config/db');

class StudentActivity {
  static async getStudentsByActivity(activity_id) {
    const [result] = await db.promise().query(
      `SELECT sa.student_id, s.student_name, s.class, sa.awarded_score, sa.participated, sa.semester
       FROM student_discipline_management.student_activities sa
       JOIN student_discipline_management.students s ON sa.student_id = s.id
       WHERE sa.activity_id = ?`,
      [activity_id]
    );
    return result;
  }

  static async getStudentsNotInActivity(activity_id, semester) {
    const [result] = await db.promise().query(
      `SELECT s.id AS student_id, s.student_name, s.class
       FROM student_discipline_management.students s
       LEFT JOIN student_discipline_management.student_activities sa 
       ON s.id = sa.student_id AND sa.activity_id = ? AND sa.semester = ?
       WHERE sa.student_id IS NULL`,
      [activity_id, semester]
    );
    return result;
  }

  static async addStudentToActivity(studentList) {
    if (studentList.length === 0) return;
    const values = studentList.map(student => [
      student.student_id,
      student.activity_id,
      student.semester,
      student.awarded_score,
      false,
    ]);

    const [result] = await db.promise().query(
      `INSERT INTO student_discipline_management.student_activities 
       (student_id, activity_id, semester, awarded_score, participated)
       VALUES ?`,
      [values]
    );
    return result;
  }

  static async removeStudentFromActivity(student_id, activity_id, semester) {
    const [result] = await db.promise().query(
      `DELETE FROM student_discipline_management.student_activities 
       WHERE student_id = ? AND activity_id = ? AND semester = ?`,
      [student_id, activity_id, semester]
    );
    return result;
  }
}

module.exports = StudentActivity;

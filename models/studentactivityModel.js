const db = require('../config/db');

class StudentActivity {
  static async getStudentsByActivity(activity_id) {
    const [result] = await db.promise().query(
      `SELECT sa.student_id, s.student_name, s.class, sa.awarded_score, sa.participated, sa.semester
       FROM student_activities sa
       JOIN students s ON sa.student_id = s.id
       WHERE sa.activity_id = ?`,
      [activity_id]
    );
    return result;
  }

  static async getStudentsNotInActivity(activity_id, semester) {
    const [result] = await db.promise().query(
      `SELECT s.id AS student_id, s.student_name, s.class
      FROM students s
      WHERE NOT EXISTS (
        SELECT 1
        FROM student_activities sa
        WHERE sa.student_id = s.id
          AND sa.activity_id = ?
          AND sa.semester = ?
      );`,
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
      `INSERT INTO student_activities 
       (student_id, activity_id, semester, awarded_score, participated)
       VALUES ?`,
      [values]
    );
    return result;
  }

  static async updateParticipationStatus(student_id, activity_id, semester, participated) {
    const [result] = await db.promise().query(
      `UPDATE student_activities 
       SET participated = ? 
       WHERE student_id = ? AND activity_id = ? AND semester = ?`,
      [participated, student_id, activity_id, semester]
    );
    return result;
  }

  static async removeStudentFromActivity(student_id, activity_id, semester) {
    const [result] = await db.promise().query(
      `DELETE FROM student_activities 
       WHERE student_id = ? AND activity_id = ? AND semester = ?`,
      [student_id, activity_id, semester]
    );
    return result;
  }

  static async getStudent(activityId, semesterId, dbStudents) {
    const result = await db.promise().query(
      `SELECT student_id FROM student_activities 
       WHERE activity_id = ? AND semester = ? AND student_id IN (?)`,
      [activityId, semesterId, dbStudents.map(s => s.student_id)]
    );
    return result[0];
  }
}

module.exports = StudentActivity;

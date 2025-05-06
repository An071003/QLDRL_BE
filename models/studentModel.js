const db = require("../config/db");

class Student {
  static async getAllStudents() {
    const [rows] = await db.promise().query(`
      SELECT s.*, u.email, u.name AS user_name
      FROM students s
      JOIN users u ON s.user_id = u.id
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.promise().query(`
      SELECT s.*, u.email, u.name AS user_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);
    return rows[0];
  }

  static async getLatestSemesterId() {
    const [rows] = await db.promise().query(`
      SELECT id FROM semester ORDER BY end_year DESC, start_year DESC LIMIT 1
    `);
    return rows[0]?.id || null;
  }

  static async getStudentActivities(studentId, semesterId) {
    const [rows] = await db.promise().query(`
      SELECT sa.*, a.name AS activity_name, c.name AS campaign_name
      FROM student_activities sa
      JOIN activities a ON sa.activity_id = a.id
      JOIN campaigns c ON a.campaign_id = c.id
      WHERE sa.student_id = ? AND sa.semester = ?
    `, [studentId, semesterId]);
    return rows;
  }

  static async createStudent({ id, student_name, faculty, course, className, userId }) {
    const [result] = await db.promise().query(`
      INSERT INTO students (id, student_name, faculty, course, class, user_id, sumscore)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [id, student_name, faculty, course, className, userId]);
    return result;
  }

  static async deleteStudentById(studentId) {
    const [result] = await db.promise().query(`
      DELETE FROM students WHERE id = ?
    `, [studentId]);
    return result;
  }

  static async findUserIdByStudentId(studentId) {
    const [rows] = await db.promise().query(`
      SELECT user_id FROM students WHERE id = ?
    `, [studentId]);
    return rows[0]?.user_id;
  }

  static async bulkCreateStudents(studentList) {
    const values = studentList.map(s =>
      [s.id, s.student_name, s.faculty, s.course, s.class, s.user_id]
    );
    const [result] = await db.promise().query(`
      INSERT INTO students (id, student_name, faculty, course, class, user_id)
      VALUES ?
    `, [values]);
    return result;
  }

  static async updateStudent(studentId, { student_name, faculty, course, className, status }) {
    const [result] = await db.promise().query(`
      UPDATE students
      SET student_name = ?, faculty = ?, course = ?, class = ?, status = ?
      WHERE id = ?
    `, [student_name, faculty, course, className, status, studentId]);
  
    return result;
  }
  
}

module.exports = Student;

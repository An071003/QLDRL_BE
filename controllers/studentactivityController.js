const Activity = require('../models/activityModel.js');
const Semester = require('../models/semesterModel.js');
const StudentActivity = require('../models/studentactivityModel.js');
const db = require('../config/db.js');

class StudentActivityController {
  static async getStudentsByActivity(req, res) {
    const { activityId } = req.params;
    try {
      const students = await StudentActivity.getStudentsByActivity(activityId);
      res.status(200).json({ status: 'success', data: { students } });
    } catch (err) {
      console.error('Error getting students for activity:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getStudentsNotInActivity(req, res) {
    const { activityId } = req.params;
    try {
      const semesterResult = await Semester.selectthelastid();
      if (semesterResult.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy học kỳ.' });
      }

      const semester = semesterResult[0];
      const students = await StudentActivity.getStudentsNotInActivity(activityId, semester);

      res.status(200).json({ status: 'success', data: { students } });
    } catch (err) {
      console.error('Error fetching students not in activity:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async addStudent(req, res) {
    const { studentIds } = req.body;
    const { activityId } = req.params;

    try {
      const semesterResult = await Semester.selectthelastid();

      if (semesterResult.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy học kỳ.' });
      }

      const point = await Activity.getPoint(activityId);

      if (point.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy điểm cho hoạt động này.' });
      }

      const studentList = studentIds.map(student_id => ({
        student_id,
        activity_id: activityId,
        semester: semesterResult[0].id,
        awarded_score: point,
      }));

      await StudentActivity.addStudentToActivity(studentList);

      res.status(201).json({ status: 'success', message: 'Thêm sinh viên vào hoạt động thành công.' });
    } catch (err) {
      console.error('Error adding student to activity:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async editStudentParticipation(req, res) {
    const { activityId } = req.params;
    const { participated, studentId } = req.body;

    try {
      const semesterResult = await Semester.selectthelastid();
      if (semesterResult.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy học kỳ.' });
      }

      const semester = semesterResult[0].id;

      await StudentActivity.updateParticipationStatus(studentId, activityId, semester, participated);

      res.status(200).json({ status: 'success', message: 'Cập nhật trạng thái tham gia thành công.' });
    } catch (err) {
      console.error('Error updating participation status:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async removeStudent(req, res) {
    const { activityId, studentIds } = req.params;

    try {
      const semesterResult = await Semester.selectthelastid();
      if (semesterResult.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy học kỳ.' });
      }
      const semester = semesterResult[0].id;

      await StudentActivity.removeStudentFromActivity(studentIds, activityId, semester);
      res.status(200).json({ status: 'success', message: 'Xóa sinh viên khỏi hoạt động thành công.' });
    } catch (err) {
      console.error('Error removing student from activity:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async importStudents(req, res) {
    const { activityId } = req.params;
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Danh sách sinh viên không hợp lệ.' });
    }

    try {
      const semesterResult = await Semester.selectthelastid();
      if (semesterResult.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy học kỳ.' });
      }

      const point = await Activity.getPoint(activityId);
      if (point.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy điểm cho hoạt động này.' });
      }

      const [dbStudents] = await db.promise().query(
        `SELECT id AS student_id FROM students WHERE id IN (?)`,
        [students.map(s => s.mssv)]
      );

      if (dbStudents.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sinh viên nào trong hệ thống.' });
      }

      const existingStudents = await StudentActivity.getStudent(activityId, semesterResult[0].id, dbStudents);
      const existingIds = new Set(existingStudents.map(row => row.student_id));
      const filteredStudents = dbStudents.filter(s => !existingIds.has(s.student_id));

      if (filteredStudents.length === 0) {
        return res.status(201).json({ success: true, message: 'Tất cả sinh viên đã tham gia hoạt động này.' });
      }

      const studentList = filteredStudents.map(s => ({
        student_id: s.student_id,
        activity_id: activityId,
        semester: semesterResult[0].id,
        awarded_score: point,
      }));

      await StudentActivity.addStudentToActivity(studentList);

      res.status(201).json({ success: true, message: 'Import sinh viên thành công.' });
    } catch (err) {
      console.error('Lỗi import sinh viên:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getStudentActivitiesBySemester(req, res) {
    const { studentId } = req.params;

    try {
      const [semesterResult] = await db.promise().query(`
        SELECT id FROM semester ORDER BY start_year DESC, name DESC LIMIT 1
      `);

      if (!semesterResult || semesterResult.length === 0) {
        return res.status(400).json({ message: "Không tìm thấy học kỳ." });
      }

      const semesterId = semesterResult[0].id;

      const [results] = await db.promise().query(
        `
        SELECT 
          a.id, a.name, a.point, a.status, a.is_negative, a.negativescore,
          a.campaign_id, c.name AS campaign_name,
          s.id AS semester, s.name AS semester_name, s.start_year, s.end_year
        FROM student_activities sa
        JOIN activities a ON sa.activity_id = a.id
        JOIN campaigns c ON a.campaign_id = c.id
        JOIN semester s ON sa.semester = s.id
        WHERE sa.student_id = ? AND sa.semester = ?
        ORDER BY s.start_year DESC, s.name DESC
        `,
        [studentId, semesterId]
      );

      res.status(200).json({
        status: "success",
        data: results,
      });
    } catch (err) {
      console.error("Lỗi truy vấn student activities:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }



  static async getActivityByStudent(req, res) {
    const { studentId } = req.params;

    try {
      const activities = await StudentActivity.getActivitiesByStudent(studentId);
      res.status(200).json({ status: "success", data: activities });
    } catch (error) {
      console.error("Lỗi khi lấy hoạt động theo sinh viên:", error);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getAvailableActivitiesForStudent(req, res) {
    const { studentId } = req.params;

    try {
      const [semesterResult] = await db.promise().query(`
      SELECT id FROM semester ORDER BY start_year DESC, name DESC LIMIT 1
    `);
      if (!semesterResult || semesterResult.length === 0) {
        return res.status(400).json({ message: "Không tìm thấy học kỳ." });
      }

      const semesterId = semesterResult[0].id;

      const [results] = await db.promise().query(
        `
        SELECT a.id, a.name, a.point, a.status, a.is_negative, a.negativescore, a.number_students,
               a.campaign_id, c.name AS campaign_name,
               s.id AS semester, s.name AS semester_name, s.start_year, s.end_year
        FROM activities a
        JOIN campaigns c ON a.campaign_id = c.id
        JOIN semester s ON c.semester = s.id
        WHERE a.status = 'ongoing'
          AND c.semester = ?
          AND NOT EXISTS (
            SELECT 1 FROM student_activities sa
            WHERE sa.student_id = ?
              AND sa.activity_id = a.id
              AND sa.semester = ?
          )
        `,
        [semesterId, studentId, semesterId]
      );


      res.status(200).json({
        status: "success",
        data: results,
      });
    } catch (err) {
      console.error("Lỗi khi lấy hoạt động chưa đăng ký:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }


}

module.exports = StudentActivityController;

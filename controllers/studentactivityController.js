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
    const { participated, studentId} = req.body;  
  
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
      
      // Lấy ID sinh viên từ mã số sinh viên (mssv)
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
  
}

module.exports = StudentActivityController;

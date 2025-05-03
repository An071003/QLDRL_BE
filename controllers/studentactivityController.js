const Activity = require('../models/activityModel.js');
const Semester = require('../models/semesterModel.js');
const StudentActivity = require('../models/studentactivityModel.js');

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
}

module.exports = StudentActivityController;

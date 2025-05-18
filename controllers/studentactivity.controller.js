const Activity = require('../models/activity.model.js');
// const Semester = require('../models/semesterModel.js');
const StudentActivity = require('../models/studentActivity.model.js');
const db = require('../config/db.js');
const { Op } = require('sequelize');
const Student = require('../models/student.model.js');
const Class = require('../models/class.model.js');
const Campaign = require('../models/campaign.model.js');

class StudentActivityController {
  static async getStudentsByActivity(req, res) {
    const { activityId } = req.params;
    try {
      const students = await StudentActivity.findAll({
        where: { activity_id: activityId },
        include: [
          {
            model: Student,
            attributes: ['student_id', 'student_name'],
            include: [
              {
                model: Class,
                attributes: ['name']
              }
            ]
          },
          {
            model: Activity,
            attributes: ['id', 'name', 'point', 'status'],
            include: [
              {
                model: Campaign,
                attributes: ['name'],
              },
            ],
          },
        ],
      });

      res.status(200).json({ status: 'success', data: { students } });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getStudentsNotInActivity(req, res) {
    const { activityId } = req.params;
    try {
      // Lấy danh sách ID sinh viên đã tham gia hoạt động
      const participatedRecords = await StudentActivity.findAll({
        where: { activity_id: activityId },
        attributes: ['student_id'],
      });
      const participatedIds = participatedRecords.map(record => record.student_id);

      // Tìm các sinh viên KHÔNG nằm trong danh sách đã tham gia
      const students = await Student.findAll({
        where: {
          student_id: {
            [Op.notIn]: participatedIds.length > 0 ? participatedIds : [''],
          },
        },
        attributes: ['student_id', 'student_name'],
        include: [
          {
            model: Class,
            attributes: ['name'],
          },
        ],
      });

      res.status(200).json({
        status: 'success',
        data: {
          students: students.map((s) => ({
            student_id: s.student_id,
            student_name: s.student_name,
            class: s.Class?.name || null,
          })),
        },
      });
    } catch (err) {
      console.error('Error fetching students not in activity:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async addStudent(req, res) {
    const { studentIds } = req.body;
    const { activityId } = req.params;
    const register_id = req.user.id;

    try {
      const pointResult = await Activity.findOne({
        where: { id: activityId },
        attributes: ['point'],
      });

      if (!pointResult) {
        return res.status(400).json({ message: 'Không tìm thấy điểm cho hoạt động này.' });
      }

      const studentList = studentIds.map(student_id => ({
        student_id,
        activity_id: activityId,
        awarded_score: pointResult.point,
        register_id
      }));

      await StudentActivity.bulkCreate(studentList, { ignoreDuplicates: true });

      res.status(201).json({ status: 'success', message: 'Thêm sinh viên vào hoạt động thành công.' });
    } catch (err) {
      console.error('Error adding student to activity:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async editStudentParticipation(req, res) {
    const { activityId } = req.params;
    const { participated, studentId } = req.body;

    if (!activityId || !studentId || typeof participated !== 'boolean') {
      return res.status(400).json({ message: 'Dữ liệu đầu vào không hợp lệ.' });
    }

    try {
      const [updatedCount] = await StudentActivity.update(
        { participated },
        {
          where: {
            student_id: studentId,
            activity_id: activityId,
          },
        }
      );

      if (updatedCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy bản ghi để cập nhật.' });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Cập nhật trạng thái tham gia thành công.',
      });
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật trạng thái tham gia:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ.' });
    }
  }

  static async removeStudent(req, res) {
    const { activityId, studentIds } = req.params;
    try {
      const deletedCount = await StudentActivity.destroy({
        where: {
          activity_id: activityId,
          student_id: studentIds,
        },
      });

      if (deletedCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sinh viên để xóa khỏi hoạt động.' });
      }

      return res.status(200).json({
        status: 'success',
        message: `Đã xóa ${deletedCount} sinh viên khỏi hoạt động.`,
      });
    } catch (err) {
      console.error('❌ Lỗi khi xóa sinh viên khỏi hoạt động:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ.' });
    }
  }

  static async importStudents(req, res) {
    const { activityId } = req.params;
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Danh sách sinh viên không hợp lệ.' });
    }

    try {
      const activity = await Activity.findByPk(activityId, {
        attributes: ['point']
      });

      if (!activity) {
        return res.status(400).json({ message: 'Không tìm thấy điểm cho hoạt động này.' });
      }

      const mssvList = students.map(s => s.mssv);

      const existingStudents = await Student.findAll({
        where: { student_id: mssvList },
        attributes: ['student_id']
      });

      if (existingStudents.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sinh viên nào trong hệ thống.' });
      }

      const existingStudentIds = existingStudents.map(s => s.student_id);
      const alreadyAdded = await StudentActivity.findAll({
        where: {
          activity_id: activityId,
          student_id: existingStudentIds
        },
        attributes: ['student_id']
      });

      const alreadyAddedIds = new Set(alreadyAdded.map(s => s.student_id));
      const newStudents = existingStudentIds.filter(id => !alreadyAddedIds.has(id));

      if (newStudents.length === 0) {
        return res.status(201).json({ success: true, message: 'Tất cả sinh viên đã tham gia hoạt động này.' });
      }

      const studentActivities = newStudents.map(student_id => ({
        student_id,
        activity_id: activityId,
        awarded_score: activity.point,
        participated: true
      }));

      await StudentActivity.bulkCreate(studentActivities);

      return res.status(201).json({
        success: true,
        message: 'Import sinh viên thành công.',
        added: studentActivities.length
      });
    } catch (err) {
      console.error('❌ Lỗi import sinh viên:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ.' });
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
      const latestCampaign = await Campaign.findOne({
        order: [
          ['academic_year', 'DESC'],
          ['semester_no', 'DESC']
        ]
      });

      if (!latestCampaign) {
        return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
      }

      const { academic_year, semester_no } = latestCampaign;

      const campaigns = await Campaign.findAll({
        where: { academic_year, semester_no },
        attributes: ['id']
      });

      const campaignIds = campaigns.map(c => c.id);

      const registeredActivities = await StudentActivity.findAll({
        where: { student_id: studentId },
        attributes: ['activity_id']
      });

      const registeredIds = registeredActivities.map(sa => sa.activity_id);
      const today = new Date();

      const activities = await Activity.findAll({
        where: {
          [Op.and]: [
            { campaign_id: { [Op.in]: campaignIds } },
            { status: 'ongoing' },
            { registration_start: { [Op.lte]: today } },
            { registration_end: { [Op.gte]: today } },
            {
              id: {
                [Op.notIn]: registeredIds.length > 0 ? registeredIds : [0]
              }
            }
          ]
        },
        include: [
          {
            model: Campaign,
            attributes: ['name', 'semester_no', 'academic_year']
          }
        ]
      });

      res.status(200).json({
        status: 'success',
        data: activities
      });
    } catch (err) {
      console.error('Lỗi khi lấy hoạt động chưa đăng ký:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getStudentActivityByStudentId(req, res) {
    try {
      const { studentID } = req.params;
      const studentActivity = await StudentActivity.findAll({
        where: { student_id: studentID },
        include: [
          {
            model: Student,
            attributes: ['student_id', 'student_name'],
            include: [
              {
                model: Class,
                attributes: ['name']
              }
            ]
          },
          {
            model: Activity,
            attributes: ['id', 'name', 'point', 'status'],
            include: [
              {
                model: Campaign,
                attributes: ['name', 'semester_no', 'academic_year'],
              },
            ],
          },
        ],
      });
      res.status(200).json({ studentActivity });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async getRegisteredActivitiesForStudent(req, res) {
    const { studentId } = req.params;

    try {
      const latestCampaign = await Campaign.findOne({
        order: [
          ['academic_year', 'DESC'],
          ['semester_no', 'DESC']
        ]
      });

      if (!latestCampaign) {
        return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
      }

      const { academic_year, semester_no } = latestCampaign;
      const campaigns = await Campaign.findAll({
        where: {
          academic_year,
          semester_no
        },
        attributes: ['id']
      });

      const campaignIds = campaigns.map(c => c.id);
      const today = new Date();
      const activities = await Activity.findAll({
        where: {
          [Op.and]: [
            { campaign_id: { [Op.in]: campaignIds } },
            { status: 'ongoing' },
            { registration_start: { [Op.lte]: today } },
            { registration_end: { [Op.gte]: today } }
          ]
        },
        include: [
          {
            model: StudentActivity,
            where: { student_id: studentId },
            required: true
          },
          {
            model: Campaign,
            attributes: ['name', 'semester_no', 'academic_year']
          }
        ]
      });

      res.status(200).json({
        status: 'success',
        data: activities
      });
    } catch (error) {
      console.error('Lỗi khi lấy hoạt động đã đăng ký:', error);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async createStudentActivity(req, res) {
    try {
      const { student_id, activity_id, score } = req.body;
      const newStudentActivity = await StudentActivity.create({
        student_id,
        activity_id,
        score,
      });
      res.status(201).json({ studentActivity: newStudentActivity });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async updateStudentActivity(req, res) {
    try {
      const { id } = req.params;
      const { student_id, activity_id, score } = req.body;
      const studentActivity = await StudentActivity.findByPk(id);
      if (!studentActivity) {
        return res.status(404).json({ message: "Student activity not found" });
      }
      await studentActivity.update({ student_id, activity_id, score });
      res.status(200).json({ studentActivity });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async deleteStudentActivity(req, res) {
    try {
      const { id } = req.params;
      const studentActivity = await StudentActivity.findByPk(id);
      if (!studentActivity) {
        return res.status(404).json({ message: "Student activity not found" });
      }
      await studentActivity.destroy();
      res.status(200).json({ message: "Student activity deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = StudentActivityController;

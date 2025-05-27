const { Op } = require("sequelize");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Advisor, Faculty, Class, Role, User } = require("../models");
const emailMiddleware = require("../middlewares/emailMiddleware");
const Student = require('../models/student.model');
const StudentScore = require('../models/studentScore.model');
const db = require('../config/db');

class AdvisorController {
  static generateRandomPassword = () => {
    return crypto.randomBytes(8).toString("hex");
  };

  static async getAllAdvisors(req, res) {
    try {
      const { faculty_id } = req.query;
      
      const whereClause = faculty_id ? { faculty_id } : {};

      const advisors = await Advisor.findAll({
        where: whereClause,
        include: [
          {
            model: Faculty,
            attributes: ['id', 'name', 'faculty_abbr'],
          },
          {
            model: Class,
            attributes: ['id', 'name'],
          },
          {
            model: User,
            attributes: ['user_name', 'email'],
          }
        ],
      });
      res.status(200).json({ advisors });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async getAdvisorById(req, res) {
    try {
      const { id } = req.params;
      const advisor = await Advisor.findByPk(id, {
        include: [
          {
            model: Faculty,
            attributes: ['id', 'name', 'faculty_abbr'],
          },
          {
            model: Class,
            attributes: ['id', 'name', 'cohort'],
          },
          {
            model: User,
            attributes: ['email'],
          },
        ],
      });
      if (!advisor) {
        return res.status(404).json({ message: "Advisor not found" });
      }
      res.status(200).json({ advisor });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async createAdvisor(req, res) {
    try {
      const { user, name, faculty_id, phone } = req.body;
      const {username, email} = user;
      if (!username || !name || !faculty_id || !email) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }

      if (phone && !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ (phải có 10 chữ số)." });
      }

      const role = await Role.findOne({ where: { name: 'advisor' }, attributes: ['id'] });
      if (!role) {
        return res.status(400).json({ message: "Không tìm thấy role 'advisor'." });
      }

      const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { user_name: username }] } });
      if (existingUser) {
        return res.status(400).json({ message: "Email hoặc tên đăng nhập đã tồn tại." });
      }

      const plainPassword = AdvisorController.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const newUser = await User.create({
        user_name: username,
        email,
        password: hashedPassword,
        role_id: role.id
      });

      const newAdvisor = await Advisor.create({
        name,
        faculty_id,
        phone,
        user_id: newUser.id
      });

      const subject = "Tài khoản cố vấn học tập";
      const htmlContent = `
      <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
        <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản cố vấn học tập</h2>
        <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
            Chào <strong>${name}</strong>,<br>
            Tài khoản của bạn đã được tạo thành công.
        </p>
        <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
          <p style="font-size: 18px; font-weight: 700;">Tên đăng nhập: ${username}</p>
          <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${plainPassword}</p>
        </div>
        <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
          Vui lòng đăng nhập và thay đổi mật khẩu sau khi truy cập để đảm bảo an toàn.
        </p>
      </div>
    `;

      await emailMiddleware(email, subject, htmlContent);

      return res.status(201).json({
        status: "success",
        message: "Tạo cố vấn thành công.",
        advisor: newAdvisor
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateAdvisor(req, res) {
    try {
      const { id } = req.params;
      const { name, faculty_id, phone } = req.body;
      const advisor = await Advisor.findByPk(id);
      if (!advisor) {
        return res.status(404).json({ message: "Advisor not found" });
      }
      await advisor.update({ name, faculty_id, phone });
      res.status(200).json({ advisor });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async deleteAdvisor(req, res) {
    try {
      const { id } = req.params;
      const advisor = await Advisor.findByPk(id);
      if (!advisor) {
        return res.status(404).json({ message: "Advisor not found" });
      }
      await advisor.destroy();
      res.status(200).json({ message: "Advisor deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async importAdvisorsFromExcel(req, res) {
    const advisors = req.body.advisors;

    if (!Array.isArray(advisors) || advisors.length === 0) {
      return res.status(400).json({ message: "Danh sách cố vấn không hợp lệ." });
    }

    try {
      const validAdvisors = [];
      const failed = [];

      for (const a of advisors) {
        const {
          username,
          name,
          faculty_id,
          email,
          phone
        } = a;

        if (!username || !name || !faculty_id || !email) {
          failed.push({ username, name, reason: "Thiếu thông tin bắt buộc" });
          continue;
        }

        if (phone && !/^\d{10}$/.test(phone)) {
          failed.push({ username, name, reason: "Số điện thoại không hợp lệ" });
          continue;
        }

        const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { user_name: username }] } });

        if (existingUser) {
          failed.push({ username, name, email, reason: "Email hoặc tên đăng nhập đã tồn tại" });
          continue;
        }

        const plainPassword = AdvisorController.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        validAdvisors.push({
          username,
          name,
          faculty_id,
          phone,
          email,
          plainPassword,
          hashedPassword
        });
      }

      if (validAdvisors.length === 0) {
        return res.status(400).json({
          status: "failure",
          message: "Không có cố vấn hợp lệ để tạo.",
          data: { failed }
        });
      }

      const role = await Role.findOne({ where: { name: 'advisor' }, attributes: ['id'] });
      if (!role) {
        return res.status(400).json({ message: "Không tìm thấy role 'advisor'." });
      }

      const usersToInsert = validAdvisors.map(a => ({
        user_name: a.username,
        email: a.email,
        password: a.hashedPassword,
        role_id: role.id
      }));

      const insertResults = await User.bulkCreate(usersToInsert);
      const startInsertId = insertResults[0].id;

      const pLimit = require('p-limit');
      const limit = pLimit(20);

      const sendTasks = validAdvisors.map((a, index) =>
        limit(async () => {
          const newUserId = startInsertId + index;

          try {
            await Advisor.create({
              name: a.name,
              faculty_id: a.faculty_id,
              phone: a.phone,
              user_id: newUserId
            });

            const htmlContent = `
          <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
            <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản cố vấn học tập</h2>
            <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
                Chào <strong>${a.name}</strong>,<br>
                Tài khoản của bạn đã được tạo thành công.
            </p>
            <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
              <p style="font-size: 18px; font-weight: 700;">Tên đăng nhập: ${a.username}</p>
              <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${a.plainPassword}</p>
            </div>
            <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
              Vui lòng đăng nhập và thay đổi mật khẩu sau khi truy cập để đảm bảo an toàn.
            </p>
          </div>`;

            await emailMiddleware(a.email, "Tài khoản cố vấn học tập", htmlContent);
          } catch (e) {
            console.error(`Lỗi khi xử lý cố vấn ${a.username}:`, e.message);
            failed.push({ username: a.username, name: a.name, reason: "Lỗi tạo hoặc gửi email" });
          }
        })
      );

      await Promise.all(sendTasks);

      return res.status(201).json({
        status: failed.length === 0 ? "success" : "partial",
        message: `Tạo ${validAdvisors.length - failed.length} cố vấn thành công, ${failed.length} thất bại.`,
        data: {
          created: validAdvisors.map(a => ({ username: a.username, name: a.name, email: a.email })),
          failed
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getAdvisorByUserId(req, res) {
    try {
      const { userId } = req.params;
      
      const advisor = await Advisor.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Faculty,
            attributes: ['id', 'name', 'faculty_abbr'],
          },
          {
            model: Class,
            include: [
              {
                model: Faculty,
              }
            ],
          },
          {
            model: User,
            attributes: ['email'],
          },
        ],
      });
      
      if (!advisor) {
        return res.status(404).json({ message: "Advisor not found" });
      }

      res.status(200).json({ advisor });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async getMyClasses(req, res) {
    try {
      const advisorId = req.user.id;
      
      const advisor = await Advisor.findByPk(advisorId, {
        include: [{
          model: Class,
          attributes: ['id', 'name']
        }]
      });

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: 'Advisor not found'
        });
      }

      res.json({
        success: true,
        data: {
          classes: advisor.Classes
        }
      });
    } catch (error) {
      console.error('Error getting advisor classes:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getMyStudentsScores(req, res) {
    try {
      const advisorId = req.user.id;
      
      // Get all classes for this advisor
      const advisor = await Advisor.findByPk(advisorId, {
        include: [{
          model: Class,
          attributes: ['id']
        }]
      });

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: 'Advisor not found'
        });
      }

      const classIds = advisor.Classes.map(cls => cls.id);

      // Get all students from these classes with their scores
      const students = await Student.findAll({
        where: {
          class_id: {
            [db.Sequelize.Op.in]: classIds
          }
        },
        include: [
          {
            model: StudentScore,
            required: false,
            attributes: ['score', 'classification', 'semester_no', 'academic_year']
          },
          {
            model: Faculty,
            attributes: ['name', 'faculty_abbr']
          },
          {
            model: Class,
            attributes: ['name']
          }
        ],
        attributes: ['student_id', 'student_name']
      });

      const formattedScores = students.flatMap(student => 
        student.StudentScores.map(score => ({
          student_id: student.student_id,
          score: score.score,
          classification: score.classification,
          semester_no: score.semester_no,
          academic_year: score.academic_year,
          Student: {
            student_name: student.student_name,
            Faculty: student.Faculty,
            Class: student.Class
          }
        }))
      );

      res.json({
        success: true,
        data: {
          studentScores: formattedScores
        }
      });
    } catch (error) {
      console.error('Error getting student scores:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getMyStudentsScoresBySemester(req, res) {
    try {
      const advisorId = req.user.id;
      const { semesterNo, academicYear } = req.params;
      
      // Get all classes for this advisor
      const advisor = await Advisor.findByPk(advisorId, {
        include: [{
          model: Class,
          attributes: ['id']
        }]
      });

      if (!advisor) {
        return res.status(404).json({
          success: false,
          message: 'Advisor not found'
        });
      }

      const classIds = advisor.Classes.map(cls => cls.id);

      // Get all students from these classes with their scores for the specified semester
      const students = await Student.findAll({
        where: {
          class_id: {
            [db.Sequelize.Op.in]: classIds
          }
        },
        include: [
          {
            model: StudentScore,
            required: false,
            where: {
              semester_no: semesterNo,
              academic_year: academicYear
            },
            attributes: ['score', 'classification']
          },
          {
            model: Faculty,
            attributes: ['name', 'faculty_abbr']
          },
          {
            model: Class,
            attributes: ['name']
          }
        ],
        attributes: ['student_id', 'student_name']
      });

      const formattedScores = students.map(student => ({
        student_id: student.student_id,
        score: student.StudentScores[0]?.score || 0,
        classification: student.StudentScores[0]?.classification || 'Chưa có',
        Student: {
          student_name: student.student_name,
          Faculty: student.Faculty,
          Class: student.Class
        }
      }));

      res.json({
        success: true,
        data: {
          studentScores: formattedScores
        }
      });
    } catch (error) {
      console.error('Error getting student scores by semester:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getStudentScoresByClass(req, res) {
    try {
      const advisorId = req.user.id;
      const { className } = req.params;
      
      // Verify that this advisor has access to this class
      const advisor = await Advisor.findByPk(advisorId, {
        include: [{
          model: Class,
          where: { name: className },
          attributes: ['id']
        }]
      });

      if (!advisor || !advisor.Classes.length) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this class'
        });
      }

      const classId = advisor.Classes[0].id;

      // Get all students from this class with their scores
      const students = await Student.findAll({
        where: { class_id: classId },
        include: [
          {
            model: StudentScore,
            required: false,
            attributes: ['score', 'classification', 'semester_no', 'academic_year']
          },
          {
            model: Faculty,
            attributes: ['name', 'faculty_abbr']
          },
          {
            model: Class,
            attributes: ['name']
          }
        ],
        attributes: ['student_id', 'student_name']
      });

      const formattedScores = students.flatMap(student => 
        student.StudentScores.map(score => ({
          student_id: student.student_id,
          score: score.score,
          classification: score.classification,
          semester_no: score.semester_no,
          academic_year: score.academic_year,
          Student: {
            student_name: student.student_name,
            Faculty: student.Faculty,
            Class: student.Class
          }
        }))
      );

      res.json({
        success: true,
        data: {
          studentScores: formattedScores
        }
      });
    } catch (error) {
      console.error('Error getting student scores by class:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getStudentScoresByClassAndSemester(req, res) {
    try {
      const advisorId = req.user.id;
      const { className, semesterNo, academicYear } = req.params;
      
      // Verify that this advisor has access to this class
      const advisor = await Advisor.findByPk(advisorId, {
        include: [{
          model: Class,
          where: { name: className },
          attributes: ['id']
        }]
      });

      if (!advisor || !advisor.Classes.length) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this class'
        });
      }

      const classId = advisor.Classes[0].id;

      // Get all students from this class with their scores for the specified semester
      const students = await Student.findAll({
        where: { class_id: classId },
        include: [
          {
            model: StudentScore,
            required: false,
            where: {
              semester_no: semesterNo,
              academic_year: academicYear
            },
            attributes: ['score', 'classification']
          },
          {
            model: Faculty,
            attributes: ['name', 'faculty_abbr']
          },
          {
            model: Class,
            attributes: ['name']
          }
        ],
        attributes: ['student_id', 'student_name']
      });

      const formattedScores = students.map(student => ({
        student_id: student.student_id,
        score: student.StudentScores[0]?.score || 0,
        classification: student.StudentScores[0]?.classification || 'Chưa có',
        Student: {
          student_name: student.student_name,
          Faculty: student.Faculty,
          Class: student.Class
        }
      }));

      res.json({
        success: true,
        data: {
          studentScores: formattedScores
        }
      });
    } catch (error) {
      console.error('Error getting student scores by class and semester:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AdvisorController;
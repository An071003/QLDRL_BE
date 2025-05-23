const Class = require('../models/class.model');
const Faculty = require('../models/faculty.model');
const Advisor = require('../models/advisor.model')
const Student = require('../models/student.model')
const User = require('../models/user.model');
const sequelize = require('../config/db');

class ClassController {
  static async getAllClasses(req, res) {
    try {
      const classes = await Class.findAll({ include: Faculty });
      res.status(200).json({ status: 'success', data: { classes } });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getClassById(req, res) {
    try {
      const classItem = await Class.findByPk(req.params.id, { include: Faculty });
      if (!classItem) {
        return res.status(404).json({ message: 'Không tìm thấy lớp.' });
      }
      res.status(200).json({ status: 'success', data: { class: classItem } });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async createClass(req, res) {
    try {
      const { name, faculty_id, cohort, class_leader_id, advisor_id } = req.body;
      const newClass = await Class.create({ name, faculty_id, cohort, class_leader_id, advisor_id });
      res.status(201).json({ status: 'success', data: { class: newClass } });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async importClasses(req, res) {
    try {
      const classes = req.body;

      if (!Array.isArray(classes) || classes.length === 0) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ. Yêu cầu một mảng các lớp.' });
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      // Process each class one by one
      for (const classItem of classes) {
        const { name, faculty_id, cohort } = classItem;

        // Validate required fields
        if (!name || !faculty_id || !cohort) {
          results.failed++;
          results.errors.push(`Lớp thiếu thông tin bắt buộc: ${name || 'Không có tên'}`);
          continue;
        }

        try {
          // Check if faculty exists
          const faculty = await Faculty.findByPk(faculty_id);
          if (!faculty) {
            results.failed++;
            results.errors.push(`Không tìm thấy khoa với ID: ${faculty_id} cho lớp: ${name}`);
            continue;
          }

          // Create the new class
          await Class.create({
            name,
            faculty_id,
            cohort,
            class_leader_id: classItem.class_leader_id || null,
            advisor_id: classItem.advisor_id || null
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Lỗi khi tạo lớp ${name}: ${error.message}`);
        }
      }

      res.status(201).json({
        status: 'success',
        message: `Import hoàn tất: ${results.success} thành công, ${results.failed} thất bại.`,
        results
      });
    } catch (err) {
      console.error('Import classes error:', err);
      res.status(500).json({ message: 'Lỗi máy chủ khi import lớp.' });
    }
  }

  static async updateClass(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { name, faculty_id, cohort, class_leader_id, advisor_id } = req.body;
      const classItem = await Class.findByPk(req.params.id);
      if (!classItem) {
        return res.status(404).json({ message: 'Không tìm thấy lớp.' });
      }

      const oldClassLeaderId = classItem.class_leader_id;
      await classItem.update({ name, faculty_id, cohort, class_leader_id, advisor_id }, { transaction });
      if (class_leader_id && class_leader_id !== oldClassLeaderId) {
        const student = await Student.findByPk(class_leader_id, { transaction });
        if (student) {
          const [classleaderRole] = await sequelize.query(
            "SELECT id FROM roles WHERE name = 'classleader'",
            { type: sequelize.QueryTypes.SELECT, transaction }
          );
          
          if (classleaderRole && classleaderRole.id) {
            await sequelize.query(
              "UPDATE users SET role_id = ? WHERE id = ?",
              { 
                replacements: [classleaderRole.id, student.user_id],
                type: sequelize.QueryTypes.UPDATE,
                transaction
              }
            );
          }
        }
      }
      
      if (oldClassLeaderId && oldClassLeaderId !== class_leader_id) {
        const oldStudent = await Student.findByPk(oldClassLeaderId, { transaction });
        if (oldStudent) {
          const [studentRole] = await sequelize.query(
            "SELECT id FROM roles WHERE name = 'student'",
            { type: sequelize.QueryTypes.SELECT, transaction }
          );
          
          if (studentRole && studentRole.id) {
            await sequelize.query(
              "UPDATE users SET role_id = ? WHERE id = ?",
              { 
                replacements: [studentRole.id, oldStudent.user_id],
                type: sequelize.QueryTypes.UPDATE,
                transaction
              }
            );
          }
        }
      }
      
      await transaction.commit();
      res.status(200).json({ status: 'success', data: { class: classItem } });
    } catch (err) {
      await transaction.rollback();
      console.error("Error updating class:", err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async deleteClass(req, res) {
    try {
      const classItem = await Class.findByPk(req.params.id);
      if (!classItem) {
        return res.status(404).json({ message: 'Không tìm thấy lớp.' });
      }

      await classItem.destroy();
      res.status(200).json({ status: 'success', message: 'Đã xóa lớp thành công.' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getStudentsAndAdvisorByClassId(req, res) {
    try {
      const classId = req.params.classId;

      const classItem = await Class.findByPk(classId, {
        include: [
          {
            model: Advisor,
            attributes: ['id', 'name'],
          },
          {
            model: Student,
            attributes: ['student_id', 'student_name', 'phone', 'birthdate', 'status', 'classification', 'sumscore'],
          }
        ]
      });

      if (!classItem) {
        return res.status(404).json({ message: 'Không tìm thấy lớp.' });
      }

      res.status(200).json({
        status: 'success',
        data: {
          advisor: classItem.Advisor,
          students: classItem.Students
        }
      });
    } catch (err) {
      console.error('Error fetching students and advisor:', err);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách sinh viên và cố vấn.' });
    }
  }

  static async getStudentsByClassId(req, res) {
    try {
      const classId = req.params.id;
      
      const students = await Student.findAll({
        where: { class_id: classId },
        attributes: ['student_id', 'student_name', 'phone', 'birthdate', 'status', 'classification', 'sumscore'],
      });

      if (!students) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Không tìm thấy sinh viên trong lớp này.' 
        });
      }

      res.status(200).json({
        status: 'success',
        data: { students }
      });
    } catch (err) {
      console.error('Error fetching students by class ID:', err);
      res.status(500).json({ 
        status: 'error',
        message: 'Lỗi máy chủ khi lấy danh sách sinh viên.' 
      });
    }
  }
}

module.exports = ClassController;
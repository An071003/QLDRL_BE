const Class = require('../models/class.model');
const Faculty = require('../models/faculty.model');
const Advisor = require('../models/advisor.model')
const Student = require('../models/student.model')
const { User, Role } = require('../models');
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
    const transaction = await sequelize.transaction();
    
    try {
      const { name, faculty_id, cohort, class_leader_id, advisor_id } = req.body;
      const newClass = await Class.create({ 
        name, 
        faculty_id, 
        cohort, 
        class_leader_id, 
        advisor_id 
      }, { transaction });

      // If a class leader is specified, update their role
      if (class_leader_id) {
        // Get the student and classleader roles
        const classLeaderRole = await Role.findOne({ 
          where: { name: 'classleader' },
          transaction
        });
        
        if (!classLeaderRole) {
          await transaction.rollback();
          return res.status(500).json({ message: 'Không tìm thấy vai trò classleader.' });
        }

        // Find the student and update their role
        const leaderStudent = await Student.findByPk(class_leader_id, { transaction });
        if (leaderStudent) {
          await User.update(
            { role_id: classLeaderRole.id },
            { 
              where: { id: leaderStudent.user_id },
              transaction
            }
          );
        }
      }

      await transaction.commit();
      res.status(201).json({ status: 'success', data: { class: newClass } });
    } catch (err) {
      await transaction.rollback();
      console.error('Error creating class:', err);
      res.status(500).json({ message: 'Lỗi máy chủ khi tạo lớp học.' });
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

      // Get the classleader role once
      const classLeaderRole = await Role.findOne({ where: { name: 'classleader' } });
      if (!classLeaderRole) {
        return res.status(500).json({ 
          message: 'Không tìm thấy vai trò classleader. Vui lòng kiểm tra cấu hình hệ thống.'
        });
      }

      // Process each class one by one
      for (const classItem of classes) {
        const { name, faculty_id, cohort, class_leader_id } = classItem;
        const transaction = await sequelize.transaction();

        // Validate required fields
        if (!name || !faculty_id || !cohort) {
          results.failed++;
          results.errors.push(`Lớp thiếu thông tin bắt buộc: ${name || 'Không có tên'}`);
          continue;
        }

        try {
          // Check if faculty exists
          const faculty = await Faculty.findByPk(faculty_id, { transaction });
          if (!faculty) {
            await transaction.rollback();
            results.failed++;
            results.errors.push(`Không tìm thấy khoa với ID: ${faculty_id} cho lớp: ${name}`);
            continue;
          }

          // Create the new class
          const newClass = await Class.create({
            name,
            faculty_id,
            cohort,
            class_leader_id: class_leader_id || null,
            advisor_id: classItem.advisor_id || null
          }, { transaction });

          // If a class leader is specified, update their role
          if (class_leader_id) {
            const leaderStudent = await Student.findByPk(class_leader_id, { transaction });
            if (leaderStudent) {
              await User.update(
                { role_id: classLeaderRole.id },
                { 
                  where: { id: leaderStudent.user_id },
                  transaction
                }
              );
            }
          }

          await transaction.commit();
          results.success++;
        } catch (error) {
          await transaction.rollback();
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
      const classItem = await Class.findByPk(req.params.id, { transaction });
      if (!classItem) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Không tìm thấy lớp.' });
      }

      // Check if class leader is being changed
      const isClassLeaderChanged = classItem.class_leader_id !== class_leader_id;
      
      if (isClassLeaderChanged) {
        // Get the student and classleader roles
        const studentRole = await Role.findOne({ 
          where: { name: 'student' },
          transaction
        });
        
        const classLeaderRole = await Role.findOne({ 
          where: { name: 'classleader' },
          transaction
        });
        
        if (!studentRole || !classLeaderRole) {
          await transaction.rollback();
          return res.status(500).json({ message: 'Không tìm thấy vai trò cần thiết.' });
        }

        // If there was a previous class leader, revert their role to student
        if (classItem.class_leader_id) {
          const oldLeaderStudent = await Student.findByPk(classItem.class_leader_id, { transaction });
          if (oldLeaderStudent) {
            await User.update(
              { role_id: studentRole.id },
              { 
                where: { id: oldLeaderStudent.user_id },
                transaction
              }
            );
          }
        }

        // If a new class leader is set, update their role
        if (class_leader_id) {
          const newLeaderStudent = await Student.findByPk(class_leader_id, { transaction });
          if (newLeaderStudent) {
            await User.update(
              { role_id: classLeaderRole.id },
              { 
                where: { id: newLeaderStudent.user_id },
                transaction
              }
            );
          }
        }
      }

      await classItem.update({ name, faculty_id, cohort, class_leader_id, advisor_id }, { transaction });
      await transaction.commit();
      
      res.status(200).json({ status: 'success', data: { class: classItem } });
    } catch (err) {
      await transaction.rollback();
      console.error('Error updating class:', err);
      res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật lớp.' });
    }
  }

  static async deleteClass(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const classItem = await Class.findByPk(req.params.id, { transaction });
      if (!classItem) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Không tìm thấy lớp.' });
      }

      // If there is a class leader, revert their role to student
      if (classItem.class_leader_id) {
        const studentRole = await Role.findOne({ 
          where: { name: 'student' },
          transaction
        });
        
        if (studentRole) {
          const leaderStudent = await Student.findByPk(classItem.class_leader_id, { transaction });
          if (leaderStudent) {
            await User.update(
              { role_id: studentRole.id },
              { 
                where: { id: leaderStudent.user_id },
                transaction
              }
            );
          }
        }
      }

      await classItem.destroy({ transaction });
      await transaction.commit();
      
      res.status(200).json({ status: 'success', message: 'Đã xóa lớp thành công.' });
    } catch (err) {
      await transaction.rollback();
      console.error('Error deleting class:', err);
      res.status(500).json({ message: 'Lỗi máy chủ khi xóa lớp.' });
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

  static async setClassLeader(req, res) {
    const { classId } = req.params;
    const { studentId, action } = req.body; // action can be 'set' or 'unset'
    
    if (!classId || !studentId || !action) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Thiếu thông tin bắt buộc (classId, studentId, action).' 
      });
    }

    if (action !== 'set' && action !== 'unset') {
      return res.status(400).json({ 
        status: 'error',
        message: 'Hành động không hợp lệ. Chỉ chấp nhận "set" hoặc "unset".' 
      });
    }

    const transaction = await sequelize.transaction();

    try {
      // Get the class
      const classItem = await Class.findByPk(classId, { transaction });
      if (!classItem) {
        await transaction.rollback();
        return res.status(404).json({ 
          status: 'error',
          message: 'Không tìm thấy lớp.' 
        });
      }

      // Get the student
      const student = await Student.findByPk(studentId, { transaction });
      if (!student) {
        await transaction.rollback();
        return res.status(404).json({ 
          status: 'error',
          message: 'Không tìm thấy sinh viên.' 
        });
      }

      // Verify the student belongs to the class
      if (student.class_id != classId) {
        await transaction.rollback();
        return res.status(400).json({ 
          status: 'error',
          message: 'Sinh viên không thuộc lớp này.' 
        });
      }

      // Get the student role and class leader role
      const studentRole = await Role.findOne({ 
        where: { name: 'student' },
        transaction
      });
      
      const classLeaderRole = await Role.findOne({ 
        where: { name: 'classleader' },
        transaction
      });
      
      if (!studentRole || !classLeaderRole) {
        await transaction.rollback();
        return res.status(500).json({ 
          status: 'error',
          message: 'Không tìm thấy vai trò (student hoặc classleader). Vui lòng kiểm tra cấu hình hệ thống.' 
        });
      }

      if (action === 'set') {
        // If we are setting a new class leader, we need to unset the old one (if exists)
        if (classItem.class_leader_id && classItem.class_leader_id !== studentId) {
          const oldLeaderStudent = await Student.findByPk(classItem.class_leader_id, { transaction });
          if (oldLeaderStudent) {
            // Update the old leader's role back to student
            await User.update(
              { role_id: studentRole.id },
              { 
                where: { id: oldLeaderStudent.user_id },
                transaction
              }
            );
          }
        }

        // Update the class with the new leader
        await classItem.update({ class_leader_id: studentId }, { transaction });
        
        // Update the student's role to class leader
        await User.update(
          { role_id: classLeaderRole.id },
          { 
            where: { id: student.user_id },
            transaction
          }
        );
      } else {
        // action is 'unset'
        // Only unset if this student is the current class leader
        if (classItem.class_leader_id === studentId) {
          // Remove the class leader from the class
          await classItem.update({ class_leader_id: null }, { transaction });
          
          // Update the student's role back to student
          await User.update(
            { role_id: studentRole.id },
            { 
              where: { id: student.user_id },
              transaction
            }
          );
        } else {
          await transaction.rollback();
          return res.status(400).json({ 
            status: 'error',
            message: 'Sinh viên này không phải lớp trưởng hiện tại.' 
          });
        }
      }

      await transaction.commit();
      
      return res.status(200).json({
        status: 'success',
        message: action === 'set' 
          ? 'Đã thiết lập lớp trưởng thành công.' 
          : 'Đã hủy vai trò lớp trưởng thành công.'
      });
    } catch (err) {
      await transaction.rollback();
      console.error('Error setting class leader:', err);
      return res.status(500).json({ 
        status: 'error',
        message: 'Lỗi máy chủ khi cập nhật lớp trưởng.' 
      });
    }
  }
}

module.exports = ClassController;
const { Class } = require('../models');
const Faculty = require('../models/faculty.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');

class FacultyController {
  static async getAllFaculties(req, res) {
    try {
      const faculties = await sequelize.query(`
        SELECT 
          f.*,
          COALESCE(class_count.count, 0) as class_count
        FROM faculties f
        LEFT JOIN (
          SELECT 
            faculty_id,
            COUNT(*) as count
          FROM classes
          GROUP BY faculty_id
        ) class_count ON f.id = class_count.faculty_id
        ORDER BY f.id
      `, {
        type: QueryTypes.SELECT
      });
      
      res.status(200).json({ status: 'success', data: { faculties } });
    } catch (err) {
      console.error('Error fetching faculties with class count:', err);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getFacultyById(req, res) {
    try {
      const faculty = await Faculty.findByPk(req.params.id);
      if (!faculty) {
        return res.status(404).json({ message: 'Không tìm thấy khoa.' });
      }
      res.status(200).json({ status: 'success', data: { faculty } });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async createFaculty(req, res) {
    try {
      const { faculty_abbr, name } = req.body;
      const existing = await Faculty.findOne({ where: { faculty_abbr } });
      if (existing) {
        return res.status(400).json({ message: 'Tên viết tắt đã tồn tại.' });
      }
      const newFaculty = await Faculty.create({ faculty_abbr, name });
      res.status(201).json({ status: 'success', data: { faculty: newFaculty } });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async importFaculties(req, res) {
    try {
      const faculties = req.body;

      if (!Array.isArray(faculties) || faculties.length === 0) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ. Yêu cầu một mảng các khoa.' });
      }

      const results = {
        success: 0,
        failed: 0,
        duplicates: [],
      };

      // Process each faculty one by one to handle duplicates properly
      for (const faculty of faculties) {
        const { faculty_abbr, name } = faculty;

        // Validate required fields
        if (!faculty_abbr || !name) {
          results.failed++;
          continue;
        }

        try {
          // Check for existing faculty with the same abbreviation
          const existing = await Faculty.findOne({ where: { faculty_abbr } });
          if (existing) {
            results.duplicates.push(faculty_abbr);
            results.failed++;
            continue;
          }

          // Create the new faculty
          await Faculty.create({ faculty_abbr, name });
          results.success++;
        } catch (error) {
          results.failed++;
        }
      }

      res.status(201).json({
        status: 'success',
        message: `Import hoàn tất: ${results.success} thành công, ${results.failed} thất bại.`,
        results
      });
    } catch (err) {
      console.error('Import faculties error:', err);
      res.status(500).json({ message: 'Lỗi máy chủ khi import khoa.' });
    }
  }

  static async updateFaculty(req, res) {
    try {
      const { faculty_abbr, name } = req.body;
      const faculty = await Faculty.findByPk(req.params.id);
      if (!faculty) {
        return res.status(404).json({ message: 'Không tìm thấy khoa.' });
      }

      await faculty.update({ faculty_abbr, name });
      res.status(200).json({ status: 'success', data: { faculty } });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async deleteFaculty(req, res) {
    try {
      const faculty = await Faculty.findByPk(req.params.id);
      if (!faculty) {
        return res.status(404).json({ message: 'Không tìm thấy khoa.' });
      }

      await faculty.destroy();
      res.status(200).json({ status: 'success', message: 'Đã xóa khoa thành công.' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  }

  static async getClassesByFacultyId(req, res) {
    try {
      const facultyId = req.params.facultyId;

      const faculty = await Faculty.findByPk(facultyId);
      if (!faculty) {
        return res.status(404).json({ message: 'Không tìm thấy khoa.' });
      }

      const classes = await Class.findAll({ where: { faculty_id: facultyId } });

      res.status(200).json({ status: 'success', data: { classes } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách lớp.' });
    }
  }
}

module.exports = FacultyController;
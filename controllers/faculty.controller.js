const Faculty = require('../models/faculty.model');

class FacultyController {
  static async getAllFaculties(req, res) {
    try {
      const faculties = await Faculty.findAll();
      res.status(200).json({ status: 'success', data: { faculties } });
    } catch (err) {
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
}

module.exports = FacultyController;
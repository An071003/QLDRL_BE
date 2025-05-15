const Class = require('../models/class.model');
const Faculty = require('../models/faculty.model');

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

  static async updateClass(req, res) {
    try {
      const { name, faculty_id, cohort, class_leader_id, advisor_id } = req.body;
      const classItem = await Class.findByPk(req.params.id);
      if (!classItem) {
        return res.status(404).json({ message: 'Không tìm thấy lớp.' });
      }

      await classItem.update({ name, faculty_id, cohort, class_leader_id, advisor_id });
      res.status(200).json({ status: 'success', data: { class: classItem } });
    } catch (err) {
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
}

module.exports = ClassController;
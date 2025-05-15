const { Criteria, User } = require("../models");

class CriteriaController {
  static async getAllCriteria(req, res) {
    try {
      const criteria = await Criteria.findAll();
      res.status(200).json({ status: "success", data: { criteria } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCriterionById(req, res) {
    const { id } = req.params;
    try {
      const criterion = await Criteria.findOne({
        where: { id },
        include: [{ model: User, attributes: ['user_name', 'email'] }]
      });
      if (!criterion) {
        return res.status(404).json({ message: "Tiêu chí không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { criterion } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createCriterion(req, res) {
    const { name, max_score } = req.body;
    const created_by = req.user.id;

    try {
      if (!name || !max_score) {
        return res.status(400).json({ message: "Thiếu thông tin." });
      }

      const newCriterion = await Criteria.create({ name, max_score, created_by });

      res.status(201).json({ status: "success", data: { criterion: newCriterion } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateCriterion(req, res) {
    const { id } = req.params;
    const { name, max_score } = req.body;

    try {
      const criterion = await Criteria.findByPk(id);
      if (!criterion) {
        return res.status(404).json({ message: "Tiêu chí không tồn tại." });
      }
      await criterion.update({ name, max_score });

      res.status(200).json({ status: "success", message: "Cập nhật tiêu chí thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async deleteCriterion(req, res) {
    const { id } = req.params;

    try {
      const criterion = await Criteria.findByPk(id);
      if (!criterion) {
        return res.status(404).json({ message: "Tiêu chí không tồn tại." });
      }
      await criterion.destroy();

      res.status(200).json({ status: "success", message: "Xóa tiêu chí thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = CriteriaController;
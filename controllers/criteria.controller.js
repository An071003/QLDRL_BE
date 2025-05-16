const { Criteria } = require("../models");

class CriteriaController {
  static async getAllCriteria(req, res) {
    try {
      const criteria = await Criteria.findAll({
        attributes: ['id', 'name', 'max_score', 'created_by']
      });
      res.status(200).json({ status: "success", data: { criteria } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCriteriaById(req, res) {
    const { id } = req.params;
    try {
      const criterion = await Criteria.findByPk(id, {
        attributes: ['id', 'name', 'max_score', 'created_by']
      });
      if (!criterion) {
        return res.status(404).json({ message: "Tiêu chí không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { criterion } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createCriteria(req, res) {
    const { name, max_score } = req.body;
    const created_by = req.user.id;

    try {
      if (!name || !max_score || !created_by) {
        return res.status(400).json({ message: "Thiếu thông tin." });
      }

      const newCriterion = await Criteria.create({ name, max_score, created_by });

      res.status(201).json({ status: "success", data: { criterion: newCriterion } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateCriteria(req, res) {
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

  static async deleteCriteria(req, res) {
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

  static async importCriteria(req, res) {
    const criteriaList = req.body;

    // Đảm bảo truyền lên là mảng có phần tử
    if (!Array.isArray(criteriaList) || criteriaList.length === 0) {
      return res.status(400).json({ message: "Danh sách tiêu chí không hợp lệ." });
    }

    try {
      const validCriteria = [];
      const failed = [];
      const created_by = req.user && req.user.id ? req.user.id : null;

      for (const criterion of criteriaList) {
        const { name, max_score } = criterion;

        // Validate các trường cần thiết giống như create
        if (!name || max_score === undefined || !created_by) {
          failed.push({ criterion, reason: "Thiếu thông tin." });
          continue;
        }

        const maxScoreNum = Number(max_score);
        if (isNaN(maxScoreNum) || maxScoreNum < 0) {
          failed.push({ criterion, reason: "Điểm tối đa phải là số không âm." });
          continue;
        }

        validCriteria.push({
          name,
          max_score: maxScoreNum,
          created_by
        });
      }

      if (validCriteria.length === 0) {
        return res.status(400).json({
          status: "failed",
          message: "Không có tiêu chí hợp lệ để import.",
          data: { failed }
        });
      }

      const insertedCriteria = await Criteria.bulkCreate(validCriteria);

      res.status(201).json({
        status: failed.length === 0 ? "success" : "partial",
        message: `Tạo ${insertedCriteria.length} tiêu chí thành công, ${failed.length} thất bại.`,
        data: { insertedCriteria, failed }
      });

    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ khi import tiêu chí." });
    }
  }

}

module.exports = CriteriaController;

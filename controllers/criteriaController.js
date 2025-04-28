// controllers/criteriaController.js
const db = require('../config/db');
const Criteria = require("../models/criteriaModel");

class CriteriaController {
  static async getAllCriteria(req, res) {
    try {
      const criterias = await Criteria.selectAllCriteria();
      res.status(200).json({ status: "success", data: { criterias } });
    } catch (err) {
      console.error("Error fetching criterias:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCriteriaById(req, res) {
    const { id } = req.params;
    try {
      const criteria = await Criteria.findById(id);
      if (!criteria) {
        return res.status(404).json({ message: "Tiêu chí không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { criteria } });
    } catch (err) {
      console.error("Error fetching criteria by id:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createCriteria(req, res) {
    const { name, max_score } = req.body;
    try {
      await Criteria.createCriteria({ name, max_score });
      res.status(201).json({ status: "success", message: "Tạo tiêu chí thành công." });
    } catch (err) {
      console.error("Error creating criteria:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateCriteria(req, res) {
    const { id } = req.params;
    const { name, max_score } = req.body;
    try {
      const criteria = await Criteria.findById(id);
      if (!criteria) {
        return res.status(404).json({ message: "Tiêu chí không tồn tại." });
      }
      await Criteria.updateCriteria(id, name, max_score);
      res.status(200).json({ status: "success", message: "Cập nhật tiêu chí thành công." });
    } catch (err) {
      console.error("Error updating criteria:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async deleteCriteria(req, res) {
    const { id } = req.params;
    try {
      const criteria = await Criteria.findById(id);
      if (!criteria) {
        return res.status(404).json({ message: "Tiêu chí không tồn tại." });
      }
      await Criteria.deleteCriteria(id);
      res.status(200).json({ status: "success", message: "Xóa tiêu chí thành công." });
    } catch (err) {
      console.error("Error deleting criteria:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async importCriteria(req, res) {
    const criterias = req.body;
    if (!Array.isArray(criterias) || criterias.length === 0) {
      return res.status(400).json({ message: "Danh sách tiêu chí không hợp lệ." });
    }

    try {
      for (const { name, max_score } of criterias) {
        if (!name || typeof max_score !== "number") continue;
        await Criteria.createCriteria({ name, max_score });
      }
      res.status(201).json({ status: "success", message: "Import tiêu chí thành công." });
    } catch (err) {
      console.error("Error importing criterias:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = CriteriaController;

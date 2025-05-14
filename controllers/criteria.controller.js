const { Criteria } = require("../models");

class CriteriaController {
  // Get all criteria
  static async getAllCriteria(req, res) {
    try {
      const criteria = await Criteria.findAll();
      res.status(200).json({ criteria });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Get a criterion by ID
  static async getCriterionById(req, res) {
    try {
      const { id } = req.params;
      const criterion = await Criteria.findByPk(id);
      if (!criterion) {
        return res.status(404).json({ message: "Criterion not found" });
      }
      res.status(200).json({ criterion });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Create a new criterion
  static async createCriterion(req, res) {
    try {
      const { name, max_score } = req.body;
      const newCriterion = await Criteria.create({ name, max_score });
      res.status(201).json({ criterion: newCriterion });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Update a criterion
  static async updateCriterion(req, res) {
    try {
      const { id } = req.params;
      const { name, max_score } = req.body;
      const criterion = await Criteria.findByPk(id);
      if (!criterion) {
        return res.status(404).json({ message: "Criterion not found" });
      }
      await criterion.update({ name, max_score });
      res.status(200).json({ criterion });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Delete a criterion
  static async deleteCriterion(req, res) {
    try {
      const { id } = req.params;
      const criterion = await Criteria.findByPk(id);
      if (!criterion) {
        return res.status(404).json({ message: "Criterion not found" });
      }
      await criterion.destroy();
      res.status(200).json({ message: "Criterion deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = CriteriaController;

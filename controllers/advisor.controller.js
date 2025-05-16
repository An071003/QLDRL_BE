const { Advisor } = require("../models");

class AdvisorController {
  // Get all advisors
  static async getAllAdvisors(req, res) {
    try {
      const advisors = await Advisor.findAll();
      res.status(200).json({ advisors });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Get an advisor by ID
  static async getAdvisorById(req, res) {
    try {
      const { id } = req.params;
      const advisor = await Advisor.findByPk(id);
      if (!advisor) {
        return res.status(404).json({ message: "Advisor not found" });
      }
      res.status(200).json({ advisor });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Create a new advisor
  static async createAdvisor(req, res) {
    try {
      const { name, faculty_id } = req.body;
      const newAdvisor = await Advisor.create({ name, faculty_id });
      res.status(201).json({ advisor: newAdvisor });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Update an advisor
  static async updateAdvisor(req, res) {
    try {
      const { id } = req.params;
      const { name, faculty_id } = req.body;
      const advisor = await Advisor.findByPk(id);
      if (!advisor) {
        return res.status(404).json({ message: "Advisor not found" });
      }
      await advisor.update({ name, faculty_id });
      res.status(200).json({ advisor });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Delete an advisor
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
}

module.exports = AdvisorController;
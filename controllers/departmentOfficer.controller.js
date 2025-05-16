const { DepartmentOfficer } = require("../models");

class DepartmentOfficerController {
  // Get all department officers
  static async getAllDepartmentOfficers(req, res) {
    try {
      const officers = await DepartmentOfficer.findAll();
      res.status(200).json({ officers });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Get a department officer by ID
  static async getDepartmentOfficerById(req, res) {
    try {
      const { id } = req.params;
      const officer = await DepartmentOfficer.findByPk(id);
      if (!officer) {
        return res.status(404).json({ message: "Department officer not found" });
      }
      res.status(200).json({ officer });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Create a new department officer
  static async createDepartmentOfficer(req, res) {
    try {
      const { name, department_id } = req.body;
      const newOfficer = await DepartmentOfficer.create({ name, department_id });
      res.status(201).json({ officer: newOfficer });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Update a department officer
  static async updateDepartmentOfficer(req, res) {
    try {
      const { id } = req.params;
      const { name, department_id } = req.body;
      const officer = await DepartmentOfficer.findByPk(id);
      if (!officer) {
        return res.status(404).json({ message: "Department officer not found" });
      }
      await officer.update({ name, department_id });
      res.status(200).json({ officer });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Delete a department officer
  static async deleteDepartmentOfficer(req, res) {
    try {
      const { id } = req.params;
      const officer = await DepartmentOfficer.findByPk(id);
      if (!officer) {
        return res.status(404).json({ message: "Department officer not found" });
      }
      await officer.destroy();
      res.status(200).json({ message: "Department officer deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = DepartmentOfficerController;
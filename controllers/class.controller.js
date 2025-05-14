const { Class } = require("../models");

class ClassController {
  // Get all classes
  static async getAllClasses(req, res) {
    try {
      const classes = await Class.findAll();
      res.status(200).json({ classes });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Get a class by ID
  static async getClassById(req, res) {
    try {
      const { id } = req.params;
      const classData = await Class.findByPk(id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.status(200).json({ class: classData });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Create a new class
  static async createClass(req, res) {
    try {
      const { name, advisor_id } = req.body;
      const newClass = await Class.create({ name, advisor_id });
      res.status(201).json({ class: newClass });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Update a class
  static async updateClass(req, res) {
    try {
      const { id } = req.params;
      const { name, advisor_id } = req.body;
      const classData = await Class.findByPk(id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      await classData.update({ name, advisor_id });
      res.status(200).json({ class: classData });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Delete a class
  static async deleteClass(req, res) {
    try {
      const { id } = req.params;
      const classData = await Class.findByPk(id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      await classData.destroy();
      res.status(200).json({ message: "Class deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = ClassController;
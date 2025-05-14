const { Faculty } = require("../models");

class FacultyController {
  // Get all faculties
  static async getAllFaculties(req, res) {
    try {
      const faculties = await Faculty.findAll();
      res.status(200).json({ faculties });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Get a faculty by ID
  static async getFacultyById(req, res) {
    try {
      const { id } = req.params;
      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      res.status(200).json({ faculty });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Create a new faculty
  static async createFaculty(req, res) {
    try {
      const { name } = req.body;
      const newFaculty = await Faculty.create({ name });
      res.status(201).json({ faculty: newFaculty });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Update a faculty
  static async updateFaculty(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      await faculty.update({ name });
      res.status(200).json({ faculty });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Delete a faculty
  static async deleteFaculty(req, res) {
    try {
      const { id } = req.params;
      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      await faculty.destroy();
      res.status(200).json({ message: "Faculty deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = FacultyController;
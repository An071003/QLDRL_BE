const { Activity } = require("../models");

class ActivityController {
  // Get all activities
  static async getAllActivities(req, res) {
    try {
      const activities = await Activity.findAll();
      res.status(200).json({ activities });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Get an activity by ID
  static async getActivityById(req, res) {
    try {
      const { id } = req.params;
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.status(200).json({ activity });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Create a new activity
  static async createActivity(req, res) {
    try {
      const { name, description, start_date, end_date, max_score } = req.body;
      const newActivity = await Activity.create({
        name,
        description,
        start_date,
        end_date,
        max_score,
      });
      res.status(201).json({ activity: newActivity });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Update an activity
  static async updateActivity(req, res) {
    try {
      const { id } = req.params;
      const { name, description, start_date, end_date, max_score } = req.body;
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      await activity.update({
        name,
        description,
        start_date,
        end_date,
        max_score,
      });
      res.status(200).json({ activity });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Delete an activity
  static async deleteActivity(req, res) {
    try {
      const { id } = req.params;
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      await activity.destroy();
      res.status(200).json({ message: "Activity deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = ActivityController;

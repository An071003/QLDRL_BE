const db = require("../config/db");
const Activity = require("../models/activityModel");

class ActivityController {
  static async getAllActivities(req, res) {
    try {
      const activities = await Activity.selectAllActivities();
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      console.error("Error fetching activities:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getActivityById(req, res) {
    const { id } = req.params;
    try {
      const activity = await Activity.findById(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { activity } });
    } catch (err) {
      console.error("Error fetching activity by id:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createActivity(req, res) {
    const { name, point, campaign_id, is_negative, negativescore } = req.body;
    try {
      await Activity.createActivity({ name, point, campaign_id, is_negative, negativescore });
      res.status(201).json({ status: "success", message: "Tạo hoạt động thành công." });
    } catch (err) {
      console.error("Error creating activity:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateActivity(req, res) {
    const { id } = req.params;
    const { name, point, campaign_id, negativescore, status } = req.body;

    try {
      const activity = await Activity.findById(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }

      await Activity.updateActivity(id, { name, point, campaign_id, negativescore, status });
      res.status(200).json({ status: "success", message: "Cập nhật hoạt động thành công." });
    } catch (err) {
      console.error("Error updating activity:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async deleteActivity(req, res) {
    const { id } = req.params;
    try {
      const activity = await Activity.findById(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }
      await Activity.deleteActivity(id);
      res.status(200).json({ status: "success", message: "Xóa hoạt động thành công." });
    } catch (err) {
      console.error("Error deleting activity:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async importActivities(req, res) {
    const activities = req.body;
    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({ message: "Danh sách hoạt động không hợp lệ." });
    }

    try {
      for (const { name, point, campaign_id, is_negative, negativescore, status } of activities) {
        if (!name || typeof point !== "number" || !campaign_id) continue;
        await Activity.createActivity({ name, point, campaign_id, is_negative, negativescore });
      }
      res.status(201).json({ status: "success", message: "Import hoạt động thành công." });
    } catch (err) {
      console.error("Error importing activities:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = ActivityController;

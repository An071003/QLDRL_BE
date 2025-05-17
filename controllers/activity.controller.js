const { Activity } = require("../models");

class ActivityController {
  // Lấy tất cả hoạt động
  static async getAllActivities(req, res) {
    try {
      const activities = await Activity.findAll({
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ]
      });
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Lấy hoạt động theo ID
  static async getActivityById(req, res) {
    const { id } = req.params;
    try {
      const activity = await Activity.findByPk(id, {
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ]
      });
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { activity } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Tạo hoạt động mới
  static async createActivity(req, res) {
    const {
      campaign_id, name, point, max_participants,
      registration_start, registration_end, approver_id, approved_at
    } = req.body;
    const created_by = req.user.id;

    try {
      if (
        !campaign_id || !name || point === undefined ||
        max_participants === undefined || !registration_start ||
        !registration_end || !created_by
      ) {
        return res.status(400).json({ message: "Thiếu thông tin." });
      }

      const newActivity = await Activity.create({
        campaign_id, name, point, max_participants,
        registration_start, registration_end,
        created_by,
        status: "ongoing", // default nếu chưa truyền
        approver_id: approver_id || null,
        approved_at: approved_at || null
      });

      res.status(201).json({ status: "success", data: { activity: newActivity } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Cập nhật hoạt động
  static async updateActivity(req, res) {
    const { id } = req.params;
    const {
      campaign_id, name, point, max_participants,
      registration_start, registration_end, status,
      approver_id, approved_at
    } = req.body;

    try {
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }
      await activity.update({
        campaign_id, name, point, max_participants,
        registration_start, registration_end,
        status,
        approver_id,
        approved_at
      });

      res.status(200).json({ status: "success", message: "Cập nhật hoạt động thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Xóa hoạt động
  static async deleteActivity(req, res) {
    const { id } = req.params;
    try {
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }
      await activity.destroy();
      res.status(200).json({ status: "success", message: "Xóa hoạt động thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Import activities (import from Excel/JSON)
  static async importActivities(req, res) {
    const activityList = req.body;

    if (!Array.isArray(activityList) || activityList.length === 0) {
      return res.status(400).json({ message: "Danh sách hoạt động không hợp lệ." });
    }

    try {
      const validActivities = [];
      const failed = [];
      const created_by = req.user && req.user.id ? req.user.id : null;

      for (const a of activityList) {
        const {
          campaign_id, name, point, max_participants,
          registration_start, registration_end,
          approver_id, approved_at, status
        } = a;

        // Kiểm tra bắt buộc các trường chính như createActivity
        if (
          !campaign_id || !name || point === undefined ||
          max_participants === undefined || !registration_start ||
          !registration_end || !created_by
        ) {
          failed.push({ activity: a, reason: "Thiếu thông tin." });
          continue;
        }

        // Có thể kiểm tra thêm point/max_participants là số >= 0 nếu muốn
        const pointNum = Number(point);
        const maxPartNum = Number(max_participants);

        if (isNaN(pointNum) || pointNum < 0) {
          failed.push({ activity: a, reason: "Điểm phải là số không âm." });
          continue;
        }

        if (isNaN(maxPartNum) || maxPartNum < 0) {
          failed.push({ activity: a, reason: "Số lượng tham gia tối đa phải là số không âm." });
          continue;
        }

        validActivities.push({
          campaign_id, name, point: pointNum, max_participants: maxPartNum,
          registration_start, registration_end, created_by,
          status: status || 'ongoing',
          approver_id: approver_id || null,
          approved_at: approved_at || null
        });
      }

      if (validActivities.length === 0) {
        return res.status(400).json({
          status: "failed",
          message: "Không có hoạt động hợp lệ để import.",
          data: { failed }
        });
      }

      const insertedActivities = await Activity.bulkCreate(validActivities);

      res.status(201).json({
        status: failed.length === 0 ? "success" : "partial",
        message: `Tạo ${insertedActivities.length} hoạt động thành công, ${failed.length} thất bại.`,
        data: { insertedActivities, failed }
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ khi import hoạt động." });
    }
  }

}

module.exports = ActivityController;

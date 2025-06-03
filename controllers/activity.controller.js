const { Activity, User } = require("../models");
const sequelize = require('../config/db');
const { Sequelize } = require("sequelize");

class ActivityController {

  static async getAllActivities(req, res) {
    try {
      const { semester_no, academic_year } = req.query;
      
      // Require semester parameters
      if (!semester_no || !academic_year) {
        return res.status(400).json({ 
          message: "Vui lòng chọn học kỳ để xem danh sách hoạt động." 
        });
      }
      
      const campaignWhereClause = {
        semester_no: parseInt(semester_no),
        academic_year: parseInt(academic_year)
      };
      
      const activities = await Activity.findAll({
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ],
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'Approver',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: sequelize.models.Campaign,
            as: 'Campaign',
            attributes: ['id', 'name', 'semester_no', 'academic_year'],
            required: true, // Require join để filter được
            where: campaignWhereClause
          }
        ]
      });
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getActivityById(req, res) {
    const { id } = req.params;
    try {
      const activity = await Activity.findByPk(id, {
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ],
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'Approver',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: sequelize.models.Campaign,
            as: 'Campaign',
            attributes: ['id', 'name', 'semester_no', 'academic_year'],
            required: false
          }
        ]
      });
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { activity } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getActivitiesByCampaignId(req, res) {
    const { campaignId } = req.params;
    try {
      const activities = await Activity.findAll({
        where: { 
          campaign_id: parseInt(campaignId),
          approver_id: { [Sequelize.Op.ne]: null }
        },
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ],
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'Approver',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: sequelize.models.Campaign,
            as: 'Campaign',
            attributes: ['id', 'name', 'semester_no', 'academic_year'],
            required: false
          }
        ]
      });
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getPendingActivities(req, res) {
    try {
      const activities = await Activity.findAll({
        where: { approver_id: null },
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ],
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: sequelize.models.Campaign,
            as: 'Campaign',
            attributes: ['id', 'name', 'semester_no', 'academic_year'],
            required: false
          }
        ]
      });
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getApprovedActivities(req, res) {
    try {
      const activities = await Activity.findAll({
        where: { approver_id: { [sequelize.Op.ne]: null } },
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ],
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'Approver',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: sequelize.models.Campaign,
            as: 'Campaign',
            attributes: ['id', 'name', 'semester_no', 'academic_year'],
            required: false
          }
        ]
      });
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Phê duyệt hoạt động
  static async approveActivity(req, res) {
    const { id } = req.params;
    const approver_id = req.user.id;

    try {
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }

      await activity.update({
        approver_id,
        approved_at: new Date()
      });

      res.status(200).json({
        status: "success",
        message: "Phê duyệt hoạt động thành công."
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Từ chối hoạt động
  static async rejectActivity(req, res) {
    const { id } = req.params;

    try {
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }

      await activity.destroy();
      res.status(200).json({
        status: "success",
        message: "Từ chối hoạt động thành công."
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Tạo hoạt động mới
  static async createActivity(req, res) {
    const {
      campaign_id, name, point, max_participants,
      registration_start, registration_end
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

      const existingActivity = await Activity.findOne({
        where: { name }
      });

      if (existingActivity) {
        return res.status(409).json({ message: "Hoạt động đã tồn tại." });
      }

      const newActivity = await Activity.create({
        campaign_id,
        name,
        point,
        max_participants,
        registration_start,
        registration_end,
        created_by,
        status: "ongoing",
      });

      res.status(201).json({ status: "success", data: { activity: newActivity } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Cập nhật hoạt động
  static async updateActivity(req, res) {
    const { id } = req.params;
    const {
      campaign_id, name, point, max_participants,
      registration_start, registration_end, status
    } = req.body;
    try {
      const activity = await Activity.findByPk(id);
      if (!activity) {
        return res.status(404).json({ message: "Hoạt động không tồn tại." });
      }

      // Nếu hoạt động đã được phê duyệt, update sẽ xóa approver_id và approved_at
      // để yêu cầu phê duyệt lại
      const updateData = {
        campaign_id,
        name,
        point,
        max_participants,
        registration_start,
        registration_end,
        status
      };

      // Nếu hoạt động đã được phê duyệt trước đó, cần phê duyệt lại sau khi chỉnh sửa
      if (activity.approver_id) {
        updateData.approver_id = null;
        updateData.approved_at = null;
      }

      await activity.update(updateData);

      res.status(200).json({ status: "success", message: "Cập nhật hoạt động thành công." });
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
          registration_start, registration_end, status
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

        const existingActivity = await Activity.findOne({
          where: { name }
        });

        if (existingActivity) {
          failed.push({ activity: a, reason: "Hoạt động đã tồn tại." });
          continue;
        }

        // Có thể kiểm tra thêm point/max_participants là số >= 0 nếu muốn
        const pointNum = Number(point);
        const maxPartNum = Number(max_participants);

        if (isNaN(pointNum)) {
          failed.push({ activity: a, reason: "Điểm phải là số." });
          continue;
        }

        if (isNaN(maxPartNum) || maxPartNum < 0) {
          failed.push({ activity: a, reason: "Số lượng tham gia tối đa phải là số không âm." });
          continue;
        }

        validActivities.push({
          campaign_id,
          name,
          point: pointNum,
          max_participants: maxPartNum,
          registration_start,
          registration_end,
          created_by,
          status: status || 'ongoing'
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
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ khi import hoạt động." });
    }
  }

  static async getCreatedPendingActivities(req, res) {
    const userId = req.user.id;

    try {
      const activities = await Activity.findAll({
        where: {
          created_by: userId,
          approver_id: null
        },
        attributes: [
          'id', 'campaign_id', 'name', 'point', 'max_participants',
          'number_students', 'status', 'registration_start', 'registration_end',
          'approver_id', 'approved_at', 'created_by', 'created_at'
        ],
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'user_name', 'email'],
            required: false
          },
          {
            model: sequelize.models.Campaign,
            as: 'Campaign',
            attributes: ['id', 'name', 'semester_no', 'academic_year'],
            required: false
          }
        ]
      });
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = ActivityController;

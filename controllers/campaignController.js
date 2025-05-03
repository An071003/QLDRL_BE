const db = require('../config/db');
const Campaign = require("../models/campaignModel");
const Semester = require('../models/semesterModel');

class CampaignController {
  static async getAllCampaigns(req, res) {
    try {
      const campaigns = await Campaign.selectAllCampaigns();
      res.status(200).json({ status: "success", data: { campaigns } });
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCampaignById(req, res) {
    const { id } = req.params;
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Chiến dịch không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { campaign } });
    } catch (err) {
      console.error("Error fetching campaign by id:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createCampaign(req, res) {
    const { name, max_score, criteria_id, is_negative, negativescore } = req.body;
    try {
      const semesterResult = await Semester.selectthelastid();
      const semesterId = semesterResult[0]?.id;
      if (!semesterId) {
        return res.status(400).json({ message: "Không tìm thấy học kỳ." });
      }

      await Campaign.createCampaign({ name, max_score, criteria_id, is_negative, negativescore, semester: semesterId });
      res.status(201).json({ status: "success", message: "Tạo chiến dịch thành công." });
    } catch (err) {
      console.error("Error creating campaign:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateCampaign(req, res) {
    const { id } = req.params;
    const { name, max_score, criteria_id, negativescore } = req.body;
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Chiến dịch không tồn tại." });
      }

      await Campaign.updateCampaign(id, { name, max_score, criteria_id, negativescore });
      res.status(200).json({ status: "success", message: "Cập nhật chiến dịch thành công." });
    } catch (err) {
      console.error("Error updating campaign:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async deleteCampaign(req, res) {
    const { id } = req.params;
    try {
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Chiến dịch không tồn tại." });
      }
      await Campaign.deleteCampaign(id);
      res.status(200).json({ status: "success", message: "Xóa chiến dịch thành công." });
    } catch (err) {
      console.error("Error deleting campaign:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async importCampaigns(req, res) {
    const campaigns = req.body;
    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return res.status(400).json({ message: "Danh sách chiến dịch không hợp lệ." });
    }

    try {
      const semesterResult = await Semester.selectthelastid();
      const semesterId = semesterResult[0]?.id;
      if (!semesterId) {
        return res.status(400).json({ message: "Không tìm thấy học kỳ." });
      }

      for (const { name, max_score, criteria_id, is_negative, negativescore } of campaigns) {
        if (!name || typeof max_score !== "number" || !criteria_id) continue;
        await Campaign.createCampaign({ name, max_score, criteria_id, is_negative, negativescore, semester: semesterId });
      }
      res.status(201).json({ status: "success", message: "Import chiến dịch thành công." });
    } catch (err) {
      console.error("Error importing campaigns:", err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = CampaignController;

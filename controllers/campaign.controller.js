const { Campaign } = require("../models");

class CampaignController {
  static async getAllCampaigns(req, res) {
    try {
      const campaigns = await Campaign.findAll({
        attributes: ['id', 'criteria_id', 'name', 'max_score', 'semester_no', 'academic_year', 'created_by']
      });
      res.status(200).json({ status: "success", data: { campaigns } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCampaignById(req, res) {
    const { id } = req.params;
    try {
      const campaign = await Campaign.findByPk(id, {
        attributes: ['id', 'criteria_id', 'name', 'max_score', 'semester_no', 'academic_year', 'created_by']
      });
      if (!campaign) {
        return res.status(404).json({ message: "Chiến dịch không tồn tại." });
      }
      res.status(200).json({ status: "success", data: { campaign } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createCampaign(req, res) {
    const { criteria_id, name, max_score, semester_no, academic_year } = req.body;
    const created_by = req.user.id;

    try {
      if (!criteria_id || !name || !max_score || !semester_no || !academic_year || !created_by) {
        return res.status(400).json({ message: "Thiếu thông tin." });
      }

      const newCampaign = await Campaign.create({ criteria_id, name, max_score, semester_no, academic_year, created_by });

      res.status(201).json({ status: "success", data: { campaign: newCampaign } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateCampaign(req, res) {
    const { id } = req.params;
    const { criteria_id, name, max_score, semester_no, academic_year } = req.body;

    try {
      const campaign = await Campaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({ message: "Chiến dịch không tồn tại." });
      }
      await campaign.update({ criteria_id, name, max_score, semester_no, academic_year });

      res.status(200).json({ status: "success", message: "Cập nhật chiến dịch thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async deleteCampaign(req, res) {
    const { id } = req.params;

    try {
      const campaign = await Campaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({ message: "Chiến dịch không tồn tại." });
      }
      await campaign.destroy();

      res.status(200).json({ status: "success", message: "Xóa chiến dịch thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Import campaign 
  static async importCampaigns(req, res) {
    const campaignList = req.body;

    if (!Array.isArray(campaignList) || campaignList.length === 0) {
      return res.status(400).json({ message: "Danh sách chiến dịch không hợp lệ." });
    }

    try {
      const validCampaigns = [];
      const failed = [];
      const created_by = req.user && req.user.id ? req.user.id : null;

      for (const campaign of campaignList) {
        const { criteria_id, name, max_score, semester_no, academic_year } = campaign;

        // Check required fields (không lấy created_by từ file import)
        if (!criteria_id || !name || max_score === undefined || !semester_no || !academic_year || !created_by) {
          failed.push({ campaign, reason: "Thiếu thông tin bắt buộc." });
          continue;
        }

        // Validate semester_no to ensure it's within valid range (1-3)
        let validSemesterNo = Number(semester_no);
        if (isNaN(validSemesterNo) || validSemesterNo < 1 || validSemesterNo > 3) {
          failed.push({ campaign, reason: "Học kỳ không hợp lệ. Chỉ chấp nhận giá trị 1, 2, hoặc 3." });
          continue;
        }
        validSemesterNo = Math.round(validSemesterNo);

        // Validate max_score
        const validMaxScore = Number(max_score);
        if (isNaN(validMaxScore) || validMaxScore < 0) {
          failed.push({ campaign, reason: "Điểm tối đa phải là số không âm." });
          continue;
        }

        validCampaigns.push({
          criteria_id,
          name,
          max_score: validMaxScore,
          semester_no: validSemesterNo,
          academic_year,
          created_by
        });
      }

      if (validCampaigns.length === 0) {
        return res.status(400).json({
          status: "failed",
          message: "Không có chiến dịch hợp lệ để import.",
          data: { failed }
        });
      }

      const insertedCampaigns = await Campaign.bulkCreate(validCampaigns);

      res.status(201).json({
        status: failed.length === 0 ? "success" : "partial",
        message: `Tạo ${insertedCampaigns.length} chiến dịch thành công, ${failed.length} thất bại.`,
        data: { insertedCampaigns, failed }
      });

    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ khi import chiến dịch." });
    }
  }
}

module.exports = CampaignController;

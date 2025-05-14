const { Campaign } = require("../models");

class CampaignController {
  // Get all campaigns
  static async getAllCampaigns(req, res) {
    try {
      const campaigns = await Campaign.findAll();
      res.status(200).json({ campaigns });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Get a campaign by ID
  static async getCampaignById(req, res) {
    try {
      const { id } = req.params;
      const campaign = await Campaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.status(200).json({ campaign });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Create a new campaign
  static async createCampaign(req, res) {
    try {
      const { name, start_date, end_date } = req.body;
      const newCampaign = await Campaign.create({ name, start_date, end_date });
      res.status(201).json({ campaign: newCampaign });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Update a campaign
  static async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const { name, start_date, end_date } = req.body;
      const campaign = await Campaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      await campaign.update({ name, start_date, end_date });
      res.status(200).json({ campaign });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  // Delete a campaign
  static async deleteCampaign(req, res) {
    try {
      const { id } = req.params;
      const campaign = await Campaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      await campaign.destroy();
      res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

module.exports = CampaignController;

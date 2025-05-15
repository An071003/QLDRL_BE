const express = require("express");
const CampaignController = require("../controllers/campaign.controller");
const router = express.Router();

// Get all campaigns
router.get("/", CampaignController.getAllCampaigns);

// Get a campaign by ID
router.get("/:id", CampaignController.getCampaignById);

// Create a new campaign
router.post("/", CampaignController.createCampaign);

// Update a campaign
router.put("/:id", CampaignController.updateCampaign);

// Delete a campaign
router.delete("/:id", CampaignController.deleteCampaign);

module.exports = router;

const express = require("express");
const CampaignController = require("../controllers/campaign.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all campaigns
router.get("/", authMiddleware, CampaignController.getAllCampaigns);

// Get a campaign by ID
router.get("/:id", authMiddleware, CampaignController.getCampaignById);

// Create a new campaign
router.post("/", authMiddleware, CampaignController.createCampaign);

// Update a campaign
router.put("/:id", authMiddleware, CampaignController.updateCampaign);

// Delete a campaign
router.delete("/:id", authMiddleware, CampaignController.deleteCampaign);

module.exports = router;

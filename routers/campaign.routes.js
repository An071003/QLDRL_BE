const express = require("express");
const CampaignController = require("../controllers/campaign.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all campaigns
router.get("/", authenticateUser, CampaignController.getAllCampaigns);

// Get a campaign by ID
router.get("/:id", authenticateUser, CampaignController.getCampaignById);

// Create a new campaign
router.post("/", authenticateUser, CampaignController.createCampaign);

// Update a campaign
router.put("/:id", authenticateUser, CampaignController.updateCampaign);

// Delete a campaign
router.delete("/:id", authenticateUser, CampaignController.deleteCampaign);

// Import campaigns from an Excel file
router.post('/import', authenticateUser, CampaignController.importCampaigns);

module.exports = router;

const express = require("express");
const CampaignController = require("../controllers/campaign.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all campaigns
router.get("/", authenticateUser, authorizeRoles("admin"), CampaignController.getAllCampaigns);

// Get a campaign by ID
router.get("/:id", authenticateUser, authorizeRoles("admin"), CampaignController.getCampaignById);

// Create a new campaign
router.post("/", authenticateUser, authorizeRoles("admin"), CampaignController.createCampaign);

// Update a campaign
router.put("/:id", authenticateUser, authorizeRoles("admin"), CampaignController.updateCampaign);

// Delete a campaign
router.delete("/:id", authenticateUser, authorizeRoles("admin"), CampaignController.deleteCampaign);

// Import campaigns from an Excel file
router.post('/import', authenticateUser, authorizeRoles('admin'), CampaignController.importCampaigns);

module.exports = router;

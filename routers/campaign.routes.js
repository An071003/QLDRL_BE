const express = require("express");
const CampaignController = require("../controllers/campaign.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('campaign:view'), CampaignController.getAllCampaigns);
router.get("/:id", authenticateUser, authorizePermissions('campaign:view'), CampaignController.getCampaignById);
router.post("/", authenticateUser, authorizePermissions('campaign:create'), CampaignController.createCampaign);
router.put("/:id", authenticateUser, authorizePermissions('campaign:update'), CampaignController.updateCampaign);
router.delete("/:id", authenticateUser, authorizePermissions('campaign:delete'), CampaignController.deleteCampaign);
router.post('/import', authenticateUser, authorizePermissions('campaign:create'), CampaignController.importCampaigns);

module.exports = router;

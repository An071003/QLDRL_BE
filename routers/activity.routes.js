const express = require("express");
const ActivityController = require("../controllers/activity.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('activity:view'), ActivityController.getAllActivities);
router.get("/pending", authenticateUser, authorizePermissions('activity:view'), ActivityController.getPendingActivities);
router.get("/approved", authenticateUser, authorizePermissions('activity:view'), ActivityController.getApprovedActivities);
router.get("/created-pending", authenticateUser, authorizePermissions('activity:view'), ActivityController.getCreatedPendingActivities);
router.get("/campaign/:campaignId", authenticateUser, authorizePermissions('activity:view'), ActivityController.getActivitiesByCampaignId);
router.put("/:id/approve", authenticateUser, authorizePermissions('activity:update'), ActivityController.approveActivity);
router.put("/:id/reject", authenticateUser, authorizePermissions('activity:update'), ActivityController.rejectActivity);
router.get("/:id", authenticateUser, authorizePermissions('activity:view'), ActivityController.getActivityById);
router.post("/", authenticateUser, authorizePermissions('activity:create'), ActivityController.createActivity);
router.put("/:id", authenticateUser, authorizePermissions('activity:update'), ActivityController.updateActivity);
router.delete("/:id", authenticateUser, authorizePermissions('activity:delete'), ActivityController.deleteActivity);
router.post("/import", authenticateUser, authorizePermissions('activity:create'), ActivityController.importActivities);

module.exports = router;

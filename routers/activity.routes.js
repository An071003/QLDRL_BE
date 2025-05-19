const express = require("express");
const ActivityController = require("../controllers/activity.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all activities
router.get("/", authenticateUser, ActivityController.getAllActivities);

// Get pending activities (not approved)
router.get("/pending", authenticateUser, ActivityController.getPendingActivities);

// Get approved activities
router.get("/approved", authenticateUser, ActivityController.getApprovedActivities);

// Get activities created by current user that are pending approval
router.get("/created-pending", authenticateUser, ActivityController.getCreatedPendingActivities);

// Approve an activity
router.put("/:id/approve", authenticateUser, ActivityController.approveActivity);

// Reject an activity
router.put("/:id/reject", authenticateUser, ActivityController.rejectActivity);

// Get an activity by ID
router.get("/:id", authenticateUser, ActivityController.getActivityById);

// Create a new activity
router.post("/", authenticateUser, ActivityController.createActivity);

// Update an activity
router.put("/:id", authenticateUser, ActivityController.updateActivity);

// Delete an activity
router.delete("/:id", authenticateUser, ActivityController.deleteActivity);

// Import activities
router.post("/import", authenticateUser, ActivityController.importActivities);

module.exports = router;

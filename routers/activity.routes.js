const express = require("express");
const ActivityController = require("../controllers/activity.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all activities
router.get("/", authenticateUser, ActivityController.getAllActivities);

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

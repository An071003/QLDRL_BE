const express = require("express");
const ActivityController = require("../controllers/activity.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all activities
router.get("/", authenticateUser, authorizeRoles("admin"), ActivityController.getAllActivities);

// Get an activity by ID
router.get("/:id", authenticateUser, authorizeRoles("admin"), ActivityController.getActivityById);

// Create a new activity
router.post("/", authenticateUser, authorizeRoles("admin"), ActivityController.createActivity);

// Update an activity
router.put("/:id", authenticateUser, authorizeRoles("admin"), ActivityController.updateActivity);

// Delete an activity
router.delete("/:id", authenticateUser, authorizeRoles("admin"), ActivityController.deleteActivity);

// Import activities
router.post("/import", authenticateUser, authorizeRoles("admin"), ActivityController.importActivities);

module.exports = router;

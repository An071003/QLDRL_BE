const express = require("express");
const ActivityController = require("../controllers/activity.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all activities
router.get("/", authMiddleware, ActivityController.getAllActivities);

// Get an activity by ID
router.get("/:id", authMiddleware, ActivityController.getActivityById);

// Create a new activity
router.post("/", authMiddleware, ActivityController.createActivity);

// Update an activity
router.put("/:id", authMiddleware, ActivityController.updateActivity);

// Delete an activity
router.delete("/:id", authMiddleware, ActivityController.deleteActivity);

module.exports = router;

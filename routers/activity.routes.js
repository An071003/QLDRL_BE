const express = require("express");
const ActivityController = require("../controllers/activity.controller");
const router = express.Router();

// Get all activities
router.get("/", ActivityController.getAllActivities);

// Get an activity by ID
router.get("/:id", ActivityController.getActivityById);

// Create a new activity
router.post("/", ActivityController.createActivity);

// Update an activity
router.put("/:id", ActivityController.updateActivity);

// Delete an activity
router.delete("/:id", ActivityController.deleteActivity);

module.exports = router;

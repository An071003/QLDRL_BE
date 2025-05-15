const express = require("express");
const StudentActivityController = require("../controllers/studentactivity.controller");

const router = express.Router();

// Get all student activities
router.get("/", StudentActivityController.getAllStudentActivities);

// Get a student activity by ID
router.get("/:id", StudentActivityController.getStudentActivityById);

// Create a new student activity
router.post("/", StudentActivityController.createStudentActivity);

// Update a student activity
router.put("/:id", StudentActivityController.updateStudentActivity);

// Delete a student activity
router.delete("/:id", StudentActivityController.deleteStudentActivity);

module.exports = router;

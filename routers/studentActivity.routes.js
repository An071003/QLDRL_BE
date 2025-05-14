const express = require("express");
const StudentActivityController = require("../controllers/studentactivity.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all student activities
router.get("/", authMiddleware, StudentActivityController.getAllStudentActivities);

// Get a student activity by ID
router.get("/:id", authMiddleware, StudentActivityController.getStudentActivityById);

// Create a new student activity
router.post("/", authMiddleware, StudentActivityController.createStudentActivity);

// Update a student activity
router.put("/:id", authMiddleware, StudentActivityController.updateStudentActivity);

// Delete a student activity
router.delete("/:id", authMiddleware, StudentActivityController.deleteStudentActivity);

module.exports = router;

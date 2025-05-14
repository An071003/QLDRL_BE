const express = require("express");
const FacultyController = require("../controllers/faculty.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all faculties
router.get("/", authMiddleware, FacultyController.getAllFaculties);

// Get a faculty by ID
router.get("/:id", authMiddleware, FacultyController.getFacultyById);

// Create a new faculty
router.post("/", authMiddleware, FacultyController.createFaculty);

// Update a faculty
router.put("/:id", authMiddleware, FacultyController.updateFaculty);

// Delete a faculty
router.delete("/:id", authMiddleware, FacultyController.deleteFaculty);

module.exports = router;
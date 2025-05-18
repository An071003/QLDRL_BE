const express = require("express");
const FacultyController = require("../controllers/faculty.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all faculties
router.get("/", authenticateUser, FacultyController.getAllFaculties);

// Get a faculty by ID
router.get('/:facultyId/classes', FacultyController.getClassesByFacultyId);
router.get("/:id", FacultyController.getFacultyById);

// Create a new faculty
router.post("/", FacultyController.createFaculty);

// Import faculties from Excel
router.post("/import", FacultyController.importFaculties);

// Update a faculty
router.put("/:id", FacultyController.updateFaculty);

// Delete a faculty
router.delete("/:id", FacultyController.deleteFaculty);

module.exports = router;
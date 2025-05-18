const express = require("express");
const ClassController = require("../controllers/class.controller");
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all classes
router.get("/", ClassController.getAllClasses);

// Get a class by ID
router.get("/:id", ClassController.getClassById);
router.get('/:classId/details', ClassController.getStudentsAndAdvisorByClassId);

// Get students by class ID
router.get("/:id/students", ClassController.getStudentsByClassId);

// Create a new class
router.post("/", ClassController.createClass);

// Update a class
router.put("/:id", ClassController.updateClass);

// Delete a class
router.delete("/:id", ClassController.deleteClass);

module.exports = router;
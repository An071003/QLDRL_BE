const express = require("express");
const ClassController = require("../controllers/class.controller");

const router = express.Router();

// Get all classes
router.get("/", ClassController.getAllClasses);

// Get a class by ID
router.get("/:id", ClassController.getClassById);
router.get('/:classId/details', ClassController.getStudentsAndAdvisorByClassId);
// Create a new class
router.post("/", ClassController.createClass);

// Update a class
router.put("/:id", ClassController.updateClass);

// Delete a class
router.delete("/:id", ClassController.deleteClass);

module.exports = router;
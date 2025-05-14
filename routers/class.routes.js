const express = require("express");
const ClassController = require("../controllers/class.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all classes
router.get("/", authMiddleware, ClassController.getAllClasses);

// Get a class by ID
router.get("/:id", authMiddleware, ClassController.getClassById);

// Create a new class
router.post("/", authMiddleware, ClassController.createClass);

// Update a class
router.put("/:id", authMiddleware, ClassController.updateClass);

// Delete a class
router.delete("/:id", authMiddleware, ClassController.deleteClass);

module.exports = router;
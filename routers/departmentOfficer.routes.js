const express = require("express");
const DepartmentOfficerController = require("../controllers/departmentOfficer.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all department officers
router.get("/", authMiddleware, DepartmentOfficerController.getAllDepartmentOfficers);

// Get a department officer by ID
router.get("/:id", authMiddleware, DepartmentOfficerController.getDepartmentOfficerById);

// Create a new department officer
router.post("/", authMiddleware, DepartmentOfficerController.createDepartmentOfficer);

// Update a department officer
router.put("/:id", authMiddleware, DepartmentOfficerController.updateDepartmentOfficer);

// Delete a department officer
router.delete("/:id", authMiddleware, DepartmentOfficerController.deleteDepartmentOfficer);

module.exports = router;
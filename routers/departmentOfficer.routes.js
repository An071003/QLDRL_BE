const express = require("express");
const DepartmentOfficerController = require("../controllers/departmentOfficer.controller");

const router = express.Router();

// Get all department officers
router.get("/", DepartmentOfficerController.getAllDepartmentOfficers);

// Get a department officer by ID
router.get("/:id", DepartmentOfficerController.getDepartmentOfficerById);

// Create a new department officer
router.post("/", DepartmentOfficerController.createDepartmentOfficer);

// Update a department officer
router.put("/:id", DepartmentOfficerController.updateDepartmentOfficer);

// Delete a department officer
router.delete("/:id", DepartmentOfficerController.deleteDepartmentOfficer);

module.exports = router;
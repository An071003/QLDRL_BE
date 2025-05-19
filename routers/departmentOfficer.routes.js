const express = require("express");
const DepartmentOfficerController = require("../controllers/departmentOfficer.controller");
const { authenticateUser } = require("../middlewares/authMiddleware")
const router = express.Router();

// Get all department officers
router.get("/", authenticateUser, DepartmentOfficerController.getAllDepartmentOfficers);

// Get a department officer by ID
router.get("/:id", authenticateUser, DepartmentOfficerController.getDepartmentOfficerById);

// Get a department officer by user ID
router.get("/user/:userId", authenticateUser, DepartmentOfficerController.getDepartmentOfficerByUserId);

// Create a new department officer
router.post("/", authenticateUser, DepartmentOfficerController.createDepartmentOfficer);

router.post("/import", authenticateUser, DepartmentOfficerController.importDepartmentOfficersFromExcel);
// Update a department officer
router.put("/:id", authenticateUser, DepartmentOfficerController.updateDepartmentOfficer);

// Delete a department officer
router.delete("/:id", authenticateUser, DepartmentOfficerController.deleteDepartmentOfficer);

module.exports = router;
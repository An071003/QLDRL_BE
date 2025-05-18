const express = require("express");
const CriteriaController = require("../controllers/criteria.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all criteria
router.get("/", authenticateUser, CriteriaController.getAllCriteria);

// Get a criterion by ID
router.get("/:id", authenticateUser, CriteriaController.getCriteriaById);

// Create a new criterion
router.post("/", authenticateUser, CriteriaController.createCriteria);

// Update a criterion
router.put("/:id", authenticateUser, CriteriaController.updateCriteria);

// Delete a criterion
router.delete("/:id", authenticateUser, CriteriaController.deleteCriteria);

// Import criteria from Excel file
router.post('/import', authenticateUser, CriteriaController.importCriteria);

module.exports = router;

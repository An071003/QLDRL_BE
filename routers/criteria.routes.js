const express = require("express");
const CriteriaController = require("../controllers/criteria.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all criteria
router.get("/", authenticateUser, CriteriaController.getAllCriteria);

// Get a criteria by ID
router.get("/:id", authenticateUser, CriteriaController.getCriteriaById);

// Create a new criteria
router.post("/", authenticateUser, CriteriaController.createCriteria);

// Update a criteria
router.put("/:id", authenticateUser, CriteriaController.updateCriteria);

// Delete a criteria
router.delete("/:id", authenticateUser, CriteriaController.deleteCriteria);

// Import criteria from Excel file
router.post('/import', authenticateUser, CriteriaController.importCriteria);

module.exports = router;

const express = require("express");
const CriteriaController = require("../controllers/criteria.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all criteria
router.get("/", authenticateUser, authorizeRoles("admin"), CriteriaController.getAllCriteria);

// Get a criterion by ID
router.get("/:id", authenticateUser, authorizeRoles("admin"), CriteriaController.getCriteriaById);

// Create a new criterion
router.post("/", authenticateUser, authorizeRoles("admin"), CriteriaController.createCriteria);

// Update a criterion
router.put("/:id", authenticateUser, authorizeRoles("admin"), CriteriaController.updateCriteria);

// Delete a criterion
router.delete("/:id", authenticateUser, authorizeRoles("admin"), CriteriaController.deleteCriteria);

// Import criteria from Excel file
router.post('/import', authenticateUser, authorizeRoles('admin'), CriteriaController.importCriteria);

module.exports = router;

const express = require("express");
const CriteriaController = require("../controllers/criteria.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all criteria
router.get("/", authMiddleware, CriteriaController.getAllCriteria);

// Get a criterion by ID
router.get("/:id", authMiddleware, CriteriaController.getCriterionById);

// Create a new criterion
router.post("/", authMiddleware, CriteriaController.createCriterion);

// Update a criterion
router.put("/:id", authMiddleware, CriteriaController.updateCriterion);

// Delete a criterion
router.delete("/:id", authMiddleware, CriteriaController.deleteCriterion);

module.exports = router;

const express = require("express");
const CriteriaController = require("../controllers/criteria.controller");
const router = express.Router();

// Get all criteria
router.get("/", CriteriaController.getAllCriteria);

// Get a criterion by ID
router.get("/:id", CriteriaController.getCriterionById);

// Create a new criterion
router.post("/", CriteriaController.createCriterion);

// Update a criterion
router.put("/:id", CriteriaController.updateCriterion);

// Delete a criterion
router.delete("/:id", CriteriaController.deleteCriterion);

module.exports = router;

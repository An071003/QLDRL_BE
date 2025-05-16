const express = require("express");
const AdvisorController = require("../controllers/advisor.controller");

const router = express.Router();

// Get all advisors
router.get("/", AdvisorController.getAllAdvisors);

// Get an advisor by ID
router.get("/:id", AdvisorController.getAdvisorById);

// Create a new advisor
router.post("/", AdvisorController.createAdvisor);

// Update an advisor
router.put("/:id", AdvisorController.updateAdvisor);

// Delete an advisor
router.delete("/:id", AdvisorController.deleteAdvisor);

module.exports = router;
const express = require("express");
const AdvisorController = require("../controllers/advisor.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all advisors
router.get("/", authMiddleware, AdvisorController.getAllAdvisors);

// Get an advisor by ID
router.get("/:id", authMiddleware, AdvisorController.getAdvisorById);

// Create a new advisor
router.post("/", authMiddleware, AdvisorController.createAdvisor);

// Update an advisor
router.put("/:id", authMiddleware, AdvisorController.updateAdvisor);

// Delete an advisor
router.delete("/:id", authMiddleware, AdvisorController.deleteAdvisor);

module.exports = router;
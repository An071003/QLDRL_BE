const express = require("express");
const AdvisorController = require("../controllers/advisor.controller");
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all advisors
router.get("/", AdvisorController.getAllAdvisors);

// Get an advisor by user ID
router.get("/user/:userId", authenticateUser, AdvisorController.getAdvisorByUserId);

// Get an advisor by ID
router.get("/:id", AdvisorController.getAdvisorById);

// Create a new advisor
router.post("/", authenticateUser, AdvisorController.createAdvisor);
router.post("/import", AdvisorController.importAdvisorsFromExcel);

// Update an advisor
router.put("/:id", AdvisorController.updateAdvisor);

// Delete an advisor
router.delete("/:id", AdvisorController.deleteAdvisor);

module.exports = router;
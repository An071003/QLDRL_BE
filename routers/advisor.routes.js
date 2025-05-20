const express = require("express");
const AdvisorController = require("../controllers/advisor.controller");
const { authenticateUser, authorizePermissions } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getAllAdvisors);
router.get("/user/:userId", authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getAdvisorByUserId);
router.get("/:id", authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getAdvisorById);
router.post("/", authenticateUser, authorizePermissions('advisor:create'), AdvisorController.createAdvisor);
router.post("/import", authenticateUser, authorizePermissions('advisor:create'), AdvisorController.importAdvisorsFromExcel);
router.put("/:id", authenticateUser, authorizePermissions('advisor:update'), AdvisorController.updateAdvisor);
router.delete("/:id", authenticateUser, authorizePermissions('advisor:delete'), AdvisorController.deleteAdvisor);

module.exports = router;
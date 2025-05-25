const express = require("express");
const CriteriaController = require("../controllers/criteria.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('criteria:view'), CriteriaController.getAllCriteria);
router.get("/:id", authenticateUser, authorizePermissions('criteria:view'), CriteriaController.getCriteriaById);
router.post("/", authenticateUser, authorizePermissions('criteria:create'), CriteriaController.createCriteria);
router.put("/:id", authenticateUser, authorizePermissions('criteria:update'), CriteriaController.updateCriteria);
router.delete("/:id", authenticateUser, authorizePermissions('criteria:delete'), CriteriaController.deleteCriteria);
router.post('/import', authenticateUser, authorizePermissions('criteria:create'), CriteriaController.importCriteria);

module.exports = router;

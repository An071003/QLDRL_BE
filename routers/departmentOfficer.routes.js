const express = require("express");
const DepartmentOfficerController = require("../controllers/departmentOfficer.controller");
const { authenticateUser, authorizePermissions } = require("../middlewares/authMiddleware")
const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('departmentofficer:view'), DepartmentOfficerController.getAllDepartmentOfficers);
router.get("/:id", authenticateUser, authorizePermissions('departmentofficer:view'), DepartmentOfficerController.getDepartmentOfficerById);
router.get("/user/:userId", authenticateUser, authorizePermissions('departmentofficer:view'), DepartmentOfficerController.getDepartmentOfficerByUserId);
router.post("/", authenticateUser, authorizePermissions('departmentofficer:create'), DepartmentOfficerController.createDepartmentOfficer);
router.post("/import", authenticateUser, authorizePermissions('departmentofficer:create'), DepartmentOfficerController.importDepartmentOfficersFromExcel);
router.put("/:id", authenticateUser, authorizePermissions('departmentofficer:update'), DepartmentOfficerController.updateDepartmentOfficer);
router.delete("/:id", authenticateUser, authorizePermissions('departmentofficer:delete'), DepartmentOfficerController.deleteDepartmentOfficer);

module.exports = router;
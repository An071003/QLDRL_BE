const express = require("express");
const ClassController = require("../controllers/class.controller");
const { authenticateUser, authorizePermissions } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('class:view'), ClassController.getAllClasses);
router.get("/:id", authenticateUser, authorizePermissions('class:view'), ClassController.getClassById);
router.get('/:classId/details', authenticateUser, authorizePermissions('class:view'), ClassController.getStudentsAndAdvisorByClassId);
router.get("/:id/students", authenticateUser, authorizePermissions('class:view'), ClassController.getStudentsByClassId);
router.post("/", authenticateUser, authorizePermissions('class:create'), ClassController.createClass);
router.post("/import", authenticateUser, authorizePermissions('class:create'), ClassController.importClasses);
router.put("/:id", authenticateUser, authorizePermissions('class:update'), ClassController.updateClass);
router.delete("/:id", authenticateUser, authorizePermissions('class:delete'), ClassController.deleteClass);

module.exports = router;
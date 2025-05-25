const express = require("express");
const FacultyController = require("../controllers/faculty.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('faculty:view'), FacultyController.getAllFaculties);
router.get('/:facultyId/classes', authenticateUser, authorizePermissions('faculty:view'), FacultyController.getClassesByFacultyId);
router.get("/:id", authenticateUser, authorizePermissions('faculty:view'), FacultyController.getFacultyById);
router.post("/", authenticateUser, authorizePermissions('faculty:create'), FacultyController.createFaculty);
router.post("/import", authenticateUser, authorizePermissions('faculty:create'), FacultyController.importFaculties);
router.put("/:id", authenticateUser, authorizePermissions('faculty:update'), FacultyController.updateFaculty);
router.delete("/:id", authenticateUser, authorizePermissions('faculty:delete'), FacultyController.deleteFaculty);

module.exports = router;
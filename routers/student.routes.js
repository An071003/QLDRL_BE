const express = require("express");
const StudentController = require("../controllers/student.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('student:view'), StudentController.getAllStudents);
router.get('/advisor', authenticateUser, authorizePermissions('student:view'), StudentController.getStudentsByAdvisorId);
router.get('/classleader', authenticateUser, authorizePermissions('student:view'), StudentController.getStudentsByClassleaderId);
router.get("/:id", authenticateUser, authorizePermissions('student:view'), StudentController.getStudentById);
router.get("/user/:userId", authenticateUser, authorizePermissions('student:view'), StudentController.getStudentByUserId);
router.post("/", authenticateUser, authorizePermissions('student:create'), StudentController.createStudent);
router.post("/import", authenticateUser, authorizePermissions('student:create'), StudentController.createStudentsFromExcel)
router.put("/:id", authenticateUser, authorizePermissions('student:update'), StudentController.updateStudent);
router.delete("/:id", authenticateUser, authorizePermissions('student:delete'), StudentController.deleteStudent);
router.get("/:id/activities", authenticateUser, authorizePermissions('student:view'), StudentController.getStudentActivitiesByLatestSemester);

module.exports = router;

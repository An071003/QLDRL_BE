const express = require("express");
const StudentController = require("../controllers/student.controller");
const { authenticateUser, authorizeRoles, authorizePermissions } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('student:view'), StudentController.getAllStudents);
router.get('/advisor', authenticateUser, authorizePermissions('student:view'), StudentController.getStudentsByAdvisorId);
router.get('/classleader', authenticateUser, authorizePermissions('student:view'), StudentController.getStudentsByClassleaderId);

// /me routes must come before /:id routes to avoid conflicts
router.get('/me', authenticateUser, authorizePermissions('student:view'), StudentController.getMyProfile);
router.get('/me/scores', authenticateUser, authorizePermissions('student:view'), StudentController.getMyScores);
router.get('/me/activities', authenticateUser, authorizePermissions('student:view'), StudentController.getMyActivities);
router.get('/me/summary', authenticateUser, authorizePermissions('student:view'), StudentController.getMySummary);
router.get('/me/score-detail', authenticateUser, authorizePermissions('student:view'), StudentController.getMyScoreDetail);

// /:id routes come after /me routes
router.get("/:id", authenticateUser, authorizePermissions('student:view'), StudentController.getStudentById);
router.get("/user/:userId", authenticateUser, authorizePermissions('student:view'), StudentController.getStudentByUserId);
router.get("/:id/activities", authenticateUser, authorizePermissions('student:view'), StudentController.getStudentActivitiesByLatestSemester);

router.post("/", authenticateUser, authorizePermissions('student:create'), StudentController.createStudent);
router.post("/import", authenticateUser, authorizePermissions('student:create'), StudentController.createStudentsFromExcel)

router.put('/me', authenticateUser, authorizePermissions('student:update'), StudentController.updateMyProfile);
router.put("/:id", authenticateUser, authorizePermissions('student:update'), StudentController.updateStudent);

router.delete("/:id", authenticateUser, authorizePermissions('student:delete'), StudentController.deleteStudent);
module.exports = router;

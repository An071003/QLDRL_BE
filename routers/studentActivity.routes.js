const express = require("express");
const StudentActivityController = require("../controllers/studentactivity.controller");
const { authenticateUser, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:activityId", authenticateUser, StudentActivityController.getStudentsByActivity);
router.get("/:studentID/all", authenticateUser, StudentActivityController.getStudentActivityByStudentId);
router.get("/:studentId/available", authenticateUser, StudentActivityController.getAvailableActivitiesForStudent);
router.get("/student/:studentId/", authenticateUser, StudentActivityController.getRegisteredActivitiesForStudent);
router.get("/:activityId/not-participated", authenticateUser, StudentActivityController.getStudentsNotInActivity);
router.post("/:activityId/students", authenticateUser, authorizeRoles('advisor', 'department-officer', 'admin', 'classleader'), StudentActivityController.addStudent);
router.post('/:activityId/import', authenticateUser, authorizeRoles('advisor', 'department-officer', 'admin', 'classleader'), StudentActivityController.importStudents);
router.patch("/:activityId", authenticateUser, authorizeRoles('advisor', 'department-officer', 'admin', 'classleader'), StudentActivityController.editStudentParticipation);
router.delete("/:activityId/students/:studentIds", authenticateUser, authorizeRoles('advisor', 'department-officer', 'admin', 'classleader'), StudentActivityController.removeStudent)
router.post("/",authenticateUser, StudentActivityController.createStudentActivity);
router.put("/:id",authenticateUser, StudentActivityController.updateStudentActivity);
router.delete("/:id", authenticateUser, StudentActivityController.deleteStudentActivity);

module.exports = router;

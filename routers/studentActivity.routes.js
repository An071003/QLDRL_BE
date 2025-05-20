const express = require("express");
const StudentActivityController = require("../controllers/studentactivity.controller");
const { authenticateUser, authorizePermissions } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:activityId", authenticateUser, authorizePermissions('studentactivity:view'), StudentActivityController.getStudentsByActivity);
router.get("/:studentID/all", authenticateUser, authorizePermissions('studentactivity:view'), StudentActivityController.getStudentActivityByStudentId);
router.get("/:studentId/available", authenticateUser, authorizePermissions('studentactivity:view'), StudentActivityController.getAvailableActivitiesForStudent);
router.get("/student/:studentId/", authenticateUser, authorizePermissions('studentactivity:view'), StudentActivityController.getRegisteredActivitiesForStudent);
router.get("/:activityId/not-participated", authenticateUser, authorizePermissions('studentactivity:view'), StudentActivityController.getStudentsNotInActivity);
router.post("/:activityId/students", authenticateUser, authorizePermissions('studentactivity:create'), StudentActivityController.addStudent);
router.post('/:activityId/import', authenticateUser, authorizePermissions('studentactivity:create'), StudentActivityController.importStudents);
router.post("/", authenticateUser, authorizePermissions('studentactivity:create'), StudentActivityController.createStudentActivity);
router.patch("/:activityId", authenticateUser, authorizePermissions('studentactivity:update'), StudentActivityController.editStudentParticipation);
router.put("/:id", authenticateUser, authorizePermissions('studentactivity:update'), StudentActivityController.updateStudentActivity);
router.delete("/:activityId/students/:studentIds", authorizePermissions('studentactivity:delete'), authenticateUser, StudentActivityController.removeStudent)
router.delete("/:id", authenticateUser, authorizePermissions('studentactivity:delete'), StudentActivityController.deleteStudentActivity);

module.exports = router;

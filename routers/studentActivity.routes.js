const express = require("express");
const StudentActivityController = require("../controllers/studentactivity.controller");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:activityId", authenticateUser, StudentActivityController.getStudentsByActivity);
router.get("/:activityId/all", authenticateUser, StudentActivityController.getStudentActivityByStudentId);
router.get("/:activityId/not-participated", authenticateUser, StudentActivityController.getStudentsNotInActivity);
router.post("/:activityId/students", authenticateUser, StudentActivityController.addStudent);
router.post('/:activityId/import', authenticateUser, StudentActivityController.importStudents);
router.patch("/:activityId", authenticateUser, StudentActivityController.editStudentParticipation);
router.delete("/:activityId/students/:studentIds", authenticateUser, StudentActivityController.removeStudent)
router.post("/",authenticateUser, StudentActivityController.createStudentActivity);
router.put("/:id",authenticateUser, StudentActivityController.updateStudentActivity);
router.delete("/:id", authenticateUser, StudentActivityController.deleteStudentActivity);

module.exports = router;

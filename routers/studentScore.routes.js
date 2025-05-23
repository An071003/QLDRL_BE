const express = require("express");
const StudentScoreController = require("../controllers/studentScore.controller");
const { authenticateUser, authorizePermissions } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getAllStudentScores);
router.get("/current-semester", authenticateUser, StudentScoreController.getCurrentSemester);
router.get("/semesters", authenticateUser, StudentScoreController.getSemesters);
router.post("/new-semester", authenticateUser, StudentScoreController.createNewSemester);
router.get("/:studentId", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStudentScoreById);
router.get("/semester/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStudentScoresBySemester);
router.put("/:studentId/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:update'), StudentScoreController.updateStudentScore);
router.get("/stats/faculty/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByFaculty);
router.get("/stats/class/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByClass);
router.delete("/semester/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:delete'), StudentScoreController.deleteSemester);

module.exports = router; 
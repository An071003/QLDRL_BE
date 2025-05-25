const express = require("express");
const StudentScoreController = require("../controllers/studentScore.controller");
const { authenticateUser, authorizePermissions } = require("../middlewares/authMiddleware");

const router = express.Router();

// Các routes cơ bản
router.get("/", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getAllStudentScores);
router.get("/current-semester", authenticateUser, StudentScoreController.getCurrentSemester);
router.get("/semesters", authenticateUser, StudentScoreController.getSemesters);
router.get("/batch-years", authenticateUser, StudentScoreController.getBatchYears);
router.get("/cohort-years", authenticateUser, StudentScoreController.getCohortYears);

// Quản lý học kỳ
router.post("/new-semester", authenticateUser, authorizePermissions('student:update'), StudentScoreController.createNewSemester);
router.delete("/semester/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:update'), StudentScoreController.deleteSemester);

// Routes thống kê theo khóa (specific routes first)
router.get("/stats/cohort/:cohortYear/classes", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getClassStatsByCohort);
router.get("/stats/cohort/:cohortYear/overview", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getCohortOverview);

// Routes thống kê (generic routes)
router.get("/stats/faculty/all", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByFacultyAll);
router.get("/stats/class/all", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByClassAll);
router.get("/stats/cohort/all", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByCohortAll);
router.get("/stats/cohort/overview", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getCohortOverviewAll);
router.get("/stats/faculty/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByFaculty);
router.get("/stats/class/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByClass);
router.get("/stats/cohort/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStatsByCohort);

// Chi tiết theo lớp
router.get("/class/:className", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStudentsByClass);
router.get("/class/:className/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStudentsByClassAndSemester);

// Quản lý điểm
router.get("/semester/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:view'), StudentScoreController.getStudentScoresBySemester);
router.put("/:studentId/:semesterNo/:academicYear", authenticateUser, authorizePermissions('student:update'), StudentScoreController.updateStudentScore);

module.exports = router; 
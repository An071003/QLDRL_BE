const express = require("express");
const AdvisorController = require("../controllers/advisor.controller");
const { authenticateUser, authorizePermissions } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/", authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getAllAdvisors);
router.get("/user/:userId", authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getAdvisorByUserId);
router.get("/:id", authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getAdvisorById);
router.post("/", authenticateUser, authorizePermissions('advisor:create'), AdvisorController.createAdvisor);
router.post("/import", authenticateUser, authorizePermissions('advisor:create'), AdvisorController.importAdvisorsFromExcel);
router.put("/:id", authenticateUser, authorizePermissions('advisor:update'), AdvisorController.updateAdvisor);
router.delete("/:id", authenticateUser, authorizePermissions('advisor:delete'), AdvisorController.deleteAdvisor);

// Student scores routes
router.get('/my-classes', authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getMyClasses);
router.get('/student-scores', authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getMyStudentsScores);
router.get('/student-scores/semester/:semesterNo/:academicYear', authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getMyStudentsScoresBySemester);
router.get('/student-scores/class/:className', authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getStudentScoresByClass);
router.get('/student-scores/class/:className/:semesterNo/:academicYear', authenticateUser, authorizePermissions('advisor:view'), AdvisorController.getStudentScoresByClassAndSemester);

module.exports = router;
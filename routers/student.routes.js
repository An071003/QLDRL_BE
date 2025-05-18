const express = require("express");
const StudentController = require("../controllers/student.controller");
const { authenticateUser, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateUser, authorizeRoles("admin", "advisor", "departmentofficer"), StudentController.getAllStudents);
router.get('/advisor', authenticateUser, StudentController.getStudentsByAdvisorId);
router.get("/:id", authenticateUser, authorizeRoles("admin", "advisor", "departmentofficer", "student"), StudentController.getStudentById);
router.post("/", authenticateUser, authorizeRoles("admin", "departmentofficer"), StudentController.createStudent);
router.post("/import", authenticateUser, authorizeRoles("admin", "departmentofficer"), StudentController.createStudentsFromExcel)
router.put("/:id", authenticateUser, authorizeRoles("admin", "departmentofficer"), StudentController.updateStudent);
router.delete("/:id", authenticateUser, authorizeRoles("admin", "departmentofficer"), StudentController.deleteStudent);
router.get("/:id/activities", authenticateUser, authorizeRoles("admin", "advisor", "departmentofficer"), StudentController.getStudentActivitiesByLatestSemester);

module.exports = router;

// const express = require("express");
// const StudentController = require("../controllers/studentController");
// const { authenticateUser, authorizeRoles } = require("../middlewares/authMiddleware");

// const router = express.Router();

// router.get("/", authenticateUser, authorizeRoles("admin", "lecturer"), StudentController.getAllStudents);
// router.get("/:id", authenticateUser, authorizeRoles("admin", "lecturer"), StudentController.getStudentById);
// router.post("/", authenticateUser, authorizeRoles("admin"), StudentController.createStudent);
// router.post("/import", authenticateUser, authorizeRoles("admin"), StudentController.createStudentsFromExcel)
// router.put("/:id", authenticateUser, authorizeRoles("admin"), StudentController.updateStudent);
// router.delete("/:id", authenticateUser, authorizeRoles("admin"), StudentController.deleteStudent);
// router.get("/:id/activities", authenticateUser, authorizeRoles("admin", "lecturer"), StudentController.getStudentActivitiesByLatestSemester);

// module.exports = router;

const express = require("express");
const StudentController = require("../controllers/studentController");
const { authenticateUser, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// GET tất cả sinh viên
router.get("/", authenticateUser, authorizeRoles("admin", "lecturer"), StudentController.getAllStudents);

// GET sinh viên theo ID
router.get("/:id", authenticateUser, authorizeRoles("admin", "lecturer"), StudentController.getStudentById);

// POST tạo sinh viên mới (và tạo user kèm theo)
router.post("/", authenticateUser, authorizeRoles("admin"), StudentController.createStudent);

// PUT cập nhật thông tin sinh viên
router.put("/:id", authenticateUser, authorizeRoles("admin"), StudentController.updateStudent);

// DELETE sinh viên (xóa cả user)
router.delete("/:id", authenticateUser, authorizeRoles("admin"), StudentController.deleteStudent);

// GET danh sách hoạt động theo semester mới nhất
router.get("/:id/activities", authenticateUser, authorizeRoles("admin", "lecturer"), StudentController.getStudentActivitiesByLatestSemester);

module.exports = router;

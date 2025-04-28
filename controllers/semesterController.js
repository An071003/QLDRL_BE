const Semester = require("../models/semesterModel");

class SemesterController {
  static async getAllSemesters(req, res) {
    try {
      const semesters = await Semester.selectAllSemesters();
      res.status(200).json({ status: "success", data: { semesters } });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách học kỳ." });
    }
  }

  static async createSemester(req, res) {
    try {
      await Semester.createSemester();
      res.status(201).json({ status: "success", message: "Tạo học kỳ mới thành công." });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo học kỳ mới." });
    }
  }

  static async deleteSemester(req, res) {
    const { id } = req.params;
    try {
      await Semester.deleteSemester(id);
      res.status(200).json({ status: "success", message: "Xóa học kỳ thành công." });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa học kỳ." });
    }
  }
}

module.exports = SemesterController;

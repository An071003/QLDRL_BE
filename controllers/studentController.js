const Student = require('../models/studentModel');
const User = require('../models/userModel');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const emailMiddleware = require("../middlewares/emailMiddleware");

class StudentController {
  static generateRandomPassword = () => {
    return crypto.randomBytes(8).toString("hex");
  };

  static async getAllStudents(req, res) {
    try {
      const students = await Student.getAllStudents();
      res.status(200).json({ status: "success", data: { students } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStudentById(req, res) {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên." });
      }
      res.status(200).json({ status: "success", data: { student } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createStudent(req, res) {
    try {
      const { id, student_name, faculty, course, class: className } = req.body;

      const email = `${id}@gm.uit.edu.vn`;
      const role = 'student';
      const plainPassword = StudentController.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User với email đã tồn tại." });
      }

      const userResult = await User.createUser({ name: id, email, hashedPassword, role });
      const userId = userResult.insertId;

      await Student.createStudent({ id, student_name, faculty, course, className, userId });

      const subject = "Thông tin tài khoản sinh viên";
      const htmlContent = `
        <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
                <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản người dùng mới</h2>
                <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
                    Chào <strong>${student_name}</strong>,<br>
                    Tài khoản của bạn đã được tạo thành công.
                </p>
                <p style="font-size: 18px; color: #ffffff; margin-bottom: 15px;">
                    Dưới đây là thông tin tài khoản của bạn:
                </p>
                <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                    <p style="font-size: 18px; font-weight: 700;">Tên người dùng: ${student_name}</p>
                    <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${plainPassword}</p>
                </div>
                <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
                    Vui lòng đăng nhập và thay đổi mật khẩu ngay sau khi truy cập tài khoản của bạn để đảm bảo an toàn.
                </p>
        </div>
      `;
      await emailMiddleware(email, subject, htmlContent);

      res.status(201).json({ status: "success", message: "Tạo sinh viên thành công." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStudentActivitiesByLatestSemester(req, res) {
    try {
      const studentId = req.params.id;
      const semesterId = await Student.getLatestSemesterId();
      if (!semesterId) {
        return res.status(400).json({ message: "Không có học kỳ nào." });
      }

      const activities = await Student.getStudentActivities(studentId, semesterId);
      res.status(200).json({ status: "success", data: { activities } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async deleteStudent(req, res) {
    try {
      const studentId = req.params.id;
      const userId = await Student.findUserIdByStudentId(studentId);

      if (!userId) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên." });
      }

      await Student.deleteStudentById(studentId);
      await User.deleteUser(userId);

      res.status(200).json({ status: "success", message: "Xóa sinh viên thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateStudent(req, res) {
    try {
      const studentId = req.params.id;
      const { student_name, faculty, course, class: className, status } = req.body;

      const existingStudent = await Student.findById(studentId);
      if (!existingStudent) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên." });
      }

      await Student.updateStudent(studentId, { student_name, faculty, course, className, status });

      res.status(200).json({ status: "success", message: "Cập nhật sinh viên thành công." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = StudentController;

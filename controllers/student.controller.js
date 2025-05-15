const Student = require('../models/student.model');
const User = require('../models/user.model');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const emailMiddleware = require("../middlewares/emailMiddleware");

class StudentController {
  static generateRandomPassword = () => {
    return crypto.randomBytes(8).toString("hex");
  };

  static async getAllStudents(req, res) {
    try {
      const students = await Student.findAll();
      res.status(200).json({ status: "success", data: { students } });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStudentById(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
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
      const { id, student_name, faculty, course, className } = req.body;

      const email = `${id}@gm.uit.edu.vn`;
      const role = 'student';
      const plainPassword = StudentController.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User với email đã tồn tại." });
      }

      const userResult = await User.create({ name: id, email, password: hashedPassword, role });
      const userId = userResult.id;

      await Student.create({ student_id: id, student_name, faculty, course, class: className, user_id: userId });

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
      const student = await Student.findByPk(studentId);

      if (!student) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên." });
      }

      const userId = student.user_id;
      await Student.destroy({ where: { student_id: studentId } });
      await User.destroy({ where: { id: userId } });

      res.status(200).json({ status: "success", message: "Xóa sinh viên thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateStudent(req, res) {
    try {
      const studentId = req.params.id;
      const { student_name, faculty, course, phone, className, status } = req.body;

      const existingStudent = await Student.findByPk(studentId);
      if (!existingStudent) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên." });
      }

      await Student.update({ student_name, faculty, course, phone, class: className, status }, {
        where: { student_id: studentId }
      });

      res.status(200).json({ status: "success", message: "Cập nhật sinh viên thành công." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createStudentsFromExcel(req, res) {
    const students = req.body.students;
  
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "Danh sách sinh viên không hợp lệ." });
    }
  
    try {
      const validStudents = [];
      const failed = [];
  
      for (const s of students) {
        const { id, student_name, faculty, course, className } = s;
  
        if (!id || !student_name || !className) {
          failed.push({ id, name: student_name, reason: "Thiếu thông tin bắt buộc" });
          continue;
        }
  
        const email = `${id}@gm.uit.edu.vn`;
        const existingUser = await User.findOne({ where: { email } });
  
        if (existingUser) {
          failed.push({ id, name: student_name, reason: "Email đã tồn tại" });
          continue;
        }
  
        const plainPassword = StudentController.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        validStudents.push({
          id,
          student_name,
          className,
          course,
          faculty,
          email,
          plainPassword,
          hashedPassword
        });
      }
      if (validStudents.length == 0){
        return res.status(400).json({
          status: "failure",
          message: `Không có học sinh hợp lệ để tạo hoặc chưa đã tồn tại trong hệ thống.`,
          data: { failed }
      });
      }

      const usersToInsert = validStudents.map(s => ({
        name: s.id,
        email: s.email,
        password: s.hashedPassword,
        role: 'student'
      }));
      
      const insertResults = await User.bulkCreate(usersToInsert);
      const startInsertId = insertResults[0].id;
  
      const pLimit = require('p-limit');
      const limit = pLimit(20);
  
      const sendTasks = validStudents.map((s, index) =>
        limit(async () => {
          const newUserId = startInsertId + index;
  
          try {
            await Student.create({
              student_id: s.id,
              student_name: s.student_name,
              class: s.className,
              course: s.course,
              faculty: s.faculty,
              user_id: newUserId
            });
  
            const htmlContent = `
              <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
                  <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản sinh viên mới</h2>
                  <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
                      Chào ${s.student_name},<br>
                      Tài khoản sinh viên của bạn đã được tạo thành công.
                  </p>
                  <p style="font-size: 18px; color: #ffffff; margin-bottom: 15px;">
                      Dưới đây là thông tin tài khoản:
                  </p>
                  <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                      <p style="font-size: 18px; font-weight: 700;">Email: ${s.email}</p>
                      <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${s.plainPassword}</p>
                  </div>
                  <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
                      Vui lòng đăng nhập và đổi mật khẩu sau khi đăng nhập.
                  </p>
              </div>`;
  
            await emailMiddleware(s.email, "Thông tin tài khoản sinh viên", htmlContent);
          } catch (e) {
            console.error(`Lỗi khi xử lý sinh viên ${s.id}:`, e.message);
            failed.push({ id: s.id, name: s.student_name, reason: "Lỗi tạo hoặc gửi email" });
          }
        })
      );
  
      await Promise.all(sendTasks);
  
      return res.status(201).json({
        status: failed.length === 0 ? "success" : "partial",
        message: `Tạo ${validStudents.length} sinh viên thành công, ${failed.length} thất bại.`,
        data: {
          created: validStudents.map(s => ({ id: s.id, name: s.student_name, email: s.email })),
          failed
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }  
}

module.exports = StudentController;

const Student = require('../models/student.model');
const User = require('../models/user.model');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const emailMiddleware = require("../middlewares/emailMiddleware");
const { Faculty, Class, Role, Advisor } = require('../models');

class StudentController {
  static generateRandomPassword = () => {
    return crypto.randomBytes(8).toString("hex");
  };

  static async getAllStudents(req, res) {
    try {
      const students = await Student.findAll({
        include: [
          {
            model: Faculty,
            attributes: ['faculty_abbr'],
          },
          {
            model: Class,
            attributes: ['name'],
          },
        ],
      });
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
      const {
        student_id,
        student_name,
        faculty_id,
        class_id,
        email,
        birthdate,
        phone
      } = req.body;

      if (!student_id || !student_name || !faculty_id || !class_id || !email) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }

      const role = await Role.findOne({ where: { name: 'student' }, attributes: ['id'] });
      if (!role) {
        return res.status(400).json({ message: "Không tìm thấy role 'student'." });
      }

      if (phone && !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ (phải có 10 chữ số)." });
      }

      if (birthdate && isNaN(Date.parse(birthdate))) {
        return res.status(400).json({ message: "Ngày sinh không hợp lệ." });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User với email đã tồn tại." });
      }

      const plainPassword = StudentController.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const userResult = await User.create({
        user_name: student_id,
        email,
        password: hashedPassword,
        role_id: role.id
      });

      await Student.create({
        student_id,
        student_name,
        class_id,
        faculty_id,
        phone,
        birthdate,
        user_id: userResult.id
      });

      const subject = "Thông tin tài khoản sinh viên";
      const htmlContent = `
      <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
        <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản người dùng mới</h2>
        <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
            Chào <strong>${student_name}</strong>,<br>
            Tài khoản của bạn đã được tạo thành công.
        </p>
        <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
          <p style="font-size: 18px; font-weight: 700;">Email: ${email}</p>
          <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${plainPassword}</p>
        </div>
        <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
          Vui lòng đăng nhập và thay đổi mật khẩu sau khi truy cập để đảm bảo an toàn.
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
      const { student_name, faculty_id, class_id, phone, className, birthdate, status } = req.body;

      const existingStudent = await Student.findByPk(studentId);
      if (!existingStudent) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên." });
      }

      await Student.update({
        student_name, faculty_id, class_id, phone, class: className, status, birthdate
      }, {
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
        const {
          student_id,
          student_name,
          faculty_id,
          class_id,
          email,
          birthdate,
          phone
        } = s;

        if (!student_id || !student_name || !faculty_id || !class_id) {
          failed.push({ student_id, student_name, reason: "Thiếu thông tin bắt buộc" });
          continue;
        }

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
          failed.push({ student_id, student_name, reason: "Email đã tồn tại" });
          continue;
        }

        if (phone && !/^\d{10}$/.test(phone)) {
          failed.push({ student_id, student_name, reason: "Số điện thoại không hợp lệ" });
          continue;
        }

        let parsedBirthdate = null;
        if (birthdate) {
          const d = new Date(birthdate);
          if (isNaN(d.getTime())) {
            failed.push({ student_id, student_name, reason: "Ngày sinh không hợp lệ" });
            continue;
          }
          parsedBirthdate = d;
        }

        const plainPassword = StudentController.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        validStudents.push({
          student_id,
          student_name,
          faculty_id,
          class_id,
          phone,
          birthdate: parsedBirthdate,
          email,
          plainPassword,
          hashedPassword
        });
      }

      if (validStudents.length === 0) {
        return res.status(400).json({
          status: "failure",
          message: "Không có sinh viên hợp lệ để tạo.",
          data: { failed }
        });
      }

      const role = await Role.findOne({ where: { name: 'student' }, attributes: ['id'] });
      if (!role) {
        return res.status(400).json({ message: "Không tìm thấy role 'student'." });
      }

      const usersToInsert = validStudents.map(s => ({
        user_name: s.student_id,
        email: s.email,
        password: s.hashedPassword,
        role_id: role.id
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
              student_id: s.student_id,
              student_name: s.student_name,
              class_id: s.class_id,
              faculty_id: s.faculty_id,
              phone: s.phone,
              birthdate: s.birthdate,
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
            console.error(`Lỗi khi xử lý sinh viên ${s.student_id}:`, e.message);
            failed.push({ student_id: s.student_id, student_name: s.student_name, reason: "Lỗi tạo hoặc gửi email" });
          }
        })
      );

      await Promise.all(sendTasks);

      return res.status(201).json({
        status: failed.length === 0 ? "success" : "partial",
        message: `Tạo ${validStudents.length - failed.length} sinh viên thành công, ${failed.length} thất bại.`,
        data: {
          created: validStudents.map(s => ({ student_id: s.student_id, student_name: s.student_name, email: s.email })),
          failed
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }


  static async getStudentsByAdvisorId(req, res) {
    try {
      const user_id = req.user.id;
      const advisor = await Advisor.findOne({
        where: {},
        include: [
          {
            model: User,
            where: { id: user_id },
            attributes: [],
          },
        ],
        attributes: ['id'],
      });

      const students = await Student.findAll({
        include: [
          {
            model: Class,
            where: { advisor_id: advisor.id },
            attributes: ['name'],
          },
          {
            model: Faculty,
            attributes: ['faculty_abbr'],
          },
        ],
      });

      return res.status(200).json({
        status: 'success',
        data: { students },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Lỗi máy chủ.',
      });
    }
  }

}

module.exports = StudentController;

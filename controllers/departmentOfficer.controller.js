const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { DepartmentOfficer, User, Role } = require("../models");
const emailMiddleware = require("../middlewares/emailMiddleware");

class DepartmentOfficerController {
  static generateRandomPassword = () => {
      return crypto.randomBytes(8).toString("hex");
    };

  static async getAllDepartmentOfficers(req, res) {
    try {
      const officers = await DepartmentOfficer.findAll({
        include: {
          model: User,
          attributes: ["email", "user_name"],
        },
      });
      res.status(200).json({ officers });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async getDepartmentOfficerById(req, res) {
    try {
      const { id } = req.params;
      const officer = await DepartmentOfficer.findByPk(id, {
        include: {
          model: User,
          attributes: ["email", "user_name"],
        },
      });
      if (!officer) {
        return res.status(404).json({ message: "Department officer not found" });
      }
      res.status(200).json({ officer });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async createDepartmentOfficer(req, res) {
    try {
      const { username, officer_name, officer_phone, email } = req.body;

      if (!username || !officer_name || !email) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }

      if (officer_phone && !/^\d{10}$/.test(officer_phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
      }

      const existingUser = await User.findOne({
        where: { [Op.or]: [{ email }, { user_name: username }] },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email hoặc tên đăng nhập đã tồn tại." });
      }

      const role = await Role.findOne({ where: { name: "departmentofficer" } });
      if (!role) {
        return res.status(400).json({ message: "Không tìm thấy role 'departmentofficer'." });
      }

      const plainPassword = DepartmentOfficerController.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const newUser = await User.create({
        user_name: username,
        email,
        password: hashedPassword,
        role_id: role.id,
      });

      const newOfficer = await DepartmentOfficer.create({
        officer_name,
        officer_phone,
        user_id: newUser.id,
      });

      const htmlContent = `
        <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
          <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản cán bộ khoa</h2>
          <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
              Chào <strong>${officer_name}</strong>,<br>
              Tài khoản của bạn đã được tạo thành công.
          </p>
          <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
            <p style="font-size: 18px; font-weight: 700;">Tên đăng nhập: ${username}</p>
            <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${plainPassword}</p>
          </div>
          <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
            Vui lòng đăng nhập và thay đổi mật khẩu sau khi truy cập để đảm bảo an toàn.
          </p>
        </div>`;

      await emailMiddleware(email, "Tài khoản cán bộ khoa", htmlContent);

      res.status(201).json({
        message: "Tạo cán bộ khoa thành công.",
        officer: newOfficer,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ.", error: err.message });
    }
  }

  static async updateDepartmentOfficer(req, res) {
    try {
      const { id } = req.params;
      const { officer_name, officer_phone } = req.body;

      const officer = await DepartmentOfficer.findByPk(id);
      if (!officer) {
        return res.status(404).json({ message: "Department officer not found" });
      }

      await officer.update({ officer_name, officer_phone });

      res.status(200).json({ officer });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async deleteDepartmentOfficer(req, res) {
    try {
      const { id } = req.params;
      const officer = await DepartmentOfficer.findByPk(id);
      if (!officer) {
        return res.status(404).json({ message: "Department officer not found" });
      }

      await officer.destroy();
      res.status(200).json({ message: "Department officer deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  static async importDepartmentOfficersFromExcel(req, res) {
    const officers = req.body.officers;

    if (!Array.isArray(officers) || officers.length === 0) {
      return res.status(400).json({ message: "Danh sách cán bộ khoa không hợp lệ." });
    }

    try {
      const validOfficers = [];
      const failed = [];

      for (const o of officers) {
        const { username, officer_name, officer_phone, email } = o;

        if (!username || !officer_name || !email) {
          failed.push({ username, officer_name, reason: "Thiếu thông tin bắt buộc" });
          continue;
        }

        if (officer_phone && !/^\d{10}$/.test(officer_phone)) {
          failed.push({ username, officer_name, reason: "Số điện thoại không hợp lệ" });
          continue;
        }

        const existingUser = await User.findOne({
          where: { [Op.or]: [{ email }, { user_name: username }] }
        });

        if (existingUser) {
          failed.push({ username, officer_name, reason: "Email hoặc tên đăng nhập đã tồn tại" });
          continue;
        }

        const plainPassword = DepartmentOfficerController.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        validOfficers.push({
          username,
          officer_name,
          officer_phone,
          email,
          plainPassword,
          hashedPassword
        });
      }

      if (validOfficers.length === 0) {
        return res.status(400).json({
          status: "failure",
          message: "Không có cán bộ khoa hợp lệ để tạo.",
          data: { failed }
        });
      }

      const role = await Role.findOne({ where: { name: "departmentofficer" }, attributes: ["id"] });
      if (!role) {
        return res.status(400).json({ message: "Không tìm thấy role 'departmentofficer'." });
      }

      const usersToInsert = validOfficers.map(o => ({
        user_name: o.username,
        email: o.email,
        password: o.hashedPassword,
        role_id: role.id
      }));

      const insertResults = await User.bulkCreate(usersToInsert);
      const startInsertId = insertResults[0].id;

      const pLimit = require("p-limit");
      const limit = pLimit(20);

      const sendTasks = validOfficers.map((o, index) =>
        limit(async () => {
          const newUserId = startInsertId + index;

          try {
            await DepartmentOfficer.create({
              officer_name: o.officer_name,
              officer_phone: o.officer_phone,
              user_id: newUserId
            });

            const htmlContent = `
          <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
            <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản cán bộ khoa</h2>
            <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
              Chào <strong>${o.officer_name}</strong>,<br>
              Tài khoản của bạn đã được tạo thành công.
            </p>
            <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
              <p style="font-size: 18px; font-weight: 700;">Tên đăng nhập: ${o.username}</p>
              <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${o.plainPassword}</p>
            </div>
            <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
              Vui lòng đăng nhập và thay đổi mật khẩu sau khi truy cập để đảm bảo an toàn.
            </p>
          </div>`;

            await emailMiddleware(o.email, "Tài khoản cán bộ khoa", htmlContent);
          } catch (e) {
            console.error(`Lỗi khi xử lý cán bộ ${o.username}:`, e.message);
            failed.push({ username: o.username, officer_name: o.officer_name, reason: "Lỗi tạo hoặc gửi email" });
          }
        })
      );

      await Promise.all(sendTasks);

      return res.status(201).json({
        status: failed.length === 0 ? "success" : "partial",
        message: `Tạo ${validOfficers.length - failed.length} cán bộ khoa thành công, ${failed.length} thất bại.`,
        data: {
          created: validOfficers.map(o => ({ username: o.username, officer_name: o.officer_name, email: o.email })),
          failed
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = DepartmentOfficerController;

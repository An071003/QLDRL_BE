const User = require("../models/user.model");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const pLimit = require('p-limit');
const emailMiddleware = require("../middlewares/emailMiddleware");
const Student = require("../models/student.model");
const Role = require('../models/role.model');
const { Op } = require("sequelize");
const { Advisor, DepartmentOfficer } = require("../models");

class UserController {
    static generateRandomPassword = () => {
        return crypto.randomBytes(8).toString('hex');
    };

    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                include: [{ model: Role, attributes: ['name'] }],
                attributes: ['id', 'user_name', 'email', 'role_id', 'created_at']
            });
            res.status(200).json({ status: "success", data: { users } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async getUserById(req, res) {
        const { id } = req.params;
        try {
            const user = await User.findOne({
                where: { id },
                include: [{ model: Role, attributes: ['name'] }]
            });
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            res.status(200).json({ status: "success", data: { user } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async createUser(req, res) {
        const { user_name, email, role_id } = req.body;

        try {
            if (!user_name || !email || !role_id) {
                return res.status(400).json({ message: "Thiếu thông tin." });
            }

            const existingUsers = await User.findAll({
                where: {
                    [Op.or]: [{ email }, { user_name }]
                }
            });

            if (existingUsers.length > 0) {
                const existingEmail = existingUsers.find(user => user.email === email);
                const existingName = existingUsers.find(user => user.user_name === user_name);
                if (existingEmail) {
                    return res.status(400).json({ message: "Email đã tồn tại." });
                }
                if (existingName) {
                    return res.status(400).json({ message: "Tên đã tồn tại." });
                }
            }

            const password = UserController.generateRandomPassword();
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({ user_name, email, password: hashedPassword, role_id });
            const role = await Role.findByPk(role_id);

            const subject = "Mật khẩu mới của bạn";
            const htmlContent = `
            <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
                <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản người dùng mới</h2>
                <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
                    Chào ${user_name},<br>
                    Tài khoản của bạn đã được tạo thành công.
                </p>
                <p style="font-size: 18px; color: #ffffff; margin-bottom: 15px;">
                    Dưới đây là thông tin tài khoản của bạn:
                </p>
                <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                    <p style="font-size: 18px; font-weight: 700;">Tên người dùng: ${user_name}</p>
                    <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${password}</p>
                </div>
                <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
                    Vui lòng đăng nhập và thay đổi mật khẩu ngay sau khi truy cập tài khoản của bạn để đảm bảo an toàn.
                </p>
            </div>`;

            await emailMiddleware(email, subject, htmlContent);

            if (role.name === 'student') {
                await Student.create({ user_id: newUser.id, student_id: newUser.user_name });
            } else if (role.name === 'advisor') {
                await Advisor.create({ user_id: newUser.id });
            } else if (role.name === 'departmentofficer') {
                await DepartmentOfficer.create({ user_id: newUser.id });
            }

            res.status(201).json({ status: "success", data: { user: newUser } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async updateUser(req, res) {
        const { id } = req.params;
        const { role_id } = req.body;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            await user.update({ role_id });
            res.status(200).json({ status: "success", message: "Cập nhật người dùng thành công." });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async createWithFileExcel(req, res) {
        const users = req.body;

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: "Danh sách người dùng không hợp lệ." });
        }

        try {
            const emails = users.map(u => u.email);
            const user_names = users.map(u => u.user_name);

            const existing = await User.findAll({
                where: {
                    [Op.or]: [
                        { email: { [Op.in]: emails } },
                        { user_name: { [Op.in]: user_names } }
                    ]
                }
            });

            const existingEmails = new Set(existing.map(e => e.email));
            const existingNames = new Set(existing.map(e => e.user_name));

            const validUsers = [];
            const failed = [];

            for (const u of users) {
                if (!u.user_name || !u.email || !u.role_id) {
                    failed.push({ user_name: u.user_name, email: u.email, reason: "Thiếu thông tin" });
                    continue;
                }

                if (existingEmails.has(u.email)) {
                    failed.push({ user_name: u.user_name, email: u.email, reason: "Trùng email" });
                    continue;
                }

                if (existingNames.has(u.user_name)) {
                    failed.push({ user_name: u.user_name, email: u.email, reason: "Trùng tên" });
                    continue;
                }

                const password = UserController.generateRandomPassword();
                const hashedPassword = await bcrypt.hash(password, 10);
                validUsers.push({ ...u, hashedPassword, plainPassword: password });
            }

            if (validUsers.length === 0) {
                return res.status(400).json({
                    status: "failure",
                    message: `Không có người dùng hợp lệ để tạo hoặc đã tồn tại trong hệ thống.`,
                    data: { failed }
                });
            }

            const insertedUsers = await User.bulkCreate(
                validUsers.map(u => ({
                    user_name: u.user_name,
                    email: u.email,
                    password: u.hashedPassword,
                    role_id: u.role_id
                }))
            );

            const limit = pLimit(20);
            const sendTasks = insertedUsers.map((newUser, index) =>
                limit(async () => {
                    const role = await Role.findByPk(newUser.role_id);
                    const originalUser = validUsers[index];
                    
                    if (role.name === 'student') {
                        await Student.create({ user_id: newUser.id, student_id: originalUser.user_name });
                    } else if (role.name === 'advisor') {
                        await Advisor.create({ user_id: newUser.id });
                    } else if (role.name === 'departmentofficer') {
                        await DepartmentOfficer.create({ user_id: newUser.id });
                    }

                    const htmlContent = `Tài khoản của bạn đã được tạo. Email: ${originalUser.email}, Mật khẩu: ${originalUser.plainPassword}`;
                    try {
                        await emailMiddleware(originalUser.email, "Mật khẩu mới của bạn", htmlContent);
                    } catch (e) {
                        failed.push({ user_name: originalUser.user_name, email: originalUser.email, reason: "Lỗi gửi email" });
                    }
                })
            );

            await Promise.all(sendTasks);

            res.status(201).json({
                status: failed.length === 0 ? "success" : "partial",
                message: `Tạo ${insertedUsers.length} người dùng thành công, ${failed.length} thất bại.`,
                data: {
                    createdUsers: insertedUsers.map((u, i) => ({
                        user_name: u.user_name,
                        email: u.email,
                        password: validUsers[i].plainPassword
                    })),
                    failed
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async deleteUser(req, res) {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            await user.destroy();
            res.status(200).json({ status: "success", message: "Xóa người dùng thành công." });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }
}

module.exports = UserController;

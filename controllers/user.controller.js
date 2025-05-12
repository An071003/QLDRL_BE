const User = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const pLimit = require('p-limit');
const emailMiddleware = require("../middlewares/emailMiddleware");
const Student = require("../models/studentModel");

class UserController {
    static generateRandomPassword = () => {
        return crypto.randomBytes(8).toString('hex');
    };

    static async getAllUsers(req, res) {
        try {
            const users = await User.selectAllUsers();
            res.status(200).json({ status: "success", data: { users } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async getUserById(req, res) {
        const { id } = req.params;
        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            res.status(200).json({ status: "success", data: { user } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async createUser(req, res) {
        const { name, email, role } = req.body;

        try {
            if (!name || !email || !role) {
                return res.status(400).json({ message: "Thiếu thông tin." });
            }

            const existing = await User.findExistingUsers(email, name);
            const existingEmails = new Set(existing.map(e => e.email));
            const existingNames = new Set(existing.map(e => e.name));

            if (existingEmails.has(email)) {
                return res.status(400).json({ message: "Email đã tồn tại." });
            }
            if (existingNames.has(name)) {
                return res.status(400).json({ message: "Tên đã tồn tại." });
            }

            const password = UserController.generateRandomPassword();
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await User.createUser({ name, email, hashedPassword, role });
            const newUser = await User.findById(result.insertId);

            const subject = "Mật khẩu mới của bạn";
            const htmlContent = `
            <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
                <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản người dùng mới</h2>
                <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
                    Chào ${name},<br>
                    Tài khoản của bạn đã được tạo thành công.
                </p>
                <p style="font-size: 18px; color: #ffffff; margin-bottom: 15px;">
                    Dưới đây là thông tin tài khoản của bạn:
                </p>
                <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                    <p style="font-size: 18px; font-weight: 700;">Tên người dùng: ${name}</p>
                    <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${password}</p>
                </div>
                <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
                    Vui lòng đăng nhập và thay đổi mật khẩu ngay sau khi truy cập tài khoản của bạn để đảm bảo an toàn.
                </p>
            </div>`;

            if (role === 'student') {
                await Student.createStudent({
                    id: name,
                    userId: newUser[0].id
                });
            }

            const emailresult = await emailMiddleware(email, subject, htmlContent);
            if (!emailresult.success) {
                return res.status(500).json({ message: emailresult.error });
            }

            res.status(201).json({ status: "success", data: { user: newUser } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async updateUser(req, res) {
        const { id } = req.params;
        const { role } = req.body;
        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            await User.updateUser(id, role);
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
            const names = users.map(u => u.name);
            const existing = await User.findExistingUsers(emails, names);

            const existingEmails = new Set(existing.map(e => e.email));
            const existingNames = new Set(existing.map(e => e.name));

            const validUsers = [];
            const failed = [];

            for (const u of users) {
                if (!u.name || !u.email || !u.role) {
                    failed.push({ name: u.name, email: u.email, reason: "Thiếu thông tin" });
                    continue;
                }

                if (existingEmails.has(u.email)) {
                    failed.push({ name: u.name, email: u.email, reason: "Trùng email" });
                    continue;
                }

                if (existingNames.has(u.name)) {
                    failed.push({ name: u.name, email: u.email, reason: "Trùng tên" });
                    continue;
                }

                const password = UserController.generateRandomPassword();
                const hashedPassword = await bcrypt.hash(password, 10);
                validUsers.push({ ...u, hashedPassword, plainPassword: password });
            }
            if(validUsers.length === 0){
                return res.status(400).json({
                    status: "failure",
                    message: `Không có người dùng hợp lệ để tạođể tạo hoặc chưa đã tồn tại trong hệ thống.`,
                    data: { failed }
                });
            }
            const insertResults = await User.bulkCreateUsers(validUsers);
            const startInsertId = insertResults.insertId;
            const pLimit = require('p-limit');
            const limit = pLimit(20);

            const sendTasks = validUsers.map((user, index) =>
                limit(async () => {
                    const newUserId = startInsertId + index;
                    if (user.role === 'student') {
                        await Student.createStudent({
                            id: user.name,
                            userId: newUserId
                        });
                    }

                    const htmlContent = `
                    <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
                        <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản người dùng mới</h2>
                        <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
                            Chào ${user.name},<br>
                            Tài khoản của bạn đã được tạo thành công.
                        </p>
                        <p style="font-size: 18px; color: #ffffff; margin-bottom: 15px;">
                            Dưới đây là thông tin tài khoản của bạn:
                        </p>
                        <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                            <p style="font-size: 18px; font-weight: 700;">Tên người dùng: ${user.name}</p>
                            <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${user.plainPassword}</p>
                        </div>
                        <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
                            Vui lòng đăng nhập và thay đổi mật khẩu ngay sau khi truy cập tài khoản của bạn để đảm bảo an toàn.
                        </p>
                    </div>`;

                    try {
                        await emailMiddleware(user.email, "Mật khẩu mới của bạn", htmlContent);
                    } catch (e) {
                        failed.push({ name: user.name, email: user.email, reason: "Lỗi gửi email" });
                    }
                })
            );

            await Promise.all(sendTasks);

            res.status(201).json({
                status: failed.length === 0 ? "success" : "partial",
                message: `Tạo ${validUsers.length} người dùng thành công, ${failed.length} thất bại.`,
                data: { createdUsers: validUsers.map(u => ({ name: u.name, email: u.email })), failed }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }


    static async deleteUser(req, res) {
        const { id } = req.params;
        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            await User.deleteUser(id);
            res.status(200).json({ status: "success", message: "Xóa người dùng thành công." });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }
}

module.exports = UserController;

const User = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const emailMiddleware = require("../middlewares/emailMiddleware");

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
    };

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
    };

    static async createUser(req, res) {
        const { name, email, role } = req.body;

        try {
            const existingUser = await User.findByUsername(name);
            if (existingUser) {
                return res.status(400).json({ message: "Tên người dùng đã tồn tại." });
            }

            const emailExists = await User.findByEmail(email);
            if (emailExists) {
                return res.status(400).json({ message: "Email đã tồn tại." });
            }
            const password = UserController.generateRandomPassword();

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.createUser({ name, email, hashedPassword, role });

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

            await emailMiddleware(email, subject, htmlContent, res);

            res.status(201).json({ status: "success", data: { user: newUser } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    };

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
    };

    static async createWithFileExcel(req, res) {
        const users = req.body;

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: "Danh sách người dùng không hợp lệ." });
        }

        try {
            const createdUsers = [];
            for (const user of users) {
                const { name, email, role } = user;
                
                if (!name || !email || !role) {
                    continue;
                }

                const existingUser = await User.findByUsername(name);
                const emailExists = await User.findByEmail(email);
                if (existingUser || emailExists) {
                    continue;
                }

                const password = UserController.generateRandomPassword();
                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = await User.createUser({ name, email, hashedPassword, role });

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

                await emailMiddleware(email, subject, htmlContent, res);

                createdUsers.push(newUser);
            }

            res.status(201).json({ status: "success", message: "Import người dùng thành công.", data: { createdUsers } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    };

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
    };
}

module.exports = UserController;
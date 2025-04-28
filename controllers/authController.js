const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Student = require("../models/studentModel");
const Email = require("../models/emailModel");
const emailMiddleware = require("../middlewares/emailMiddleware");

class AuthController {
    static signToken(user) {
        return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    };

    static createSendToken(user, statusCode, res) {
        const token = AuthController.signToken(user);
        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        res.cookie("token", token, cookieOptions);
        user.password = undefined;
        res.status(statusCode).json({
            status: "success",
            token,
            data: { user },
        });
    };

    static async login(req, res) {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng cung cấp tên đăng nhập và mật khẩu." });
        }

        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            AuthController.createSendToken(user, 200, res);
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    };

    static async register(req, res) {
        const { name, email, password, role = 'student', studentId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Thiếu thông tin." });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = { name, email, hashedPassword, role };

            const result = await User.createUser(user);
            const userId = result.insertId;

            if (role === 'student' && studentId) {
                await Student.insertStudent(name, userId);
                return res.status(201).json({ message: "Đăng ký thành công (student)." });
            }

            res.status(201).json({ message: `Đăng ký thành công (${role}).` });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Email đã tồn tại." });
            }
            console.error(err);
            res.status(500).json({ message: "Lỗi server.", error: err });
        }
    };

    static async logout(req, res) {
        res.cookie("token", "loggedout", {
            expires: new Date(Date.now() + 1000),
            httpOnly: true,
        });
        res.status(200).json({ status: "success" });
    };

    static async getMe(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }
            res.status(200).json({ status: "success", data: { user } });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    };


    static async sendOTP(req, res) {
        const { email } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "Email không tồn tại." });
            }
            
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await Email.createVerifyCode(user.id, otp, expiresAt);

            const subject = "Mã xác thực đổi mật khẩu";
            const htmlContent = `
                    <h2>Mã xác thực của bạn:</h2>
                    <p style="font-size: 24px; font-weight: bold;">${otp}</p>
                    <p>Mã sẽ hết hạn sau 10 phút.</p>
                `;

            await emailMiddleware(email, subject, htmlContent, res);

            res.status(200).json({ message: "Mã xác thực đã được gửi. Vui lòng kiểm tra email." });
        } catch (error) {
            console.error("Send xác thực Error: ", error);
            res.status(500).json({ message: "Lỗi gửi mã xác thực." });
        }
    }

    static async resetPassword(req, res) {
        const { email, otp, newPassword } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "Email không tồn tại." });
            }

            const validCode = await Email.findVerifyCode(user.id, otp);
            if (!validCode) {
                return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updateUserPassword(user.id, hashedPassword);

            await Email.deleteByUserId(user.id);

            res.status(200).json({ message: "Đổi mật khẩu thành công." });
        } catch (error) {
            console.error("Reset Password Error: ", error);
            res.status(500).json({ message: "Lỗi đổi mật khẩu." });
        }
    }
}

module.exports = AuthController;

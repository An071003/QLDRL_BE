const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Role, Student } = require("../models");
const emailMiddleware = require("../middlewares/emailMiddleware");
const EmailVerificationCode = require("../models/EmailVerificationCode.model");

class AuthController {
    static signToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    }

    static createSendToken(payload, user, statusCode, res) {
        const token = AuthController.signToken(payload);
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
    }

    static async login(req, res) {
        console.log("🌐 FRONTEND_URL =", process.env.FRONTEND_URL);
        const { user_name, password } = req.body;
        if (!user_name || !password) {
            return res.status(400).json({ message: "Vui lòng cung cấp tên đăng nhập và mật khẩu." });
        }

        try {
            const user = await User.findOne({
                where: { user_name },
                include: { model: Role, attributes: ['name'] }
            });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
            }

            const payload = { id: user.id, role: user.Role?.name || null };
            AuthController.createSendToken(payload, user, 200, res);
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ.", error: err });
        }
    }

    static async register(req, res) {
        const { user_name, email, password, role_id } = req.body;

        if (!user_name || !email || !password || !role_id) {
            return res.status(400).json({ message: "Thiếu thông tin." });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                user_name,
                email,
                password: hashedPassword,
                role_id
            });

            res.status(201).json({ message: "Đăng ký thành công.", user });
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ message: "Email hoặc tên đăng nhập đã tồn tại." });
            }
            console.error(err);
            res.status(500).json({ message: "Lỗi server.", error: err });
        }
    }

    static async logout(req, res) {
        res.cookie("token", "loggedout", {
            expires: new Date(Date.now() + 1000),
            httpOnly: true,
        });
        res.status(200).json({ status: "success" });
    }

    static async getMe(req, res) {
        try {
            const user = await User.findByPk(req.user.id, {
                include: [
                    {
                        model: Role,
                        attributes: ['name']
                    },
                    {
                        model: Student,
                        attributes: ['student_id']
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }

            res.status(200).json({
                status: "success",
                data: { user },
            });
        } catch (err) {
            res.status(500).json({ message: "Lỗi máy chủ." });
        }
    }

    static async sendOTP(req, res) {
        const { email } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "Email không tồn tại." });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

            await EmailVerificationCode.create({
                user_id: user.id,
                code: otp,
                expires_at: expiresAt,
            });

            const subject = "Mã xác thực đổi mật khẩu";
            const htmlContent = `
                <h2>Mã xác thực của bạn:</h2>
                <p style="font-size: 24px; font-weight: bold;">${otp}</p>
                <p>Mã sẽ hết hạn sau 2 phút.</p>
            `;

            await emailMiddleware(email, subject, htmlContent);
            res.status(200).json({ message: "Mã xác thực đã được gửi." });
        } catch (error) {
            console.error("Send OTP Error: ", error);
            res.status(500).json({ message: "Lỗi gửi mã xác thực." });
        }
    }

    static async resetPassword(req, res) {
        const { email, otp, newPassword } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "Email không tồn tại." });
            }

            const validCode = await EmailVerificationCode.findOne({
                where: { user_id: user.id, code: otp },
            });

            if (!validCode || validCode.expires_at < new Date()) {
                return res.status(400).json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.update({ password: hashedPassword }, { where: { id: user.id } });

            await EmailVerificationCode.destroy({ where: { user_id: user.id } });

            res.status(200).json({ message: "Đổi mật khẩu thành công." });
        } catch (error) {
            console.error("Reset Password Error: ", error);
            res.status(500).json({ message: "Lỗi đổi mật khẩu." });
        }
    }
}

module.exports = AuthController;

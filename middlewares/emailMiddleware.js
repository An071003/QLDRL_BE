const nodemailer = require('nodemailer');
const { User, EmailVerificationCode } = require('../models');
const cron = require("node-cron");
const { Op } = require('sequelize');
require('dotenv').config();

const sendEmail = async (toEmail, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: subject,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Lỗi gửi email:', error);
        throw new Error('Lỗi gửi email');
    }
};

const sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await EmailVerificationCode.create({
            user_id: user.id,
            code: otp,
            expires_at: expiresAt,
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã xác thực đổi mật khẩu',
            html: `
                <h2>Mã xác thực:</h2>
                <p style="font-size: 24px; font-weight: bold;">${otp}</p>
                <p>Mã có hiệu lực trong 10 phút.</p>
            `
        });

        res.status(200).json({ message: "Gửi mã OTP thành công. Vui lòng kiểm tra email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi gửi mã OTP." });
    }
};

const emailMiddleware = async (email, subject, htmlContent) => {
    try {
        await sendEmail(email, subject, htmlContent);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: "Lỗi gửi email." };
    }
};

cron.schedule("*/5 * * * *", async () => {
    try {
        const result = await EmailVerificationCode.destroy({
            where: {
                expires_at: {
                    [Op.lt]: new Date(),
                },
            },
        });
    } catch (error) {
        console.error("Lỗi khi dọn dẹp mã xác thực:", error);
    }
});

module.exports = emailMiddleware;
const nodemailer = require('nodemailer');

const sendEmail = async (toEmail, username, password) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: 'pekkidjj123@gmail.com',
        to: toEmail,
        subject: 'Tài khoản người dùng mới',
        html: `
        <div style="max-width: 800px; margin: 0 auto; background-color: #1b2838; color: #ffffff; padding: 30px; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
            <h2 style="font-size: 26px; color: #66c0f4; font-weight: 700; margin-bottom: 20px;">Tài khoản người dùng mới</h2>
            <p style="font-size: 16px; margin-bottom: 20px; color: #d1d5db;">
                Chào ${username},<br>
                Tài khoản của bạn đã được tạo thành công.
            </p>
            <p style="font-size: 18px; color: #ffffff; margin-bottom: 15px;">
                Dưới đây là thông tin tài khoản của bạn:
            </p>
            <div style="background-color: #171a21; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                <p style="font-size: 18px; font-weight: 700;">Tên người dùng: ${username}</p>
                <p style="font-size: 18px; font-weight: 700;">Mật khẩu: ${password}</p>
            </div>
            <p style="font-size: 16px; color: #ffffff; margin-top: 20px;">
                Vui lòng đăng nhập và thay đổi mật khẩu ngay sau khi truy cập tài khoản của bạn để đảm bảo an toàn.
            </p>
        </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Lỗi gửi email:', error);
        throw new Error('Lỗi gửi email');
    }
};

const emailMiddleware = (email, name, password, res) => {
    sendEmail(email, name, password)
        .then(() => next())
        .catch((err) => res.status(500).json({ message: "Lỗi gửi email." }));
};

module.exports = emailMiddleware;
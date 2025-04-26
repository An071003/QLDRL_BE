const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Student = require("../models/studentModel");

const signToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user);
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

const login = async (req, res) => {

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

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

const register = async (req, res) => {
    const { name, email, password, role = 'student', studentId } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Thiếu thông tin." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { name, email, password: hashedPassword, role };

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

const logout = (req, res) => {
    res.cookie("token", "loggedout", {
        expires: new Date(Date.now() + 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};

const getMe = async (req, res) => {
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


module.exports = { login, logout, register, getMe };

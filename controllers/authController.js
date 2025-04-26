const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUserByUsername, findUserById } = require("../models/userModel");

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
        const user = await findUserByUsername(username);
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

const logout = (req, res) => {
    res.cookie("token", "loggedout", {
        expires: new Date(Date.now() + 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};

const getMe = async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        user.password = undefined;
        res.status(200).json({ status: "success", data: { user } });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

module.exports = { login, logout, getMe };
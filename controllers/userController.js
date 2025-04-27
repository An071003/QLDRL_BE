const User = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const emailMiddleware = require("../middlewares/emailMiddleware");

const generateRandomPassword = () => {
    return crypto.randomBytes(8).toString('hex');
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.selectAllUsers();
        res.status(200).json({ status: "success", data: { users } });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

const getUserById = async (req, res) => {
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

const createUser = async (req, res) => {
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
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.createUser({ name, email, hashedPassword, role });

        await emailMiddleware(email, name, password);

        res.status(201).json({ status: "success", data: { user: newUser } });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        await User.updateUser(id, { name, email, role });
        res.status(200).json({ status: "success", message: "Cập nhật người dùng thành công." });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

const changePassword = async (req, res) => {
    const { id } = req.user.id;
    const { password } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        await User.updateUserPassword(id, password);
        res.status(200).json({ status: "success", message: "Cập nhật mật khẩu thành công." });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

const deleteUser = async (req, res) => {
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

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
const jwt = require("jsonwebtoken");
const { User, Role, Permission } = require("../models");

const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Bạn cần đăng nhập." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token không hợp lệ." });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này." });
        }
        next();
    };
};

const authorizePermissions = (...requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.id, {
                include: {
                    model: Role,
                    include: {
                        model: Permission,
                        attributes: ['name', 'action'],
                        through: { attributes: [] }
                    }
                }
            });

            const rolePermissions = user.Role?.Permissions || [];
            const userPermissions = rolePermissions.map(p => `${p.name}:${p.action}`);

            const hasAll = requiredPermissions.every(p => userPermissions.includes(p));

            if (!hasAll) {
                return res.status(403).json({ message: "Không đủ quyền." });
            }

            next();
        } catch (err) {
            console.error("Permission check failed", err);
            res.status(500).json({ message: "Lỗi xác thực quyền." });
        }
    };
};

module.exports = { authenticateUser, authorizeRoles, authorizePermissions };

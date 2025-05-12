const jwt = require("jsonwebtoken");
const { User, Permission } = require('../models');

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Authentication required." });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token." });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
        }
        next();
    };
};


const authorizePermissions = (...permissions) => {
    return async (req, res, next) => {
        const user = await User.findOne({
            where: { id: req.user.id },
            include: {
                model: Permission,
                through: { attributes: [] },
            }
        });
        const userPermissions = user ? user.Permissions.map(p => p.name) : [];
        const hasPermission = permissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        next();
    };
};


module.exports = { authenticateUser, authorizeRoles, authorizePermissions };

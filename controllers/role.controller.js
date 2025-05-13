const { Role } = require('../models');

class RoleController {
    static async getAllRoles(req, res) {
        try {
            const roles = await Role.findAll({
                attributes: ['id', 'name']
            });
            res.status(200).json({ roles });
        } catch (err) {
            console.error('Lỗi lấy danh sách role:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi lấy vai trò' });
        }
    }
}

module.exports = RoleController;

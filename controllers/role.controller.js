const { Role, Permission } = require('../models');

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

 static async getRolesById(req, res) {
        const { id } = req.params;

        try {
            const role = await Role.findByPk(id, {
                attributes: ['id', 'name'],
                include: {
                    model: Permission,
                    attributes: ['id', 'name', 'action'],
                    through: { attributes: [] },
                }
            });

            if (!role) {
                return res.status(404).json({ message: 'Không tìm thấy vai trò' });
            }

            res.status(200).json({ role });
        } catch (error) {
            console.error('Lỗi khi lấy vai trò theo ID:', error);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }

    static async createRole(req, res) {
        const { name } = req.body;
        try {
            const newRole = await Role.create({ name });
            res.status(201).json({ message: 'Role created successfully', role: newRole });
        } catch (err) {
            console.error('Lỗi tạo role:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi tạo role' });
        }
    }

    static async updateRole(req, res) {
        const { id } = req.params;
        const { name } = req.body;
        try {
            const role = await Role.findByPk(id);
            if (!role) {
                return res.status(404).json({ message: 'Role không tồn tại' });
            }
            role.name = name || role.name;
            await role.save();
            res.status(200).json({ message: 'Role updated successfully', role });
        } catch (err) {
            console.error('Lỗi cập nhật role:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật role' });
        }
    }

    static async deleteRole(req, res) {
        const { id } = req.params;
        try {
            const role = await Role.findByPk(id);
            if (!role) {
                return res.status(404).json({ message: 'Role không tồn tại' });
            }
            await role.destroy();
            res.status(200).json({ message: 'Role deleted successfully' });
        } catch (err) {
            console.error('Lỗi xóa role:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi xóa role' });
        }
    }
}

module.exports = RoleController;

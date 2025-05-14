const { Permission } = require('../models');

class PermissionController {
    static async getAllPermissions(req, res) {
        try {
            const permissions = await Permission.findAll({
                attributes: ['id', 'name', 'action']
            });
            res.status(200).json({ permissions });
        } catch (err) {
            console.error('Lỗi lấy danh sách permissions:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi lấy permissions' });
        }
    }

    static async createPermission(req, res) {
        const { name, action } = req.body;
        try {
            const newPermission = await Permission.create({ name, action });
            res.status(201).json({ message: 'Permission created successfully', permission: newPermission });
        } catch (err) {
            console.error('Lỗi tạo permission:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi tạo permission' });
        }
    }

    static async updatePermission(req, res) {
        const { id } = req.params;
        const { name, action } = req.body;
        try {
            const permission = await Permission.findByPk(id);
            if (!permission) {
                return res.status(404).json({ message: 'Permission không tồn tại' });
            }
            permission.name = name || permission.name;
            permission.action = action || permission.action;
            await permission.save();
            res.status(200).json({ message: 'Permission updated successfully', permission });
        } catch (err) {
            console.error('Lỗi cập nhật permission:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật permission' });
        }
    }

    static async deletePermission(req, res) {
        const { id } = req.params;
        try {
            const permission = await Permission.findByPk(id);
            if (!permission) {
                return res.status(404).json({ message: 'Permission không tồn tại' });
            }
            await permission.destroy();
            res.status(200).json({ message: 'Permission deleted successfully' });
        } catch (err) {
            console.error('Lỗi xóa permission:', err);
            res.status(500).json({ message: 'Lỗi máy chủ khi xóa permission' });
        }
    }
}

module.exports = PermissionController;

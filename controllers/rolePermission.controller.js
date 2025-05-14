const { Role, Permission } = require('../models');

class RolePermissionController {
    // Lấy tất cả permission theo role id
    static async getPermissionsByRole(req, res) {
        const { roleId } = req.params;
        try {
            const role = await Role.findByPk(roleId, {
                include: {
                    model: Permission,
                    attributes: ['id', 'name', 'action'],
                    through: { attributes: [] } // bỏ qua bảng trung gian
                }
            });
            if (!role) return res.status(404).json({ message: 'Role không tồn tại' });

            res.status(200).json({ permissions: role.Permissions });
        } catch (error) {
            console.error('Lỗi khi lấy permissions theo role:', error);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }

    // Gán một danh sách permission cho role
    static async assignPermissionsToRole(req, res) {
        const { roleId } = req.params;
        const { permissionIds } = req.body; // ví dụ: [1, 2, 3]

        try {
            const role = await Role.findByPk(roleId);
            if (!role) return res.status(404).json({ message: 'Role không tồn tại' });

            await role.setPermissions(permissionIds); // Xóa cũ, gán mới
            res.status(200).json({ message: 'Gán permission thành công' });
        } catch (error) {
            console.error('Lỗi khi gán permissions:', error);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }

    // Thêm một permission cho role (không xóa permission cũ)
    static async addPermissionToRole(req, res) {
        const { roleId } = req.params;
        const { permissionId } = req.body;

        try {
            const role = await Role.findByPk(roleId);
            if (!role) return res.status(404).json({ message: 'Role không tồn tại' });

            await role.addPermission(permissionId);
            res.status(200).json({ message: 'Đã thêm permission cho role' });
        } catch (error) {
            console.error('Lỗi khi thêm permission:', error);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }

    // Xóa một permission khỏi role
    static async removePermissionFromRole(req, res) {
        const { roleId, permissionId } = req.params;

        try {
            const role = await Role.findByPk(roleId);
            if (!role) return res.status(404).json({ message: 'Role không tồn tại' });

            await role.removePermission(permissionId);
            res.status(200).json({ message: 'Đã xóa permission khỏi role' });
        } catch (error) {
            console.error('Lỗi khi xóa permission:', error);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }
}

module.exports = RolePermissionController;

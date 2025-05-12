// const db = require("../config/db");

// class User {
//   static async findByUsername(username) {
//     const [result] = await db.promise().query("SELECT * FROM users WHERE name = ?", [username]);
//     return result[0];
//   }

//   static async findById(id) {
//     const [result] = await db.promise().query("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [id]);
//     return result;
//   }

//   static async findByEmail(email) {
//     const [result] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
//     return result[0];
//   }

//   static async createUser({ name, email, hashedPassword, role }) {
//     const [result] = await db.promise().query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, role]);
//     return result;
//   }

//   static async selectAllUsers() {
//     const [result] = await db.promise().query("SELECT * FROM users");
//     return result;
//   }

//   static async updateUser(id, role) {
//     const [result] = await db.promise().query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
//     return result;
//   }

//   static async updateUserPassword(id, password) {
//     const [result] = await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [password, id]);
//     return result;
//   }

//   static async deleteUser(id) {
//     const [result] = await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
//     return result;
//   }

//   static async findExistingUsers(emails, names) {
//     if (emails.length === 0 && names.length === 0) return [];

//     const [results] = await db.promise().query(
//       `SELECT email, name FROM users WHERE email IN (?) OR name IN (?)`,
//       [emails, names]
//     );
//     return results;
//   }

//   static async bulkCreateUsers(userList) {
//     if (userList.length === 0) return;

//     const values = userList.map(u => [u.name, u.email, u.hashedPassword, u.role]);
//     const [result] = await db.promise().query(
//       `INSERT INTO users (name, email, password, role) VALUES ?`,
//       [values]
//     );
//     return result;
//   }
// }

// module.exports = User;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Role = require('./role.model');

const User = sequelize.define('User', {
     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_name: { type: DataTypes.STRING(25), allowNull: false },
    email: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role_id: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: Role,  
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;
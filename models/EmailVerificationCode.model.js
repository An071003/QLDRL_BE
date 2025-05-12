const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model');

const EmailVerificationCode = sequelize.define('EmailVerificationCode', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    code: { type: DataTypes.STRING(6), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
    tableName: 'email_verification_codes',
    timestamps: false,
});

module.exports = EmailVerificationCode;

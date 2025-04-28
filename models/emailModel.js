const db = require("../config/db");

class Email {
    static async createVerifyCode(userId, code, expiresAt) {
        const [result] = await db.promise().query(
            "INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)",
            [userId, code, expiresAt]
        );
        return result;
    }

    static async findVerifyCode(userId, code) {
        const [result] = await db.promise().query(
            "SELECT * FROM email_verification_codes WHERE user_id = ? AND code = ? AND expires_at > NOW()",
            [userId, code]
        );
        return result[0];
    }


    static async deleteByUserId(userId) {
        await db.promise().query(
            "DELETE FROM email_verification_codes WHERE user_id = ?",
            [userId]
        );
    }
}

module.exports = Email;
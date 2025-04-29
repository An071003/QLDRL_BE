// === models/campaignModel.js ===
const db = require("../config/db");

class Campaign {
  static async findById(id) {
    const [result] = await db.promise().query(
      `SELECT id, criteria_id, name, max_score, semester, is_negative, negativescore
       FROM student_discipline_management.campaigns WHERE id = ?`,
      [id]
    );
    return result[0];
  }

  static async selectAllCampaigns() {
    const [result] = await db.promise().query(
      `SELECT c.id, c.criteria_id, c.name, c.max_score, c.semester, 
              c.is_negative, c.negativescore,
              s.name AS semester_name, s.start_year, s.end_year
       FROM student_discipline_management.campaigns c
       JOIN student_discipline_management.semester s ON c.semester = s.id`
    );
    return result;
  }
  

  static async createCampaign({ name, max_score, criteria_id, is_negative, negativescore, semester }) {
    const [result] = await db.promise().query(
      `INSERT INTO student_discipline_management.campaigns (name, max_score, criteria_id, is_negative, negativescore, semester)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, max_score, criteria_id, is_negative, negativescore, semester]
    );
    return result;
  }

  static async updateCampaign(id, { name, max_score, criteria_id, is_negative, negativescore }) {
    const [result] = await db.promise().query(
      `UPDATE student_discipline_management.campaigns 
       SET name = ?, max_score = ?, criteria_id = ?, is_negative = ?, negativescore = ?
       WHERE id = ?`,
      [name, max_score, criteria_id, is_negative, negativescore, id]
    );
    return result;
  }

  static async deleteCampaign(id) {
    const [result] = await db.promise().query(
      `DELETE FROM student_discipline_management.campaigns WHERE id = ?`,
      [id]
    );
    return result;
  }
}

module.exports = Campaign;

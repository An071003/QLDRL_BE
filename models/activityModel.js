const db = require("../config/db");

class Activity {
  static async findById(id) {
    const [result] = await db.promise().query(
      `SELECT a.id, a.name, a.point, a.is_negative, a.negativescore, a.status, a.number_students, 
              a.campaign_id, c.name AS campaign_name
       FROM student_discipline_management.activities a
       JOIN student_discipline_management.campaigns c ON a.campaign_id = c.id
       WHERE a.id = ?`,
      [id]
    );
    return result[0];
  }

  static async selectAllActivities() {
    const [result] = await db.promise().query(
      `SELECT a.id, a.name, a.point, a.is_negative, a.negativescore, a.status, a.number_students, 
              a.campaign_id, c.name AS campaign_name
       FROM student_discipline_management.activities a
       JOIN student_discipline_management.campaigns c ON a.campaign_id = c.id`
    );
    return result;
  }

  static async createActivity({ name, point, campaign_id, is_negative, negativescore }) {
    const [result] = await db.promise().query(
      `INSERT INTO student_discipline_management.activities (name, point, campaign_id, is_negative, negativescore)
       VALUES (?, ?, ?, ?, ?)`,
      [name, point, campaign_id, is_negative, negativescore]
    );
    return result;
  }

  static async updateActivity(id, { name, point, campaign_id, negativescore, status }) {
    const is_negative = negativescore !== 0;
    const adjustedNegativescore = is_negative ? negativescore : null;
    console.log("is_negative:", is_negative);
    console.log("Adjusted Negativescore:", adjustedNegativescore);
    const [result] = await db.promise().query(
      `UPDATE student_discipline_management.activities 
       SET name = ?, point = ?, campaign_id = ?, is_negative = ?, negativescore = ?, status = ?
       WHERE id = ?`,
      [name, point, campaign_id, is_negative, adjustedNegativescore, status, id]
    );
    return result;
  }

  static async deleteActivity(id) {
    const [result] = await db.promise().query(
      `DELETE FROM student_discipline_management.activities
       WHERE id = ?`,
      [id]
    );
    return result;
  }

  static async getPoint(id) {
    const [result] = await db.promise().query(
      `SELECT point FROM activities WHERE id = ?`,
      [id]
    );
    return result[0].point;
  }
}

module.exports = Activity;

// const db = require("../config/db");

// class Activity {
//   static async findById(id) {
//     const [result] = await db.promise().query(
//       `SELECT a.id, a.name, a.point, a.is_negative, a.negativescore, a.status, a.number_students, 
//               a.campaign_id, c.name AS campaign_name
//        FROM activities a
//        JOIN campaigns c ON a.campaign_id = c.id
//        WHERE a.id = ?`,
//       [id]
//     );
//     return result[0];
//   }

//   static async selectAllActivities() {
//     const [result] = await db.promise().query(
//       `SELECT a.id, a.name, a.point, a.is_negative, a.negativescore, a.status, a.number_students, 
//               a.campaign_id, c.name AS campaign_name,
//               c.semester, s.name AS semester_name, s.start_year, s.end_year
//        FROM activities a
//        JOIN campaigns c ON a.campaign_id = c.id
//        JOIN semester s ON c.semester = s.id`
//     );
//     return result;
//   }

//   static async createActivity({ name, point, campaign_id, is_negative, negativescore }) {
//     const [result] = await db.promise().query(
//       `INSERT INTO activities (name, point, campaign_id, is_negative, negativescore)
//        VALUES (?, ?, ?, ?, ?)`,
//       [name, point, campaign_id, is_negative, negativescore]
//     );
//     return result;
//   }

//   static async updateActivity(id, { name, point, campaign_id, negativescore, status }) {
//     const is_negative = negativescore !== 0;
//     const adjustedNegativescore = is_negative ? negativescore : null;

//     const [result] = await db.promise().query(
//       `UPDATE activities 
//        SET name = ?, point = ?, campaign_id = ?, is_negative = ?, negativescore = ?, status = ?
//        WHERE id = ?`,
//       [name, point, campaign_id, is_negative, adjustedNegativescore, status, id]
//     );
//     return result;
//   }

//   static async deleteActivity(id) {
//     const [result] = await db.promise().query(
//       `DELETE FROM activities
//        WHERE id = ?`,
//       [id]
//     );
//     return result;
//   }

//   static async getPoint(id) {
//     const [result] = await db.promise().query(
//       `SELECT point FROM activities WHERE id = ?`,
//       [id]
//     );
//     return result[0].point;
//   }
// }

// module.exports = Activity;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  campaign_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  point: { type: DataTypes.INTEGER, allowNull: false },
  max_participants: { type: DataTypes.INTEGER, defaultValue: 0 },
  number_students: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('ongoing', 'expired'), defaultValue: 'ongoing' },
  registration_start: { type: DataTypes.DATE },
  registration_end: { type: DataTypes.DATE },
  approver_id: { type: DataTypes.INTEGER },
  approved_at: { type: DataTypes.DATE },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'activities',
  timestamps: false,
});

module.exports = Activity;
``
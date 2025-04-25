const db = require("../config/db");

const insertStudentSql = async (studentId, userId) => {
  const [result] = await db.promise().query("INSERT INTO students (id, user_id) VALUES (?, ?)", [studentId, userId]);
  return result;
}

module.exports = {
  insertStudentSql,
};
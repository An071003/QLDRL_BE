const db = require("../config/db");

const findByUsername = async (username) => {
  const [rows] = await db.promise().query("SELECT * FROM users WHERE name = ?", [username]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.promise().query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

module.exports = {
  findByUsername,
  findById,
};

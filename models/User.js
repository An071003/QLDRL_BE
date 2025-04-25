const db = require("../config/db");

const findByUsername = async (username) => {
  const [rows] = await db.promise().query("SELECT * FROM users WHERE name = ?", [username]);
  return rows[0];
};

const insertUser = async (user) => {
  const { name, email, password, role } = user;
  const [result] = await db.promise().query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]);
  return result;
};


const findById = async (id) => {
  const [rows] = await db.promise().query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

module.exports = {
  findByUsername,
  findById,
  insertUser,
};

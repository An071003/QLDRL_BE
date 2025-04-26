const db = require("../config/db");

const findByUsername = async (username) => {
  const [result] = await db.promise().query("SELECT * FROM users WHERE name = ?", [username]);
  return result;
};

const findById = async (id) => {
  const [result] = await db.promise().query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
  return result;
};

const selectAllUsers = async () => { 
  const [result] = await db.promise().query("SELECT * FROM users");
  console.log(result);
  return result;
}

const createUser = async (user) => {
  const { name, email, password, role } = user;
  const [result] = await db.promise().query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]);
  return result;
};

const updateUser = async (id, user) => {
  const { name, email, role } = user;
  const [result] = await db.promise().query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [name, email, role, id]);
  return result;
};

const updateUserPassword = async (id, password) => {
  const [result] = await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [password, id]);
  return result;
};

deleteUser = async (id) => {
  const [result] = await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
  return result;
};

module.exports = {
  findByUsername,
  findById,
  createUser,
  selectAllUsers,
  selectAllUsers,
  updateUser,
};

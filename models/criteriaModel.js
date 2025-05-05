const db = require("../config/db");

class Criteria {
  static async findById(id) {
    const [result] = await db.promise().query(
      "SELECT id, name, max_score FROM criteria WHERE id = ?",
      [id]
    );
    return result[0];
  }

  static async selectAllCriteria() {
    const [result] = await db.promise().query(
      "SELECT id, name, max_score FROM criteria"
    );
    return result;
  }

  static async createCriteria({ name, max_score }) {
    const [result] = await db.promise().query(
      "INSERT INTO criteria (name, max_score) VALUES (?, ?)",
      [name, max_score]
    );
    return result;
  }

  static async updateCriteria(id, name, max_score) {
    const [result] = await db.promise().query(
      "UPDATE criteria SET name = ?, max_score = ? WHERE id = ?",
      [name, max_score, id]
    );
    return result;
  }

  static async deleteCriteria(id) {
    const [result] = await db.promise().query(
      "DELETE FROM criteria WHERE id = ?",
      [id]
    );
    return result;
  }
}

module.exports = Criteria;

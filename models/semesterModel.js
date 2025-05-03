const db = require("../config/db");

class Semester {
  static async selectAllSemesters() {
    const [rows] = await db.promise().query("SELECT * FROM semester");
    return rows;
  }

  static async createSemester() {
    const [lastSemester] = await db.promise().query(
      "SELECT * FROM semester ORDER BY id DESC LIMIT 1"
    );

    let name = "HK1";
    let start_year = new Date().getFullYear();
    let end_year = start_year + 1;

    if (lastSemester.length > 0) {
      const { name: lastName, start_year: lastStartYear, end_year: lastEndYear } = lastSemester[0];
      if (lastName === "HK1") {
        name = "HK2";
        start_year = lastStartYear;
        end_year = lastEndYear;
      } else {
        name = "HK1";
        start_year = lastStartYear + 1;
        end_year = lastEndYear + 1;
      }
    }

    await db.promise().query("CALL create_new_semester(?, ?, ?)", [
      name,
      start_year,
      end_year,
    ]);
  }

  static async deleteSemester(id) {
    const [result] = await db.promise().query("DELETE FROM semester WHERE id = ?", [id]);
    return result;
  }

  static async selectthelastid(){
    const [rows] = await db.promise().query("SELECT id FROM semester ORDER BY id DESC LIMIT 1");
    return rows;
  }
}

module.exports = Semester;

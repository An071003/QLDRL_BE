const StudentScore = require('../models/studentScore.model');
const Student = require('../models/student.model');
const Faculty = require('../models/faculty.model');
const Class = require('../models/class.model');
const db = require('../config/db');
const { QueryTypes } = require('sequelize');

class StudentScoreController {
  static async getAllStudentScores(req, res) {
    try {
      const studentScores = await StudentScore.findAll({
        include: [
          {
            model: Student,
            attributes: ['student_name'],
            include: [
              {
                model: Faculty,
                attributes: ['name', 'faculty_abbr']
              },
              {
                model: Class,
                attributes: ['name']
              }
            ]
          }
        ]
      });
      res.status(200).json({ status: "success", data: { studentScores } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStudentScoreById(req, res) {
    try {
      const { studentId } = req.params;
      const studentScores = await StudentScore.findAll({
        where: { student_id: studentId },
        order: [['academic_year', 'DESC'], ['semester_no', 'DESC']]
      });

      if (!studentScores || studentScores.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy điểm rèn luyện của sinh viên." });
      }

      res.status(200).json({ status: "success", data: { studentScores } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStudentScoresBySemester(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;
      
      const studentScores = await StudentScore.findAll({
        where: { 
          semester_no: semesterNo, 
          academic_year: academicYear 
        },
        include: [
          {
            model: Student,
            attributes: ['student_name'],
            include: [
              {
                model: Faculty,
                attributes: ['name', 'faculty_abbr']
              },
              {
                model: Class,
                attributes: ['name']
              }
            ]
          }
        ]
      });

      res.status(200).json({ status: "success", data: { studentScores } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async createNewSemester(req, res) {
    try {
      const { semester_no, academic_year } = req.body;

      if (!semester_no || !academic_year) {
        return res.status(400).json({ message: "Thiếu thông tin học kỳ hoặc năm học." });
      }

      await db.query('CALL create_new_semester(:semester_no, :academic_year)', {
        replacements: { 
          semester_no, 
          academic_year 
        },
        type: QueryTypes.RAW
      });

      res.status(201).json({ 
        status: "success", 
        message: `Đã tạo học kỳ mới ${semester_no}, năm học ${academic_year} thành công.` 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async updateStudentScore(req, res) {
    try {
      const { studentId, semesterNo, academicYear } = req.params;
      const { score, status, classification } = req.body;

      const studentScore = await StudentScore.findOne({
        where: {
          student_id: studentId,
          semester_no: semesterNo,
          academic_year: academicYear
        }
      });

      if (!studentScore) {
        return res.status(404).json({ message: "Không tìm thấy điểm rèn luyện của sinh viên." });
      }

      await StudentScore.update(
        { score, status, classification },
        {
          where: {
            student_id: studentId,
            semester_no: semesterNo,
            academic_year: academicYear
          }
        }
      );

      // Update student's total score
      await Student.update(
        {
          sumscore: db.literal(`(
            SELECT COALESCE(SUM(score), 0)
            FROM student_score
            WHERE student_id = '${studentId}'
          )`),
          classification: db.fn('get_classification', db.col('sumscore'), db.col('status'))
        },
        {
          where: { student_id: studentId }
        }
      );

      res.status(200).json({ 
        status: "success", 
        message: "Cập nhật điểm rèn luyện thành công." 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStatsByFaculty(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;

      const stats = await db.query(`
        SELECT f.faculty_abbr, f.name as faculty_name, 
               AVG(ss.score) as average_score,
               COUNT(ss.student_id) as student_count,
               SUM(CASE WHEN ss.score >= 90 THEN 1 ELSE 0 END) as excellent_count,
               SUM(CASE WHEN ss.score >= 80 AND ss.score < 90 THEN 1 ELSE 0 END) as good_count,
               SUM(CASE WHEN ss.score >= 70 AND ss.score < 80 THEN 1 ELSE 0 END) as fair_count,
               SUM(CASE WHEN ss.score >= 60 AND ss.score < 70 THEN 1 ELSE 0 END) as average_count,
               SUM(CASE WHEN ss.score < 60 THEN 1 ELSE 0 END) as poor_count
        FROM student_score ss
        JOIN students s ON ss.student_id = s.student_id
        JOIN faculties f ON s.faculty_id = f.id
        WHERE ss.semester_no = :semesterNo AND ss.academic_year = :academicYear
        GROUP BY f.id, f.faculty_abbr, f.name
      `, {
        replacements: { semesterNo, academicYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { stats } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStatsByClass(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;

      const stats = await db.query(`
        SELECT c.name as class_name, f.faculty_abbr, 
               AVG(ss.score) as average_score,
               COUNT(ss.student_id) as student_count,
               SUM(CASE WHEN ss.score >= 90 THEN 1 ELSE 0 END) as excellent_count,
               SUM(CASE WHEN ss.score >= 80 AND ss.score < 90 THEN 1 ELSE 0 END) as good_count,
               SUM(CASE WHEN ss.score >= 70 AND ss.score < 80 THEN 1 ELSE 0 END) as fair_count,
               SUM(CASE WHEN ss.score >= 60 AND ss.score < 70 THEN 1 ELSE 0 END) as average_count,
               SUM(CASE WHEN ss.score < 60 THEN 1 ELSE 0 END) as poor_count
        FROM student_score ss
        JOIN students s ON ss.student_id = s.student_id
        JOIN classes c ON s.class_id = c.id
        JOIN faculties f ON s.faculty_id = f.id
        WHERE ss.semester_no = :semesterNo AND ss.academic_year = :academicYear
        GROUP BY c.id, c.name, f.faculty_abbr
      `, {
        replacements: { semesterNo, academicYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { stats } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCurrentSemester(req, res) {
    try {
      const result = await db.query(`
        SELECT semester_no, academic_year
        FROM student_score
        ORDER BY academic_year DESC, semester_no DESC
        LIMIT 1
      `, {
        type: QueryTypes.SELECT
      });

      if (!result || result.length === 0) {
        return res.status(404).json({ message: "Không có học kỳ nào." });
      }

      res.status(200).json({ status: "success", data: { semester: result[0] } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getSemesters(req, res) {
    try {
      const semesters = await db.query(`
        SELECT DISTINCT semester_no, academic_year 
        FROM student_score
        ORDER BY academic_year DESC, semester_no DESC
      `, {
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { semesters } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async deleteSemester(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;

      const result = await StudentScore.destroy({
        where: {
          semester_no: semesterNo,
          academic_year: academicYear
        }
      });

      if (result === 0) {
        return res.status(404).json({ 
          message: `Không tìm thấy học kỳ ${semesterNo}, năm học ${academicYear}.` 
        });
      }

      res.status(200).json({ 
        status: "success", 
        message: `Đã xóa học kỳ ${semesterNo}, năm học ${academicYear} thành công.` 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = StudentScoreController; 
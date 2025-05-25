const StudentScore = require('../models/studentScore.model');
const Student = require('../models/student.model');
const Faculty = require('../models/faculty.model');
const Class = require('../models/class.model');
const db = require('../config/db');
const { QueryTypes } = require('sequelize');

class StudentScoreController {
  static async getAllStudents(req, res) {
    try {
      const { facultyId, search, page = 1, limit = 20, sortField = 'score', sortOrder = 'desc' } = req.query;

      let whereClause = {
        classification: {
          [db.Sequelize.Op.and]: [
            { [db.Sequelize.Op.not]: null },
            { [db.Sequelize.Op.ne]: '' }
          ]
        }
      };

      let includeClause = [
            {
              model: Faculty,
          attributes: ['name', 'faculty_abbr'],
          required: true
            },
            {
              model: Class,
          attributes: ['name'],
          required: true
        }
      ];

      // Add search condition
      if (search) {
        whereClause[db.Sequelize.Op.or] = [
          { student_id: { [db.Sequelize.Op.like]: `%${search}%` } },
          { student_name: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
      }

      // Add faculty filter
      if (facultyId && facultyId !== 'all') {
        whereClause.faculty_id = facultyId;
      }

      // Determine sort order
      let order = [];
      if (sortField === 'student_name') {
        order.push(['student_name', sortOrder]);
      } else if (sortField === 'faculty') {
        order.push([{ model: Faculty }, 'name', sortOrder]);
      } else if (sortField === 'class') {
        order.push([{ model: Class }, 'name', sortOrder]);
      } else if (sortField === 'score') {
        order.push(['sumscore', sortOrder]);
      }

      // Add secondary sort by student name
      if (sortField !== 'student_name') {
        order.push(['student_name', 'ASC']);
      }

      const { count, rows } = await Student.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: order,
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        distinct: true,
        attributes: [
          'student_id', 
          'student_name',
          'sumscore',
          'status',
          'classification'
        ]
      });
      return res.status(200).json({ 
        status: "success", 
        data: { 
          studentScores: rows.map(student => ({
            student_id: student.student_id,
            score: student.sumscore || 0,
            status: student.status || 'none',
            classification: student.classification,
            Student: {
              student_name: student.student_name,
              Faculty: student.Faculty,
              Class: student.Class
            }
          })),
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStudentScoresBySemester(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;
      const { facultyId, search, page = 1, limit = 20, sortField = 'score', sortOrder = 'desc' } = req.query;

      let whereClause = {
        semester_no: semesterNo,
        academic_year: academicYear,
        classification: {
          [db.Sequelize.Op.and]: [
            { [db.Sequelize.Op.not]: null },
            { [db.Sequelize.Op.ne]: '' }
          ]
        }
      };

      let includeClause = [
        {
          model: Student,
          attributes: ['student_id', 'student_name'],
          where: {},
          required: true,
          include: [
            {
              model: Faculty,
              attributes: ['name', 'faculty_abbr'],
              required: true
            },
            {
              model: Class,
              attributes: ['name'],
              required: true
            }
          ]
        }
      ];

      // Add faculty filter
      if (facultyId && facultyId !== 'all') {
        includeClause[0].where.faculty_id = facultyId;
      }

      // Add search condition
      if (search) {
        includeClause[0].where[db.Sequelize.Op.or] = [
          { student_id: { [db.Sequelize.Op.like]: `%${search}%` } },
          { student_name: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
      }

      // Determine sort order
      let order = [];
      if (sortField === 'student_name') {
        order.push([{ model: Student }, 'student_name', sortOrder]);
      } else if (sortField === 'faculty') {
        order.push([{ model: Student }, { model: Faculty }, 'name', sortOrder]);
      } else if (sortField === 'class') {
        order.push([{ model: Student }, { model: Class }, 'name', sortOrder]);
      } else {
        order.push([sortField, sortOrder]);
      }

      // Add secondary sort by student name
      if (sortField !== 'student_name') {
        order.push([{ model: Student }, 'student_name', 'ASC']);
      }

      const { count, rows } = await StudentScore.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: order,
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        distinct: true
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          studentScores: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        } 
      });
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
      const { score, status } = req.body;

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
        { score, status },
        {
          where: {
            student_id: studentId,
            semester_no: semesterNo,
            academic_year: academicYear
          }
        }
      );

      // Gọi procedure để cập nhật classification đúng chuẩn
      await db.query('CALL calculate_student_score(:studentId, :semesterNo, :academicYear)', {
        replacements: { studentId, semesterNo, academicYear }
      });

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
      const { facultyId } = req.query;

      let whereClause = 'WHERE ss.semester_no = :semesterNo AND ss.academic_year = :academicYear AND ss.classification IS NOT NULL';
      let replacements = { semesterNo, academicYear };
      
      if (facultyId && facultyId !== 'all') {
        whereClause += ' AND s.faculty_id = :facultyId';
        replacements.facultyId = facultyId;
      }

      // Thống kê toàn trường
      const [overallStats] = await db.query(`
        SELECT 
          COUNT(*) as total_students,
          AVG(ss.score) as average_score,
          SUM(CASE WHEN ss.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN ss.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN ss.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN ss.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN ss.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM student_score ss
        JOIN students s ON ss.student_id = s.student_id
        ${whereClause}
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      // Thống kê theo từng khoa
      const facultyStats = await db.query(`
        SELECT 
          f.faculty_abbr,
          f.name as faculty_name,
          COUNT(*) as total_students,
          AVG(ss.score) as average_score,
          SUM(CASE WHEN ss.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN ss.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN ss.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN ss.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN ss.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM student_score ss
        JOIN students s ON ss.student_id = s.student_id
        JOIN faculties f ON s.faculty_id = f.id
        ${whereClause}
        GROUP BY f.id, f.faculty_abbr, f.name
        ORDER BY average_score DESC
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          overall: overallStats,
          faculties: facultyStats 
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStatsByClass(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;
      const { facultyId } = req.query;

      let facultyCondition = '';
      let replacements = { semesterNo, academicYear };
      
      if (facultyId && facultyId !== 'all') {
        facultyCondition = 'AND s.faculty_id = :facultyId';
        replacements.facultyId = facultyId;
      }

      // Thống kê theo khoa
      const [facultyStats] = await db.query(`
        SELECT 
          f.faculty_abbr,
          f.name as faculty_name,
          COUNT(*) as total_students,
          AVG(ss.score) as average_score,
          SUM(CASE WHEN ss.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN ss.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN ss.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN ss.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN ss.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM student_score ss
        JOIN students s ON ss.student_id = s.student_id
        JOIN faculties f ON s.faculty_id = f.id
        WHERE ss.semester_no = :semesterNo 
        AND ss.academic_year = :academicYear
        AND ss.classification IS NOT NULL ${facultyCondition}
        GROUP BY f.id, f.faculty_abbr, f.name
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      // Thống kê theo từng lớp
      const classStats = await db.query(`
        SELECT 
          c.name as class_name,
          SUBSTRING(c.name, -4) as batch_year,
          f.faculty_abbr,
          COUNT(*) as total_students,
          AVG(ss.score) as average_score,
          SUM(CASE WHEN ss.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN ss.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN ss.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN ss.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN ss.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM student_score ss
        JOIN students s ON ss.student_id = s.student_id
        JOIN classes c ON s.class_id = c.id
        JOIN faculties f ON s.faculty_id = f.id
        WHERE ss.semester_no = :semesterNo 
        AND ss.academic_year = :academicYear
        AND ss.classification IS NOT NULL ${facultyCondition}
        GROUP BY c.id, c.name, f.faculty_abbr
        ORDER BY batch_year DESC, average_score DESC
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          faculty: facultyStats,
          classes: classStats 
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStatsByCohort(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;

      // Always use semester score and classification since we're looking at specific semester
      const batchStats = await db.query(`
        WITH student_stats AS (
          SELECT 
            c.cohort,
            c.name as class_name,
            s.student_id,
            ss.score,
            ss.classification
          FROM classes c
          INNER JOIN students s ON s.class_id = c.id
          INNER JOIN student_score ss ON s.student_id = ss.student_id
          WHERE ss.semester_no = :semesterNo 
          AND ss.academic_year = :academicYear
          AND ss.classification IS NOT NULL
        )
        SELECT 
          cohort,
          GROUP_CONCAT(DISTINCT class_name) as class_names,
          COUNT(DISTINCT student_id) as total_students,
          ROUND(AVG(score), 2) as average_score,
          CAST(SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) AS CHAR) as excellent_count,
          CAST(SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) AS CHAR) as good_count,
          CAST(SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) AS CHAR) as fair_count,
          CAST(SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) AS CHAR) as average_count,
          CAST(SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) AS CHAR) as poor_count,
          ROUND(
            (SUM(CASE WHEN classification IN ('Xuất sắc', 'Tốt') THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as excellent_good_rate,
          ROUND(
            (SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as excellent_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as good_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as fair_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as average_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as poor_percentage
        FROM student_stats
        GROUP BY cohort
        ORDER BY cohort DESC`, {
        replacements: { semesterNo, academicYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { batches: batchStats } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Thống kê theo khóa từ bảng students
  static async getStatsByStudentsCohort(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;
      
      // Build score selection based on whether semester is specified
      let scoreSelection = 's.sumscore';
      let scoreJoin = '';
      let whereCondition = 'WHERE c.cohort IS NOT NULL AND s.classification IS NOT NULL';
      let replacements = {};

      if (semesterNo && academicYear) {
        scoreSelection = 'ss.score';
        scoreJoin = `
          INNER JOIN student_score ss ON s.student_id = ss.student_id
          AND ss.semester_no = :semesterNo 
          AND ss.academic_year = :academicYear
        `;
        whereCondition += ' AND ss.classification IS NOT NULL';
        replacements = { semesterNo, academicYear };
      }

      const cohortStats = await db.query(`
        WITH student_stats AS (
          SELECT 
            c.cohort,
            c.name as class_name,
            s.student_id,
            ${scoreSelection} as score,
            s.classification
          FROM classes c
          INNER JOIN students s ON s.class_id = c.id
          ${scoreJoin}
          ${whereCondition}
        )
        SELECT 
          cohort,
          GROUP_CONCAT(DISTINCT class_name) as class_names,
          COUNT(DISTINCT student_id) as total_students,
          ROUND(AVG(score), 2) as average_score,
          CAST(SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) AS CHAR) as excellent_count,
          CAST(SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) AS CHAR) as good_count,
          CAST(SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) AS CHAR) as fair_count,
          CAST(SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) AS CHAR) as average_count,
          CAST(SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) AS CHAR) as poor_count,
          ROUND(
            (SUM(CASE WHEN classification IN ('Xuất sắc', 'Tốt') THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as excellent_good_rate,
          ROUND(
            (SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as excellent_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as good_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as fair_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as average_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as poor_percentage
        FROM student_stats
        GROUP BY cohort
        ORDER BY cohort DESC`, {
        replacements,
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { batches: cohortStats } 
      });
    } catch (err) {
      console.error('Error in getStatsByStudentsCohort:', err);
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
        WHERE classification IS NOT NULL
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

  static async getStatsByAcademicYear(req, res) {
    try {
      const { academicYear } = req.params;

      const stats = await db.query(`
        SELECT academic_year,
               AVG(ss.score) as average_score,
               COUNT(ss.student_id) as student_count,
               SUM(CASE WHEN ss.score >= 90 THEN 1 ELSE 0 END) as excellent_count,
               SUM(CASE WHEN ss.score >= 80 AND ss.score < 90 THEN 1 ELSE 0 END) as good_count,
               SUM(CASE WHEN ss.score >= 70 AND ss.score < 80 THEN 1 ELSE 0 END) as fair_count,
               SUM(CASE WHEN ss.score >= 60 AND ss.score < 70 THEN 1 ELSE 0 END) as average_count,
               SUM(CASE WHEN ss.score < 60 THEN 1 ELSE 0 END) as poor_count
        FROM student_score ss
        WHERE ss.academic_year = :academicYear
        GROUP BY ss.academic_year
      `, {
        replacements: { academicYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { stats } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStatsByFacultyAndYear(req, res) {
    try {
      const { academicYear } = req.params;

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
        WHERE ss.academic_year = :academicYear
        GROUP BY f.id, f.faculty_abbr, f.name
      `, {
        replacements: { academicYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { stats } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStatsByClassAndYear(req, res) {
    try {
      const { academicYear } = req.params;

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
        WHERE ss.academic_year = :academicYear
        GROUP BY c.id, c.name, f.faculty_abbr
      `, {
        replacements: { academicYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { stats } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getAcademicYears(req, res) {
    try {
      const years = await db.query(`
        SELECT DISTINCT academic_year 
        FROM student_score
        ORDER BY academic_year DESC
      `, {
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { years } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getClassStatsByCohort(req, res) {
    try {
      const { cohortYear } = req.params;
      const cohortYearNum = Number(cohortYear);

      // Validate the requested cohort year
      const validCohorts = await db.query(`
        SELECT DISTINCT cohort
        FROM classes
        WHERE cohort IS NOT NULL
        ORDER BY cohort DESC
        LIMIT 10
      `, {
        type: QueryTypes.SELECT
      });

      const validCohortYears = validCohorts.map(c => c.cohort);
      
      if (!validCohortYears.includes(cohortYearNum)) {
        return res.status(400).json({ 
          status: "error", 
          message: "Chỉ có thể xem thống kê của 10 khóa gần nhất" 
        });
      }

      const classStats = await db.query(`
        WITH student_semester_counts AS (
          SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count,
            SUM(score) as total_score
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        )
        SELECT 
          c.name as class_name,
          f.faculty_abbr,
          COUNT(*) as total_students,
          CAST(ROUND(AVG(total_score / NULLIF(semester_count, 0)), 2) AS DECIMAL(10,2)) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count,
          ROUND(
            SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as excellent_percentage,
          ROUND(
            SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as good_percentage,
          ROUND(
            SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as fair_percentage,
          ROUND(
            SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as average_percentage,
          ROUND(
            SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as poor_percentage
        FROM students s
        JOIN classes c ON s.class_id = c.id
        JOIN faculties f ON s.faculty_id = f.id
        LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
        WHERE s.classification IS NOT NULL
        AND c.cohort = :cohortYear
        GROUP BY c.id, c.name, f.faculty_abbr
        ORDER BY average_score DESC`, {
        replacements: { cohortYear: cohortYearNum },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { classes: classStats } 
      });
    } catch (err) {
      console.error('Error in getClassStatsByCohort:', err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Thống kê theo khóa cho tất cả học kỳ
  static async getStatsByCohortAll(req, res) {
    try {
      // Thống kê theo từng khóa
      const cohortStats = await db.query(`
        WITH student_semester_counts AS (
        SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count,
            SUM(score) as total_score
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        ),
        student_extraction AS (
          SELECT 
            s.student_id,
            s.classification,
            sc.semester_count,
            sc.total_score,
            SUBSTRING(c.name, -4) as cohort
          FROM students s
          JOIN classes c ON s.class_id = c.id
          LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
          WHERE s.classification IS NOT NULL
          AND c.name REGEXP '[0-9]{4}'
        )
        SELECT 
          cohort,
          COUNT(*) as total_students,
          CAST(ROUND(AVG(total_score / NULLIF(semester_count, 0)), 2) AS DECIMAL(10,2)) as average_score,
          SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count,
          ROUND(
            SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as excellent_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as good_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as fair_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as average_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as poor_percentage
        FROM student_extraction
        GROUP BY cohort
        ORDER BY cohort DESC`, {
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { batches: cohortStats } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCohortOverview(req, res) {
    try {
      const { cohortYear } = req.params;

      const cohortStats = await db.query(`
        WITH student_stats AS (
          SELECT 
            c.cohort,
            c.name as class_name,
            s.student_id,
            s.sumscore,
            s.classification
          FROM classes c
          INNER JOIN students s ON s.class_id = c.id
          WHERE c.cohort IS NOT NULL
            AND s.classification IS NOT NULL
            AND c.cohort = :cohortYear
        )
        SELECT 
          COUNT(DISTINCT student_id) as total_students,
          ROUND(AVG(sumscore), 2) as average_score,
          CAST(SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) AS CHAR) as excellent_count,
          CAST(SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) AS CHAR) as good_count,
          CAST(SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) AS CHAR) as fair_count,
          CAST(SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) AS CHAR) as average_count,
          CAST(SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) AS CHAR) as poor_count,
          ROUND(
            (SUM(CASE WHEN classification IN ('Xuất sắc', 'Tốt') THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as excellent_good_rate,
          ROUND(
            (SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as excellent_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as good_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as fair_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as average_percentage,
          ROUND(
            (SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0) / COUNT(DISTINCT student_id), 2
          ) as poor_percentage
        FROM student_stats`, {
        replacements: { cohortYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          batches: cohortStats
        } 
      });
    } catch (err) {
      console.error('Error in getCohortOverview:', err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCohortOverviewAll(req, res) {
    try {
      // Get overall statistics for all cohorts
      const [cohortStats] = await db.query(`
        WITH student_semester_counts AS (
          SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count,
            SUM(score) as total_score
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        ),
        student_extraction AS (
          SELECT 
            s.student_id,
            s.classification,
            sc.semester_count,
            sc.total_score,
            SUBSTRING(c.name, -4) as cohort
          FROM students s
          JOIN classes c ON s.class_id = c.id
          LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
          WHERE s.classification IS NOT NULL
          AND c.name REGEXP '[0-9]{4}'
        )
        SELECT 
          COUNT(*) as total_students,
          CAST(ROUND(AVG(total_score / NULLIF(semester_count, 0)), 2) AS DECIMAL(10,2)) as average_score,
          SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count,
          ROUND(
            SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as excellent_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as good_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as fair_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as average_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as poor_percentage
        FROM student_extraction`, {
        type: QueryTypes.SELECT
      });

      // Get faculty-wise distribution
      const facultyStats = await db.query(`
        WITH student_semester_counts AS (
          SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count,
            SUM(score) as total_score
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        ),
        faculty_extraction AS (
          SELECT 
            f.faculty_abbr,
            f.name as faculty_name,
            s.student_id,
            s.classification,
            sc.semester_count,
            sc.total_score
          FROM students s
          JOIN classes c ON s.class_id = c.id
          JOIN faculties f ON s.faculty_id = f.id
          LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
          WHERE s.classification IS NOT NULL
          AND c.name REGEXP '[0-9]{4}'
        )
        SELECT 
          faculty_abbr,
          faculty_name,
          COUNT(*) as total_students,
          AVG(total_score / NULLIF(semester_count, 0)) as average_score,
          SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count,
          ROUND(
            SUM(CASE WHEN classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as excellent_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as good_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Khá' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as fair_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as average_percentage,
          ROUND(
            SUM(CASE WHEN classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
          ) as poor_percentage
        FROM faculty_extraction
        GROUP BY faculty_abbr, faculty_name
        ORDER BY average_score DESC`, {
        type: QueryTypes.SELECT
      });

      // Get score distribution for pie chart
      const scoreDistribution = await db.query(`
        WITH score_ranges AS (
          SELECT 
            s.student_id,
            CASE 
              WHEN s.classification = 'Xuất sắc' THEN 'Xuất sắc'
              WHEN s.classification = 'Tốt' THEN 'Tốt'
              WHEN s.classification = 'Khá' THEN 'Khá'
              WHEN s.classification = 'Trung bình' THEN 'Trung bình'
              ELSE 'Yếu'
            END as classification_group
          FROM students s
          JOIN classes c ON s.class_id = c.id
          WHERE s.classification IS NOT NULL
          AND c.name REGEXP '[0-9]{4}'
        )
        SELECT 
          classification_group,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM score_ranges
        GROUP BY classification_group
        ORDER BY 
          CASE classification_group
            WHEN 'Xuất sắc' THEN 1
            WHEN 'Tốt' THEN 2
            WHEN 'Khá' THEN 3
            WHEN 'Trung bình' THEN 4
            ELSE 5
          END`, {
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          overview: cohortStats,
          facultyStats,
          scoreDistribution
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getCohortYears(req, res) {
    try {
      const years = await db.query(`
        SELECT DISTINCT cohort
        FROM classes
        WHERE cohort IS NOT NULL
          AND cohort <= YEAR(CURRENT_DATE())  -- Ensure cohort year is not in future
          AND cohort >= YEAR(CURRENT_DATE()) - 10  -- Only get last 10 years
        ORDER BY cohort DESC
        LIMIT 10
      `, {
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { years } });
    } catch (err) {
      console.error('Error in getCohortYears:', err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Alias for getCohortYears to maintain backward compatibility
  static async getBatchYears(req, res) {
    return StudentScoreController.getCohortYears(req, res);
  }

  static async getScoreDistribution(req, res) {
    try {
      const { semesterNo, academicYear } = req.params;

      const distribution = await db.query(`
        WITH score_ranges AS (
          SELECT 
            CASE 
              WHEN score >= 90 THEN 90
              WHEN score >= 80 THEN 80
              WHEN score >= 70 THEN 70
              WHEN score >= 60 THEN 60
              ELSE 0
            END as min_score,
            CASE 
              WHEN score >= 90 THEN 100
              WHEN score >= 80 THEN 89
              WHEN score >= 70 THEN 79
              WHEN score >= 60 THEN 69
              ELSE 59
            END as max_score,
            score
          FROM student_score
          WHERE semester_no = :semesterNo 
          AND academic_year = :academicYear
        )
        SELECT 
          min_score,
          max_score,
          COUNT(*) as count
        FROM score_ranges
        GROUP BY min_score, max_score
        ORDER BY min_score DESC
      `, {
        replacements: { semesterNo, academicYear },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { distribution } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Thống kê phân bố điểm cho tất cả học kỳ
  static async getScoreDistributionAll(req, res) {
    try {
      const distribution = await db.query(`
        WITH score_ranges AS (
          SELECT 
            CASE 
              WHEN score >= 90 THEN 90
              WHEN score >= 80 THEN 80
              WHEN score >= 70 THEN 70
              WHEN score >= 60 THEN 60
              ELSE 0
            END as min_score,
            CASE 
              WHEN score >= 90 THEN 100
              WHEN score >= 80 THEN 89
              WHEN score >= 70 THEN 79
              WHEN score >= 60 THEN 69
              ELSE 59
            END as max_score,
            score
          FROM student_score
        )
        SELECT 
          min_score,
          max_score,
          COUNT(*) as count
        FROM score_ranges
        GROUP BY min_score, max_score
        ORDER BY min_score DESC
      `, {
        type: QueryTypes.SELECT
      });

      res.status(200).json({ status: "success", data: { distribution } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Thống kê theo khoa cho tất cả học kỳ
  static async getStatsByFacultyAll(req, res) {
    try {
      // Thống kê toàn trường
      const [overallStats] = await db.query(`
        WITH student_semester_counts AS (
          SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        )
        SELECT 
          COUNT(*) as total_students,
          AVG(s.sumscore / NULLIF(sc.semester_count, 0)) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM students s
        LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
        WHERE s.classification IS NOT NULL
      `, {
        type: QueryTypes.SELECT
      });

      // Thống kê theo từng khoa
      const facultyStats = await db.query(`
        WITH student_semester_counts AS (
          SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        )
        SELECT 
          f.faculty_abbr,
          f.name as faculty_name,
          COUNT(*) as total_students,
          AVG(s.sumscore / NULLIF(sc.semester_count, 0)) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM students s
        JOIN faculties f ON s.faculty_id = f.id
        LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
        WHERE s.classification IS NOT NULL
        GROUP BY f.id, f.faculty_abbr, f.name
        ORDER BY average_score DESC
      `, {
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          overall: overallStats,
          faculties: facultyStats 
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Thống kê theo lớp cho tất cả học kỳ
  static async getStatsByClassAll(req, res) {
    try {
      const { facultyId } = req.query;

      let facultyCondition = '';
      let replacements = {};
      
      if (facultyId && facultyId !== 'all') {
        facultyCondition = 'AND s.faculty_id = :facultyId';
        replacements.facultyId = facultyId;
      }

      // Thống kê theo khoa được chọn
      const [facultyStats] = await db.query(`
        WITH student_semester_counts AS (
          SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        )
        SELECT 
          f.faculty_abbr,
          f.name as faculty_name,
          COUNT(*) as total_students,
          AVG(s.sumscore / NULLIF(sc.semester_count, 0)) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM students s
        JOIN faculties f ON s.faculty_id = f.id
        LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
        WHERE s.classification IS NOT NULL ${facultyCondition}
        GROUP BY f.id, f.faculty_abbr, f.name
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      // Thống kê theo từng lớp
      const classStats = await db.query(`
        WITH student_semester_counts AS (
          SELECT 
            student_id,
            COUNT(DISTINCT CONCAT(semester_no, '_', academic_year)) as semester_count
          FROM student_score
          WHERE classification IS NOT NULL
          GROUP BY student_id
        )
        SELECT 
          c.name as class_name,
          SUBSTRING(c.name, -4) as batch_year,
          f.faculty_abbr,
          COUNT(*) as total_students,
          AVG(s.sumscore / NULLIF(sc.semester_count, 0)) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM students s
        JOIN classes c ON s.class_id = c.id
        JOIN faculties f ON s.faculty_id = f.id
        LEFT JOIN student_semester_counts sc ON s.student_id = sc.student_id
        WHERE s.classification IS NOT NULL ${facultyCondition}
        GROUP BY c.id, c.name, f.faculty_abbr
        ORDER BY batch_year DESC, average_score DESC
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          faculty: facultyStats,
          classes: classStats 
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStudentsByClass(req, res) {
    try {
      const { className } = req.params;
      
      // Find the class first
      const targetClass = await Class.findOne({
        where: { name: className }
      });

      if (!targetClass) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
      
      const students = await Student.findAll({
        where: { class_id: targetClass.id },
        include: [
          {
            model: StudentScore,
            required: false,
            where: {},
            attributes: ['score', 'classification']
          }
        ],
        attributes: ['student_id', 'student_name']
      });

      const formattedStudents = students.map(student => ({
        student_id: student.student_id,
        full_name: student.student_name,
        score: student.StudentScores[0]?.score || 0,
        classification: student.StudentScores[0]?.classification || 'Chưa có'
      }));

      res.json({
        success: true,
        data: {
          students: formattedStudents
        }
      });
    } catch (error) {
      console.error('Error getting students by class:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getStudentsByClassAndSemester(req, res) {
    try {
      const { className, semesterNo, academicYear } = req.params;
      
      // Find the class first
      const targetClass = await Class.findOne({
        where: { name: className }
      });

      if (!targetClass) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
      
      const students = await Student.findAll({
        where: { class_id: targetClass.id },
        include: [
          {
            model: StudentScore,
            required: false,
            where: {
              semester_no: semesterNo,
              academic_year: academicYear
            },
            attributes: ['score', 'classification']
          }
        ],
        attributes: ['student_id', 'student_name']
      });

      const formattedStudents = students.map(student => ({
        student_id: student.student_id,
        full_name: student.student_name,
        score: student.StudentScores[0]?.score || 0,
        classification: student.StudentScores[0]?.classification || 'Chưa có'
      }));

      res.json({
        success: true,
        data: {
          students: formattedStudents
        }
      });
    } catch (error) {
      console.error('Error getting students by class and semester:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getStatsByStudentsClass(req, res) {
    try {
      const { facultyId, semesterNo, academicYear } = req.query;
      let whereClause = 'WHERE s.classification IS NOT NULL';
      let replacements = {};
      
      if (facultyId && facultyId !== 'all') {
        whereClause += ' AND s.faculty_id = :facultyId';
        replacements.facultyId = facultyId;
      }

      // Add semester filtering if provided
      let scoreSelection = 's.sumscore';
      let scoreJoin = '';
      if (semesterNo && academicYear) {
        scoreSelection = 'ss.score';
        scoreJoin = `
          INNER JOIN student_score ss ON s.student_id = ss.student_id
          AND ss.semester_no = :semesterNo 
          AND ss.academic_year = :academicYear
        `;
        whereClause += ' AND ss.classification IS NOT NULL';
        replacements.semesterNo = semesterNo;
        replacements.academicYear = academicYear;
      }

      // Thống kê theo khoa
      const [facultyStats] = await db.query(`
          SELECT 
          f.faculty_abbr,
          f.name as faculty_name,
          COUNT(*) as total_students,
          AVG(${scoreSelection}) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM students s
        JOIN faculties f ON s.faculty_id = f.id
        ${scoreJoin}
        ${whereClause}
        GROUP BY f.id, f.faculty_abbr, f.name
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      // Thống kê theo từng lớp
      const classStats = await db.query(`
          SELECT 
          c.name as class_name,
          SUBSTRING(c.name, -4) as batch_year,
          f.faculty_abbr,
          COUNT(*) as total_students,
          AVG(${scoreSelection}) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
          FROM students s
        JOIN classes c ON s.class_id = c.id
        JOIN faculties f ON s.faculty_id = f.id
        ${scoreJoin}
        ${whereClause}
        GROUP BY c.id, c.name, f.faculty_abbr
        ORDER BY batch_year DESC, average_score DESC
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          faculty: facultyStats,
          classes: classStats 
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getStatsByStudentsFaculty(req, res) {
    try {
      const { facultyId } = req.query;
      let whereClause = 'WHERE s.classification IS NOT NULL';
      let replacements = {};
      
      if (facultyId && facultyId !== 'all') {
        whereClause += ' AND s.faculty_id = :facultyId';
        replacements.facultyId = facultyId;
      }

      // Thống kê toàn trường
      const [overallStats] = await db.query(`
        SELECT 
          COUNT(*) as total_students,
          AVG(s.sumscore) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
        FROM students s
        ${whereClause}
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      // Thống kê theo từng khoa
      const facultyStats = await db.query(`
        SELECT 
          f.faculty_abbr,
          f.name as faculty_name,
          COUNT(*) as total_students,
          AVG(s.sumscore) as average_score,
          SUM(CASE WHEN s.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN s.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN s.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN s.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN s.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count
          FROM students s
        JOIN faculties f ON s.faculty_id = f.id
        ${whereClause}
        GROUP BY f.id, f.faculty_abbr, f.name
        ORDER BY average_score DESC
      `, {
        replacements,
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { 
          overall: overallStats,
          faculties: facultyStats 
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  static async getClassStatsByCohortAndSemester(req, res) {
    try {
      const { cohortYear, semesterNo, academicYear } = req.params;
      const cohortYearNum = Number(cohortYear);

      // Validate the requested cohort year
      const validCohorts = await db.query(`
        SELECT DISTINCT cohort
        FROM classes
        WHERE cohort IS NOT NULL
        ORDER BY cohort DESC
        LIMIT 10
      `, {
        type: QueryTypes.SELECT
      });

      const validCohortYears = validCohorts.map(c => c.cohort);
      
      if (!validCohortYears.includes(cohortYearNum)) {
        return res.status(400).json({ 
          status: "error", 
          message: "Chỉ có thể xem thống kê của 10 khóa gần nhất" 
        });
      }

      const classStats = await db.query(`
        SELECT 
          c.name as class_name,
          f.faculty_abbr,
          COUNT(DISTINCT s.student_id) as total_students,
          CAST(ROUND(AVG(ss.score), 2) AS DECIMAL(10,2)) as average_score,
          SUM(CASE WHEN ss.classification = 'Xuất sắc' THEN 1 ELSE 0 END) as excellent_count,
          SUM(CASE WHEN ss.classification = 'Tốt' THEN 1 ELSE 0 END) as good_count,
          SUM(CASE WHEN ss.classification = 'Khá' THEN 1 ELSE 0 END) as fair_count,
          SUM(CASE WHEN ss.classification = 'Trung bình' THEN 1 ELSE 0 END) as average_count,
          SUM(CASE WHEN ss.classification = 'Yếu' THEN 1 ELSE 0 END) as poor_count,
          ROUND(
            SUM(CASE WHEN ss.classification = 'Xuất sắc' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT s.student_id), 2
          ) as excellent_percentage,
          ROUND(
            SUM(CASE WHEN ss.classification = 'Tốt' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT s.student_id), 2
          ) as good_percentage,
          ROUND(
            SUM(CASE WHEN ss.classification = 'Khá' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT s.student_id), 2
          ) as fair_percentage,
          ROUND(
            SUM(CASE WHEN ss.classification = 'Trung bình' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT s.student_id), 2
          ) as average_percentage,
          ROUND(
            SUM(CASE WHEN ss.classification = 'Yếu' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT s.student_id), 2
          ) as poor_percentage
        FROM students s
        JOIN classes c ON s.class_id = c.id
        JOIN faculties f ON s.faculty_id = f.id
        JOIN student_score ss ON s.student_id = ss.student_id
        WHERE c.cohort = :cohortYear
        AND ss.semester_no = :semesterNo
        AND ss.academic_year = :academicYear
        AND ss.classification IS NOT NULL
        GROUP BY c.id, c.name, f.faculty_abbr
        ORDER BY average_score DESC`, {
        replacements: { 
          cohortYear: cohortYearNum,
          semesterNo,
          academicYear
        },
        type: QueryTypes.SELECT
      });

      res.status(200).json({ 
        status: "success", 
        data: { classes: classStats } 
      });
    } catch (err) {
      console.error('Error in getClassStatsByCohortAndSemester:', err);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }
}

module.exports = StudentScoreController; 
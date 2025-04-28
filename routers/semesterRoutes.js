const express = require('express');
const SemesterController = require('../controllers/semesterController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateUser, authorizeRoles('admin'), SemesterController.getAllSemesters);
router.post('/', authenticateUser, authorizeRoles('admin'), SemesterController.createSemester);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), SemesterController.deleteSemester);

module.exports = router;

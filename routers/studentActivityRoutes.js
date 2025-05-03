const express = require('express');
const StudentActivityController = require('../controllers/studentActivityController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:activityId/', authenticateUser, authorizeRoles('admin', 'lecturer', 'student'), StudentActivityController.getStudentsByActivity);
router.get('/:activityId/not-participated',authenticateUser, authorizeRoles('admin', 'lecturer', 'student'), StudentActivityController.getStudentsNotInActivity);
router.post('/:activityId/students', authenticateUser, authorizeRoles('admin', 'lecturer', 'student'), StudentActivityController.addStudent);
router.delete('/:activityId/students/:studentIds', authenticateUser, authorizeRoles('admin', 'lecturer', 'student'), StudentActivityController.removeStudent);

module.exports = router;

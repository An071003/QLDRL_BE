const express = require('express');
const StudentActivityController = require('../controllers/studentActivityController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:activityId/', authenticateUser, StudentActivityController.getStudentsByActivity);
router.get('/:activityId/not-participated', authenticateUser, StudentActivityController.getStudentsNotInActivity);
router.post('/:activityId/students', authenticateUser, authorizeRoles('admin', 'lecturer', 'student'), StudentActivityController.addStudent);
router.post('/:activityId/import', authenticateUser, authorizeRoles('admin', 'lecturer'), StudentActivityController.importStudents);
router.patch('/:activityId/', authenticateUser, authorizeRoles('admin', 'lecturer'), StudentActivityController.editStudentParticipation);
router.delete('/:activityId/students/:studentIds', authenticateUser, StudentActivityController.removeStudent);
router.get('/student/:studentId', authenticateUser, authorizeRoles('admin', 'lecturer', 'student'), StudentActivityController.getStudentActivitiesBySemester);
router.get('/:studentId/all', authenticateUser, authorizeRoles('admin', 'lecturer', 'student'), StudentActivityController.getActivityByStudent);
router.get('/:studentId/available', authenticateUser, StudentActivityController.getAvailableActivitiesForStudent);



module.exports = router;

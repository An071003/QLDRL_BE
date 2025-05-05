const express = require('express');
const StudentActivityController = require('../controllers/studentActivityController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:activityId/', authenticateUser, StudentActivityController.getStudentsByActivity);
router.get('/:activityId/not-participated', authenticateUser, StudentActivityController.getStudentsNotInActivity);
router.post('/:activityId/students', authenticateUser, StudentActivityController.addStudent);
router.post('/:activityId/import', authenticateUser, authorizeRoles('admin', 'lecturer'), StudentActivityController.importStudents);
router.patch('/:activityId/', authenticateUser, authorizeRoles('admin', 'lecturer'), StudentActivityController.editStudentParticipation);
router.delete('/:activityId/students/:studentIds', authenticateUser, StudentActivityController.removeStudent);

module.exports = router;

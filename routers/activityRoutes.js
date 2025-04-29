const express = require('express');
const ActivityController = require('../controllers/activityController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateUser, authorizeRoles('admin'), ActivityController.getAllActivities);
router.get('/:id', authenticateUser, authorizeRoles('admin'), ActivityController.getActivityById);
router.post('/', authenticateUser, authorizeRoles('admin'), ActivityController.createActivity);
router.put('/:id', authenticateUser, authorizeRoles('admin'), ActivityController.updateActivity);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), ActivityController.deleteActivity);
router.post('/import', authenticateUser, authorizeRoles('admin'), ActivityController.importActivities);

module.exports = router;

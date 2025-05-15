const express = require('express');
const FacultyController = require('../controllers/faculty.controller');
const {authenticateUser} = require("../middlewares/authMiddleware")
const router = express.Router();

router.get('/', authenticateUser, FacultyController.getAllFaculties);
router.get('/:id', authenticateUser, FacultyController.getFacultyById);
router.post('/', authenticateUser, FacultyController.createFaculty);
router.put('/:id', authenticateUser, FacultyController.updateFaculty);
router.delete('/:id', authenticateUser, FacultyController.deleteFaculty);

module.exports = router;
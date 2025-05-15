const express = require('express');
const FacultyController = require('../controllers/faculty.controller');
const router = express.Router();

router.get('/', FacultyController.getAllFaculties);
router.get('/:id', FacultyController.getFacultyById);
router.post('/', FacultyController.createFaculty);
router.put('/:id', FacultyController.updateFaculty);
router.delete('/:id', FacultyController.deleteFaculty);

module.exports = router;
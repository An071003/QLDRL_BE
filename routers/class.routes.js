const express = require('express');
const ClassController = require('../controllers/class.controller');
const router = express.Router();

router.get('/', ClassController.getAllClasses);
router.get('/:id', ClassController.getClassById);
router.post('/', ClassController.createClass);
router.put('/:id', ClassController.updateClass);
router.delete('/:id', ClassController.deleteClass);

module.exports = router;
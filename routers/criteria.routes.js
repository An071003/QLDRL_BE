// const express = require('express');
// const CriteriaController = require('../controllers/criteriaController');
// const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

// const router = express.Router();

// router.get('/', authenticateUser, authorizeRoles('admin', 'lecturer'), CriteriaController.getAllCriteria);
// router.get('/:id', authenticateUser, authorizeRoles('admin'), CriteriaController.getCriteriaById);
// router.post('/', authenticateUser, authorizeRoles('admin'), CriteriaController.createCriteria);
// router.put('/:id', authenticateUser, authorizeRoles('admin'), CriteriaController.updateCriteria);
// router.delete('/:id', authenticateUser, authorizeRoles('admin'), CriteriaController.deleteCriteria);
// router.post('/import', authenticateUser, authorizeRoles('admin'), CriteriaController.importCriteria);

// module.exports = router;

const express = require('express');
const { getAllUsers, getUserById, deleteUser, updateUser, createUser } = require('../controllers/userController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');
const router = express.Router();


router.get('/', authenticateUser, authorizeRoles('admin'), getAllUsers);
router.get('/:id', authenticateUser, authorizeRoles('admin'), getUserById);
router.post('/', authenticateUser, authorizeRoles('admin'), createUser);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateUser);
// router.patch('/changePassword', authenticateUser, updateUserpawssword);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteUser);

module.exports = router;
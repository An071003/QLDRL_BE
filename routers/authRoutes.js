const express = require('express');
const router = express.Router();
const { login, logout, getMe } = require('../controllers/authController');
const {authenticateUser, authorizeRoles} = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);
router.get('/admin', authenticateUser, authorizeRoles(['admin']), (req, res) => res.json({ message: 'Chào Admin' }));
router.get('/lecture', authenticateUser, authorizeRoles(['lecture']), (req, res) => res.json({ message: 'Chào Giảng viên' }));
router.get('/student', authenticateUser, authorizeRoles(['student']), (req, res) => res.json({ message: 'Chào Sinh viên' }));

module.exports = router;
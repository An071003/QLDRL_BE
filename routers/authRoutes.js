const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const {authenticateUser, authorizeRoles} = require('../middlewares/authMiddleware');

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/register', AuthController.register);
router.get('/me', authenticateUser, AuthController.getMe);
router.post("/send-otp", AuthController.sendOTP);
router.post("/reset-password", AuthController.resetPassword);
router.get('/admin', authenticateUser, authorizeRoles('admin'), (req, res) => res.json({ message: 'Chào Admin' }));
router.get('/lecture', authenticateUser, authorizeRoles('lecture'), (req, res) => res.json({ message: 'Chào Giảng viên' }));
router.get('/student', authenticateUser, authorizeRoles('student'), (req, res) => res.json({ message: 'Chào Sinh viên' }));

module.exports = router;
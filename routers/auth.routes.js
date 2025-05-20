const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const {authenticateUser, authorizeRoles} = require('../middlewares/authMiddleware');

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/register', AuthController.register);
router.get('/me', authenticateUser, AuthController.getMe);
router.post("/send-otp", AuthController.sendOTP);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
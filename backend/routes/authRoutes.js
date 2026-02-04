const express = require('express');
const router = express.Router();
const {
    register,
    verifyOtp,
    resendOtp,
    login,
    getProfile,
    updateProfile,
    changePassword,
    deleteMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/me', protect, deleteMe);

module.exports = router;

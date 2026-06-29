const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
// Forgot password routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/profile/picture', protect, upload.single('image'), authController.updateProfilePicture);
router.delete('/profile/picture', protect, authController.removeProfilePicture);
router.post('/initiate-email-change', protect, authController.initiateEmailChange);
router.put('/verify-email-change', protect, authController.verifyEmailChange);
router.put('/change-password', protect, authController.changePassword);
router.post('/initiate-account-deletion', protect, authController.initiateAccountDeletion);
router.delete('/me', protect, authController.deleteMe);

module.exports = router;

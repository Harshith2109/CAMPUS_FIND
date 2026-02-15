const User = require('../models/User');
const TemporaryUser = require('../models/TemporaryUser');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, department, role } = req.body;

        // Strong password regex
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
            });
        }

        // Validate email domain
        if (!email || !email.endsWith('@rvce.edu.in')) {
            return res.status(400).json({
                success: false,
                message: 'Please use your RVCE email address (yourname@rvce.edu.in)'
            });
        }

        // Check if user already exists in main User collection (explicit lowercase)
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Remove any existing temporary user with same email (explicit lowercase)
        await TemporaryUser.deleteOne({ email: email.toLowerCase() });

        // Create temporary user
        // Note: Password hashing is handled in the TemporaryUser model pre-save hook
        await TemporaryUser.create({
            name,
            email,
            password,
            phone,
            department,
            role: role || 'user'
        });

        // Generate and send OTP
        const otpResult = await otpService.createOTP(email);
        if (otpResult.success) {
            await emailService.sendOtpEmail(email, otpResult.otp);
        }

        res.status(201).json({
            success: true,
            message: 'Registration initiated! Please verify your email with the OTP sent to your email to complete registration.',
            requiresEmailVerification: true,
            email: email
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Verify OTP
        const verifyResult = await otpService.verifyOTP(email, otp);

        if (!verifyResult.success) {
            return res.status(400).json({
                success: false,
                message: verifyResult.message
            });
        }

        // Check if this is an existing user verifying (unlikely with new flow but good for robustness)
        // or a new user registration from TemporaryUser

        // 1. Check TemporaryUser first (explicit lowercase)
        const tempUser = await TemporaryUser.findOne({ email: email.toLowerCase() });

        let user;

        if (tempUser) {
            // Move from TemporaryUser to User
            // The User model's pre-save hook will hash the password now
            user = await User.create({
                name: tempUser.name,
                email: tempUser.email,
                password: tempUser.password, // Plain text from TemporaryUser
                phone: tempUser.phone,
                department: tempUser.department,
                role: tempUser.role,
                isEmailVerified: true,
                verified: true
            });

            // Delete temporary user
            await TemporaryUser.deleteOne({ _id: tempUser._id });
        } else {
            // 2. Check existing User (legacy flow or re-verification if implemented)
            user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Registration session expired or user not found. Please register again.'
                });
            }

            // Update existing user
            user.isEmailVerified = true;
            user.verified = true;
            await user.save();
        }

        // Send welcome email
        await emailService.sendWelcomeEmail(user);

        // Generate token
        const token = user.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Email verified and account created successfully!',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        // If specific error occurs (e.g., duplicate key if race condition), handle it
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already registered.'
            });
        }
        next(error);
    }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        let userExists = false;

        // 1. Check if user exists in main User collection
        const user = await User.findOne({ email });

        if (user) {
            // Check if email is already verified
            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified'
                });
            }
            userExists = true;
        } else {
            // 2. Check TemporaryUser if not in main User collection
            const tempUser = await TemporaryUser.findOne({ email });
            if (tempUser) {
                userExists = true;
            }
        }

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate and send OTP
        const otpResult = await otpService.resendOTP(email);
        if (otpResult.success) {
            await emailService.sendOtpEmail(email, otpResult.otp);
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to resend OTP'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully. Please check your email.',
            expiresIn: otpResult.expiresIn
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password (ensure lowercase email for lookup)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been banned. Please contact the administrator.'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first',
                requiresEmailVerification: true,
                email: user.email
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Generate token
        const token = user.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, department } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (department) user.department = department;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Initiate account deletion (send OTP to email)
 * @route   POST /api/auth/initiate-account-deletion
 * @access  Private
 */
exports.initiateAccountDeletion = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your password to initiate deletion'
            });
        }

        // Use lowercase email for consistent OTP lookup across casing
        const lowerEmail = req.user.email.toLowerCase();
        const user = await User.findById(req.user._id).select('+password email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Generate and send OTP
        const otpResult = await otpService.createOTP(lowerEmail);
        if (!otpResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate verification code. Please try again later.'
            });
        }

        const emailResult = await emailService.sendAccountDeletionOtp(lowerEmail, otpResult.otp);
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification code. Please try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email. Please verify to complete account deletion.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete current user
 * @route   DELETE /api/auth/me
 * @access  Private
 */
exports.deleteMe = async (req, res, next) => {
    try {
        const { password, otp } = req.body;

        if (!password || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both your password and verification code'
            });
        }

        const user = await User.findById(req.user._id).select('+password email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password again for safety
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        // Verify OTP
        const verifyResult = await otpService.verifyOTP(user.email.toLowerCase(), otp);
        if (!verifyResult.success) {
            return res.status(400).json({
                success: false,
                message: verifyResult.message
            });
        }

        // Use more direct deletion method to ensure it persists in all environments
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            success: true,
            message: 'Your account has been deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Request password reset (send OTP)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address'
            });
        }

        // Generate and save OTP
        const otpResult = await otpService.createOTP(email);

        if (!otpResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate OTP. Please try again.'
            });
        }

        // Send password reset email
        await emailService.sendPasswordResetEmail(email, otpResult.otp);

        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to your email',
            email: email
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify OTP for password reset
 * @route   POST /api/auth/verify-reset-otp
 * @access  Public
 */
exports.verifyResetOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Verify OTP
        const verificationResult = await otpService.verifyOTP(email, otp);

        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                message: verificationResult.message
            });
        }

        // OTP verified successfully
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.',
            verified: true
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password with verified email
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and new password'
            });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
            });
        }

        const lowerEmail = email.toLowerCase();
        // Find user
        const user = await User.findOne({ email: lowerEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update profile picture
 * @route   PUT /api/auth/profile/picture
 * @access  Private
 */
exports.updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const user = await User.findById(req.user._id);

        // Delete old picture if exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        user.profilePicture = `uploads/${req.file.filename}`;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePicture: user.profilePicture
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove profile picture
 * @route   DELETE /api/auth/profile/picture
 * @access  Private
 */
exports.removeProfilePicture = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.profilePicture) {
            return res.status(400).json({
                success: false,
                message: 'No profile picture to remove'
            });
        }

        const filePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        user.profilePicture = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Initiate email change (send OTP to new email)
 * @route   POST /api/auth/initiate-email-change
 * @access  Private
 */
exports.initiateEmailChange = async (req, res, next) => {
    try {
        const { newEmail } = req.body;

        if (!newEmail || !newEmail.endsWith('@rvce.edu.in')) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid RVCE email address'
            });
        }

        // Check if new email is already taken
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email address is already in use by another account'
            });
        }

        // Generate and send OTP to NEW email
        const otpResult = await otpService.createOTP(newEmail);
        if (otpResult.success) {
            await emailService.sendEmailChangeOtp(newEmail, otpResult.otp);
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your new email address. Please verify to complete the change.',
            newEmail
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify and complete email change
 * @route   PUT /api/auth/verify-email-change
 * @access  Private
 */
exports.verifyEmailChange = async (req, res, next) => {
    try {
        const { newEmail, otp } = req.body;

        if (!newEmail || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide the new email and verification code'
            });
        }

        // Verify OTP
        const verifyResult = await otpService.verifyOTP(newEmail, otp);
        if (!verifyResult.success) {
            return res.status(400).json({
                success: false,
                message: verifyResult.message
            });
        }

        const user = await User.findById(req.user._id);
        user.email = newEmail;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email address updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};


const OTP = require('../models/OTP');

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and store OTP for email
 */
exports.createOTP = async (email) => {
    try {
        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        const otp = generateOTP();
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const otpDocument = await OTP.create({
            email,
            otp,
            expiresAt: expiryTime
        });

        return {
            success: true,
            otp,
            expiresIn: 600 // 10 minutes in seconds
        };
    } catch (error) {
        console.error('❌ OTP creation failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Verify OTP for email
 */
exports.verifyOTP = async (email, otp) => {
    try {
        const otpDocument = await OTP.findOne({ email });

        if (!otpDocument) {
            return {
                success: false,
                message: 'OTP not found or expired. Please request a new OTP.'
            };
        }

        // Check if OTP has expired
        if (new Date() > otpDocument.expiresAt) {
            await OTP.deleteOne({ _id: otpDocument._id });
            return {
                success: false,
                message: 'OTP has expired. Please request a new OTP.'
            };
        }

        // Check if max attempts exceeded
        if (otpDocument.attempts >= otpDocument.maxAttempts) {
            await OTP.deleteOne({ _id: otpDocument._id });
            return {
                success: false,
                message: 'Maximum attempts exceeded. Please request a new OTP.'
            };
        }

        // Verify OTP
        if (otpDocument.otp !== otp) {
            otpDocument.attempts += 1;
            await otpDocument.save();
            return {
                success: false,
                message: `Invalid OTP. ${otpDocument.maxAttempts - otpDocument.attempts} attempts remaining.`
            };
        }

        // OTP is valid, delete it
        await OTP.deleteOne({ _id: otpDocument._id });

        return {
            success: true,
            message: 'OTP verified successfully'
        };
    } catch (error) {
        console.error('❌ OTP verification failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Resend OTP for email
 */
exports.resendOTP = async (email) => {
    try {
        // Delete existing OTP
        await OTP.deleteMany({ email });

        return await this.createOTP(email);
    } catch (error) {
        console.error('❌ OTP resend failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

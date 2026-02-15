import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    forgotPassword as forgotPasswordService,
    verifyResetOtp as verifyResetOtpService,
    resetPassword as resetPasswordService
} from '../services/authService';
import PasswordField from '../components/PasswordField';
import toast from '../utils/toast';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // 'email', 'verify-otp', or 'reset-password'
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpResendCountdown, setOtpResendCountdown] = useState(0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Step 1: Request password reset
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await forgotPasswordService(formData.email);

            if (data.success) {
                setStep('verify-otp');
                setOtpResendCountdown(60);
                // Countdown timer
                const interval = setInterval(() => {
                    setOtpResendCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (err) {
            toast.error(err, 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const data = await verifyResetOtpService(formData.email, formData.otp);

            if (data.success) {
                setStep('reset-password');
            }
        } catch (err) {
            toast.error(err, 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(formData.newPassword)) {
            setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }

        setLoading(true);

        try {
            const data = await resetPasswordService(formData.email, formData.newPassword);

            if (data.success) {
                // Show success and redirect to login
                toast.success('Password reset successfully! You can now login with your new password.');
                navigate('/login');
            }
        } catch (err) {
            toast.error(err, 'Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setError('');
        setLoading(true);

        try {
            const data = await forgotPasswordService(formData.email);

            if (data.success) {
                setFormData({ ...formData, otp: '' });
                setOtpResendCountdown(60);
                // Countdown timer
                const interval = setInterval(() => {
                    setOtpResendCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (err) {
            toast.error(err, 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">CF</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {step === 'email' && 'Reset Password'}
                            {step === 'verify-otp' && 'Verify OTP'}
                            {step === 'reset-password' && 'Create New Password'}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {step === 'email' && 'Enter your email to receive a reset code'}
                            {step === 'verify-otp' && 'Enter the OTP sent to your email'}
                            {step === 'reset-password' && 'Choose a strong new password'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Enter Email */}
                    {step === 'email' && (
                        <form onSubmit={handleRequestReset} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    RVCE Email Address *
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="input"
                                    placeholder="yourname@rvce.edu.in"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 'verify-otp' && (
                        <>
                            {/* Email Display */}
                            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Reset code sent to:</p>
                                <p className="text-base font-semibold text-primary-700 truncate">{formData.email}</p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                        One-Time Password (OTP) *
                                    </label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        maxLength="6"
                                        required
                                        className="input text-center text-2xl tracking-widest"
                                        placeholder="000000"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || formData.otp.length !== 6}
                                    className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </form>

                            {/* Resend OTP */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
                                {otpResendCountdown > 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Resend available in {otpResendCountdown}s
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset-password' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <PasswordField
                                id="newPassword"
                                name="newPassword"
                                label="New Password *"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />

                            <PasswordField
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm New Password *"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;


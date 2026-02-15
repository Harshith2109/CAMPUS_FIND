import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerService, verifyOtp, resendOtp } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import PasswordField from '../components/PasswordField';
import toast from '../utils/toast';

// RVCE Departments
const DEPARTMENTS = [
    { value: '', label: '-- Select Department --' },
    { value: 'Computer Science', label: 'Computer Science & Engineering' },
    { value: 'Electronics', label: 'Electronics & Communication Engineering' },
    { value: 'Mechanical', label: 'Mechanical Engineering' },
    { value: 'Electrical', label: 'Electrical & Electronics Engineering' },
    { value: 'Civil', label: 'Civil Engineering' },
    { value: 'Aerospace', label: 'Aerospace Engineering' },
    { value: 'Biomedical', label: 'Biomedical Engineering' },
    { value: 'Information Science', label: 'Information Science & Engineering' },
    { value: 'Administration', label: 'Administration' },
    { value: 'Other', label: 'Other' }
];

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState('register'); // 'register' or 'verify-otp'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: '',
        role: 'student'
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [otpResendCountdown, setOtpResendCountdown] = useState(0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword: _, ...registerData } = formData;
            const data = await registerService(registerData);

            if (data.success && data.requiresEmailVerification) {
                setRegisteredEmail(data.email);
                setStep('verify-otp');
                setOtpResendCountdown(0);
            }
        } catch (err) {
            toast.error(err, 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const data = await verifyOtp(registeredEmail, otp);

            if (data.success && data.token) {
                toast.success('Email verified successfully!');
                login(data.user, data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            toast.error(err, 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);

        try {
            const data = await resendOtp(registeredEmail);

            if (data.success) {
                setOtp('');
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

    if (step === 'verify-otp') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-2xl">CF</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Verify Email</h2>
                            <p className="text-gray-600 mt-2">Enter the OTP sent to your email</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Display */}
                        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Verification code sent to:</p>
                            <p className="text-base font-semibold text-primary-700 truncate">{registeredEmail}</p>
                        </div>

                        {/* OTP Form */}
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
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
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
                                    disabled={loading || otpResendCountdown > 0}
                                    className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        {/* Back to Register */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setStep('register');
                                    setError('');
                                    setOtp('');
                                }}
                                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                            >
                                Back to Registration
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">CF</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-gray-600 mt-2">Join CampusFind today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

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
                            <p className="text-xs text-gray-500 mt-1">Must be your RVCE email</p>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="input"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                            </label>
                            <select
                                id="department"
                                name="department"
                                className="input"
                                value={formData.department}
                                onChange={handleChange}
                            >
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                User Type *
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="input"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="student">Student</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Select your role at RVCE</p>
                        </div>

                        <PasswordField
                            id="password"
                            name="password"
                            label="Password *"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />

                        <PasswordField
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirm Password *"
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

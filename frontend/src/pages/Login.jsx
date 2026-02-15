import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService, resendOtp } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

import PasswordField from '../components/PasswordField';
import toast from '../utils/toast';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');

    // Clear error message after 10 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await loginService(formData);
            if (data.success) {
                login(data.user, data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response?.data?.requiresEmailVerification) {
                setUnverifiedEmail(err.response?.data?.email);
                toast.error('Please verify your email first before logging in.');
            } else {
                toast.error(err, 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerificationEmail = async () => {
        if (!unverifiedEmail) return;
        setLoading(true);
        try {
            await resendOtp(unverifiedEmail);
            toast.success('Verification code sent to your email. Please check your inbox.');
            navigate('/register');
        } catch (err) {
            toast.error(err, 'Failed to resend verification code.');
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
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-600 mt-2">Sign in to your CampusFind account</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                            {error}
                            {unverifiedEmail && (
                                <button
                                    onClick={handleResendVerificationEmail}
                                    disabled={loading}
                                    className="block mt-2 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Resend Verification Code
                                </button>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                RVCE Email Address
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

                        <div>
                            <PasswordField
                                id="password"
                                name="password"
                                label="Password *"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                            <div className="text-right mt-2">
                                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>


                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                                Register here
                            </Link>
                        </p>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default Login;

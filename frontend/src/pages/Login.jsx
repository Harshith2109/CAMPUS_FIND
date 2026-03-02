import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService, resendOtp } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

import PasswordField from '../components/PasswordField';
import FormField from '../components/FormField';
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
        <div className="min-h-screen flex items-center justify-center bg-bg-main py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-bg-surface rounded-2xl shadow-xl p-8 border border-border-main">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">CF</span>
                        </div>
                        <h2 className="text-3xl font-bold text-text-main">Welcome Back</h2>
                        <p className="text-text-muted mt-2">Sign in to your CampusFind account</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger rounded-lg text-sm font-medium">
                            {error}
                            {unverifiedEmail && (
                                <button
                                    onClick={handleResendVerificationEmail}
                                    disabled={loading}
                                    className="block mt-2 text-brand-primary hover:text-brand-primary-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Resend Verification Code
                                </button>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormField label="RVCE Email Address" required>
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
                        </FormField>

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
                                <Link to="/forgot-password" className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium">
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
                        <p className="text-sm text-text-muted">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-brand-primary hover:text-brand-primary-hover font-medium">
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

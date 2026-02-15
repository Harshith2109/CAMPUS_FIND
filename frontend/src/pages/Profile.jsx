import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    updateProfile,
    changePassword,
    deleteAccount,
    updateProfilePicture,
    removeProfilePicture,
    initiateEmailChange,
    verifyEmailChange,
    initiateAccountDeletion
} from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import PasswordField from '../components/PasswordField';
import { getImageUrl } from '../utils/helpers';

const Profile = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Edit Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        department: user?.department || ''
    });

    // Email Change State
    const [isEmailEditing, setIsEmailEditing] = useState(false);
    const [newEmail, setNewEmail] = useState(user?.email || '');
    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');

    // Password State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletionStep, setDeletionStep] = useState(1); // 1: Password, 2: OTP
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteOtp, setDeleteOtp] = useState('');

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await updateProfile(profileData);
            login(data.user, localStorage.getItem('token'));
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error, 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChangeInitiate = async (e) => {
        e.preventDefault();
        if (newEmail === user.email) {
            setIsEmailEditing(false);
            return;
        }
        setLoading(true);
        try {
            await initiateEmailChange(newEmail);
            setShowEmailOtpModal(true);
            toast.success('Verification code sent to your new email');
        } catch (error) {
            toast.error(error, 'Failed to initiate email change');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        setLoading(true);
        try {
            const data = await verifyEmailChange(newEmail, emailOtp);
            login(data.user, localStorage.getItem('token'));
            toast.success('Email updated successfully');
            setShowEmailOtpModal(false);
            setIsEmailEditing(false);
            setEmailOtp('');
        } catch (error) {
            toast.error(error, 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setLoading(true);
        try {
            const data = await updateProfilePicture(formData);
            const updatedUser = { ...user, profilePicture: data.profilePicture };
            login(updatedUser, localStorage.getItem('token'));
            toast.success('Profile picture updated successfully');
        } catch (error) {
            toast.error(error, 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePicture = async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return;
        setLoading(true);
        try {
            await removeProfilePicture();
            const updatedUser = { ...user, profilePicture: null };
            login(updatedUser, localStorage.getItem('token'));
            toast.success('Profile picture removed');
        } catch (error) {
            toast.error(error, 'Failed to remove picture');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (error) {
            toast.error(error, 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateDeletion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await initiateAccountDeletion(deletePassword);
            setDeletionStep(2);
            toast.success('Verification code sent to your email');
        } catch (error) {
            toast.error(error, 'Failed to initiate account deletion');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDeletion = async () => {
        setLoading(true);
        try {
            await deleteAccount(deletePassword, deleteOtp);
            toast.success('Account deleted successfully');
            logout();
            navigate('/');
        } catch (error) {
            toast.error(error, 'Invalid or expired verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Settings</h1>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                {/* Header/Banner/Avatar Area */}
                <div className="bg-indigo-600 h-32 relative">
                    <div className="absolute -bottom-12 left-8 group">
                        <div className="relative">
                            <img
                                src={getImageUrl(user?.profilePicture)}
                                alt={user?.name}
                                className="w-32 h-32 rounded-2xl border-4 border-white object-cover bg-gray-50 shadow-md"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-2 bg-white rounded-full text-indigo-600 hover:bg-gray-100 transition-colors"
                                    title="Update Picture"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                {user?.profilePicture && (
                                    <button
                                        onClick={handleRemovePicture}
                                        className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 transition-colors"
                                        title="Remove Picture"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500">{user?.role} • {user?.department}</p>
                    </div>

                    <div className="space-y-8">
                        {/* Profile Info Form */}
                        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    className="input focus:ring-indigo-500"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="input focus:ring-indigo-500"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="Add phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    className="input focus:ring-indigo-500"
                                    value={profileData.department}
                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                />
                            </div>

                            <div className="col-span-full flex justify-end">
                                <button type="submit" disabled={loading} className="btn btn-primary px-8">
                                    {loading ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>

                        <hr className="border-gray-100" />

                        {/* Email Management */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            {isEmailEditing ? (
                                <form onSubmit={handleEmailChangeInitiate} className="flex gap-2">
                                    <input
                                        type="email"
                                        className="input flex-1 focus:ring-indigo-500"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" disabled={loading} className="btn btn-primary whitespace-nowrap">
                                        Verify New Email
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsEmailEditing(false); setNewEmail(user.email); }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-900">{user?.email}</span>
                                    </div>
                                    <button
                                        onClick={() => setIsEmailEditing(true)}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                    >
                                        Change Email
                                    </button>
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">Changing your email requires verification for security.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security & Privacy Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Security & Privacy</h2>
                    <p className="text-sm text-gray-500">Manage your password and account status.</p>
                </div>

                {/* Change Password Toggle */}
                <div className="border-t border-gray-50 pt-6">
                    {!showPasswordForm ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Password</h3>
                                <p className="text-sm text-gray-500">Last changed recently</p>
                            </div>
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="btn btn-secondary py-2"
                            >
                                Update Password
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Update Password</h3>
                            <PasswordField
                                id="currentPassword"
                                name="currentPassword"
                                label="Current Password"
                                required
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                autoComplete="current-password"
                            />

                            <PasswordField
                                id="newPassword"
                                name="newPassword"
                                label="New Password"
                                required
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                autoComplete="new-password"
                            />

                            <PasswordField
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm New Password"
                                required
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                autoComplete="new-password"
                            />

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn btn-primary px-8">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Delete Account */}
                <div className="border-t border-gray-50 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-red-600">Delete Account</h3>
                            <p className="text-sm text-gray-500">Permanently remove your account and all data.</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                            Deactivate Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Email OTP Modal */}
            {showEmailOtpModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
                            <p className="text-gray-500 mt-2">
                                We've sent a 6-digit code to <span className="font-semibold text-gray-900">{newEmail}</span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                            <input
                                type="text"
                                className="input text-center text-3xl tracking-[1rem] focus:ring-indigo-500"
                                maxLength="6"
                                placeholder="000000"
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleVerifyEmail}
                                disabled={loading || emailOtp.length !== 6}
                                className="btn btn-primary w-full py-3"
                            >
                                {loading ? 'Verifying...' : 'Update Email Address'}
                            </button>
                            <button
                                onClick={() => setShowEmailOtpModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Cancel change
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {deletionStep === 1 ? 'Delete Account?' : 'Verify Deletion'}
                            </h2>
                            <p className="text-gray-500 mt-2">
                                {deletionStep === 1
                                    ? 'This action is permanent and cannot be undone. All your reports, claims, and data will be lost.'
                                    : `We've sent a security code to your email. Please enter it to confirm account deletion.`}
                            </p>
                        </div>

                        {deletionStep === 1 ? (
                            <form onSubmit={handleInitiateDeletion}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm with Password</label>
                                    <PasswordField
                                        id="deletePassword"
                                        name="deletePassword"
                                        label=""
                                        required
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !deletePassword}
                                        className="btn bg-red-600 hover:bg-red-700 text-white border-transparent w-full py-3"
                                    >
                                        {loading ? 'Processing...' : 'Request Deletion Code'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                    >
                                        I've changed my mind
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Security Code</label>
                                    <input
                                        type="text"
                                        className="input text-center text-3xl tracking-[1rem] focus:ring-red-500 border-red-100"
                                        maxLength="6"
                                        placeholder="000000"
                                        value={deleteOtp}
                                        onChange={(e) => setDeleteOtp(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleConfirmDeletion}
                                        disabled={loading || deleteOtp.length !== 6}
                                        className="btn bg-red-600 hover:bg-red-700 text-white border-transparent w-full py-3"
                                    >
                                        {loading ? 'Deleting...' : 'Permanently Delete My Account'}
                                    </button>
                                    <button
                                        onClick={() => { setDeletionStep(1); setDeleteOtp(''); }}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

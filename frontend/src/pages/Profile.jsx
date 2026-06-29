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
import { Camera, Trash2, Mail, ShieldAlert, X } from 'lucide-react';

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
            <h1 className="text-3xl font-bold text-text-main mb-8">User Settings</h1>

            {/* Profile Section */}
            <div className="bg-bg-surface rounded-2xl shadow-sm border border-border-main overflow-hidden mb-8">
                {/* Header/Banner/Avatar Area */}
                <div className="bg-brand-primary h-32 relative">
                    <div className="absolute -bottom-12 left-8 group">
                        <div className="relative">
                            <img
                                src={getImageUrl(user?.profilePicture)}
                                alt={user?.name}
                                className="w-32 h-32 rounded-2xl border-4 border-bg-surface object-cover bg-bg-main shadow-md"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-2 bg-bg-surface rounded-full text-text-brand-primary hover:bg-gray-100 transition-colors"
                                    title="Update Picture"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                {user?.profilePicture && (
                                    <button
                                        onClick={handleRemovePicture}
                                        className="p-2 bg-bg-surface rounded-full text-red-600 hover:bg-gray-100 transition-colors"
                                        title="Remove Picture"
                                    >
                                        <Trash2 className="w-5 h-5" />
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
                        <h2 className="text-2xl font-bold text-text-main">{user?.name}</h2>
                        <p className="text-text-muted">{user?.role} • {user?.department}</p>
                    </div>

                    <div className="space-y-8">
                        {/* Profile Info Form */}
                        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-text-main mb-1">Display Name</label>
                                <input
                                    type="text"
                                    className="input focus:ring-brand-primary"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="input focus:ring-brand-primary"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="Add phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">Department</label>
                                <select
                                    className="input focus:ring-brand-primary"
                                    value={profileData.department}
                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                >
                                    {DEPARTMENTS.map((dept) => (
                                        <option key={dept.value} value={dept.value}>
                                            {dept.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-full flex justify-end">
                                <button type="submit" disabled={loading} className="btn btn-primary px-8">
                                    {loading ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>

                        <hr className="border-border-main" />

                        {/* Email Management */}
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Email Address</label>
                            {isEmailEditing ? (
                                <form onSubmit={handleEmailChangeInitiate} className="flex gap-2">
                                    <input
                                        type="email"
                                        className="input flex-1 focus:ring-brand-primary"
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
                                <div className="flex items-center justify-between p-3 bg-bg-main border border-border-main">
                                    <div className="flex items-center">
                                        <Mail className="w-5 h-5 text-text-muted mr-2" />
                                        <span className="text-text-main">{user?.email}</span>
                                    </div>
                                    <button
                                        onClick={() => setIsEmailEditing(true)}
                                        className="text-brand-primary hover:text-brand-secondary text-sm font-medium"
                                    >
                                        Change Email
                                    </button>
                                </div>
                            )}
                            <p className="mt-2 text-xs text-text-muted">Changing your email requires verification for security.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security & Privacy Section */}
            <div className="bg-bg-surface border border-border-main p-8 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-text-main mb-1">Security & Privacy</h2>
                    <p className="text-sm text-text-muted">Manage your password and account status.</p>
                </div>

                {/* Change Password Toggle */}
                <div className="border-t border-border-main pt-6">
                    {!showPasswordForm ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-text-main">Password</h3>
                                <p className="text-sm text-text-muted">Last changed recently</p>
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
                            <h3 className="font-semibold text-text-main mb-4">Update Password</h3>
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
                <div className="border-t border-border-main pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-red-600">Delete Account</h3>
                            <p className="text-sm text-text-muted">Permanently remove your account and all data.</p>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface p-8 rounded-2xl shadow-xl w-full max-w-md border border-border-main relative">
                        <button
                            onClick={() => setShowEmailOtpModal(false)}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-main">Verify your email</h2>
                            <p className="text-text-muted mt-2">
                                We've sent a 6-digit code to <span className="font-semibold text-text-main">{newEmail}</span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-main mb-2">Verification Code</label>
                            <input
                                type="text"
                                className="input text-center text-3xl tracking-[1rem] focus:ring-brand-primary"
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
                                className="text-text-muted hover:text-text-main text-sm font-medium transition-colors"
                            >
                                Cancel change
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface p-8 rounded-2xl shadow-xl w-full max-w-md border border-border-main relative">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-brand-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldAlert className="w-8 h-8 text-brand-danger" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-main">
                                {deletionStep === 1 ? 'Delete Account?' : 'Verify Deletion'}
                            </h2>
                            <p className="text-text-muted mt-2">
                                {deletionStep === 1
                                    ? 'This action is permanent and cannot be undone. All your reports, claims, and data will be lost.'
                                    : `We've sent a security code to your email. Please enter it to confirm account deletion.`}
                            </p>
                        </div>

                        {deletionStep === 1 ? (
                            <form onSubmit={handleInitiateDeletion}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-text-main mb-1">Confirm with Password</label>
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
                                        className="btn bg-brand-danger hover:bg-brand-danger-hover text-white border-transparent w-full py-3"
                                    >
                                        {loading ? 'Processing...' : 'Request Deletion Code'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="text-text-muted hover:text-text-main text-sm font-medium transition-colors"
                                    >
                                        I've changed my mind
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2 text-center">Security Code</label>
                                    <input
                                        type="text"
                                        className="input text-center text-3xl tracking-[1rem] focus:ring-brand-danger border-brand-danger/20"
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
                                        className="btn bg-brand-danger hover:bg-brand-danger-hover text-white border-transparent w-full py-3"
                                    >
                                        {loading ? 'Deleting...' : 'Permanently Delete My Account'}
                                    </button>
                                    <button
                                        onClick={() => { setDeletionStep(1); setDeleteOtp(''); }}
                                        className="text-text-muted hover:text-text-main text-sm font-medium transition-colors"
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

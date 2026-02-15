import api from './api';

/**
 * Register a new user
 */
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

/**
 * Verify OTP during registration
 */
export const verifyOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    if (response.data.success && response.data.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

/**
 * Resend OTP
 */
export const resendOtp = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
};

/**
 * Change password
 */
export const changePassword = async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
};

/**
 * Initiate account deletion (send OTP)
 */
export const initiateAccountDeletion = async (password) => {
    const response = await api.post('/auth/initiate-account-deletion', { password });
    return response.data;
};

/**
 * Delete account
 */
export const deleteAccount = async (password, otp) => {
    const response = await api.delete('/auth/me', { data: { password, otp } });
    return response.data;
};

/**
 * Request password reset (send OTP)
 */
export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

/**
 * Verify OTP for password reset
 */
export const verifyResetOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-reset-otp', { email, otp });
    return response.data;
};

/**
 * Reset password
 */
export const resetPassword = async (email, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    return response.data;
};



/**
 * Update profile picture
 */
export const updateProfilePicture = async (formData) => {
    const response = await api.put('/auth/profile/picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

/**
 * Remove profile picture
 */
export const removeProfilePicture = async () => {
    const response = await api.delete('/auth/profile/picture');
    return response.data;
};

/**
 * Initiate email change
 */
export const initiateEmailChange = async (newEmail) => {
    const response = await api.post('/auth/initiate-email-change', { newEmail });
    return response.data;
};

/**
 * Verify email change
 */
export const verifyEmailChange = async (newEmail, otp) => {
    const response = await api.put('/auth/verify-email-change', { newEmail, otp });
    return response.data;
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get auth token from localStorage
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};

import api from './api';

/**
 * Register a new user
 */
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
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

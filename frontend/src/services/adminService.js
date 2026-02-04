import api from './api';

/**
 * Get dashboard statistics
 */
export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

/**
 * Get all users
 */
export const getAllUsers = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
    });

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
};

/**
 * Update user role
 */
export const updateUserRole = async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
};

/**
 * Get all items (admin view)
 */
export const getAllItems = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
    });

    const response = await api.get(`/admin/items?${params.toString()}`);
    return response.data;
};

/**
 * Update item status
 */
export const updateItemStatus = async (itemId, status) => {
    const response = await api.patch(`/admin/items/${itemId}/status`, { status });
    return response.data;
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
};

/**
 * Toggle user ban status
 */
export const toggleUserBan = async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/ban`);
    return response.data;
};

/**
 * Get system settings
 */
export const getSettings = async () => {
    const response = await api.get('/admin/settings');
    return response.data;
};

/**
 * Update system settings
 */
export const updateSettings = async (settingsData) => {
    const response = await api.put('/admin/settings', settingsData);
    return response.data;
};

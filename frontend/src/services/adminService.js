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
 * Get recent activity
 */
export const getRecentActivity = async (limit = 50) => {
    const response = await api.get(`/admin/activity?limit=${limit}`);
    return response.data;
};

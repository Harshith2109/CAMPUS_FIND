import api from './api';

/**
 * Get user notifications
 */
export const getNotifications = async (limit = 50) => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

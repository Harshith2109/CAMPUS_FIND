const notificationService = require('../services/notificationService');

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const { limit = 50 } = req.query;

        const notifications = await notificationService.getUserNotifications(
            req.user._id,
            parseInt(limit)
        );

        const unreadCount = await notificationService.getUnreadCount(req.user._id);

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(
            req.params.id,
            req.user._id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user._id);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        next(error);
    }
};

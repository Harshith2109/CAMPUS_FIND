const Notification = require('../models/Notification');
const emailService = require('./emailService');

/**
 * Create a notification
 */
exports.createNotification = async (notificationData) => {
    try {
        const notification = await Notification.create(notificationData);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Notify user about item match
 */
exports.notifyMatch = async (user, item, matchedItem) => {
    try {
        // Create in-app notification
        await this.createNotification({
            user: user._id,
            type: 'match',
            title: 'Potential Match Found!',
            message: `We found a potential match for your ${item.type} item: ${item.title}`,
            relatedItem: matchedItem._id
        });

        // Send email notification
        await emailService.sendMatchNotification(user, item, matchedItem);
    } catch (error) {
        console.error('Error sending match notification:', error);
    }
};

/**
 * Notify user about new claim
 */
exports.notifyClaim = async (user, claim, item) => {
    try {
        // Create in-app notification
        await this.createNotification({
            user: user._id,
            type: 'claim',
            title: 'New Claim Request',
            message: `Someone has submitted a claim for your item: ${item.title}`,
            relatedItem: item._id,
            relatedClaim: claim._id
        });

        // Send email notification
        await emailService.sendClaimNotification(user, claim, item);
    } catch (error) {
        console.error('Error sending claim notification:', error);
    }
};

/**
 * Notify user about claim status update
 */
exports.notifyClaimStatus = async (user, claim, item, status) => {
    try {
        const statusText = status === 'approved' ? 'approved' : 'rejected';

        // Create in-app notification
        await this.createNotification({
            user: user._id,
            type: 'status',
            title: `Claim ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
            message: `Your claim for "${item.title}" has been ${statusText}`,
            relatedItem: item._id,
            relatedClaim: claim._id
        });

        // Send email notification
        await emailService.sendClaimStatusUpdate(user, claim, item, status);
    } catch (error) {
        console.error('Error sending claim status notification:', error);
    }
};

/**
 * Get user notifications
 */
exports.getUserNotifications = async (userId, limit = 50) => {
    try {
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('relatedItem', 'title type category')
            .populate('relatedClaim', 'status');

        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { read: true },
            { new: true }
        );

        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { user: userId, read: false },
            { read: true }
        );

        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (userId) => {
    try {
        const count = await Notification.countDocuments({
            user: userId,
            read: false
        });

        return count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};

import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from '../utils/toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data.notifications || []);
        } catch (error) {
            toast.error(error, 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            toast.error(error, 'Failed to mark notification as read');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'match':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'claim':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'match':
                return 'bg-success-100 text-success-600';
            case 'claim':
                return 'bg-warning-100 text-warning-600';
            default:
                return 'bg-primary-100 text-primary-600';
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">
                    {notifications.filter(n => !n.read).length} unread notifications
                </p>
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
                <div className="space-y-2">
                    {notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`card cursor-pointer transition-all ${!notification.read ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                                }`}
                            onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-gray-900">
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    {!notification.read && (
                                        <span className="inline-block mt-2 text-xs text-primary-600 font-medium">
                                            Click to mark as read
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-600">No notifications yet</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;

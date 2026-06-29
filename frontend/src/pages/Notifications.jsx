import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, deleteNotification } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from '../utils/toast';
import { CircleCheck, TriangleAlert, Info, BellOff, X } from 'lucide-react';

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

    const handleDeleteNotification = async (id) => {
        try {
            // Optimistic update
            setNotifications(notifications.filter(n => n._id !== id));
            await deleteNotification(id);
        } catch (error) {
            toast.error(error, 'Failed to delete notification');
            fetchNotifications(); // Revert on error
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'match':
                return <CircleCheck className="w-6 h-6" />;
            case 'claim':
                return <TriangleAlert className="w-6 h-6" />;
            case 'status':
                return <CircleCheck className="w-6 h-6" />;
            default:
                return <Info className="w-6 h-6" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'match':
                return 'bg-brand-success/20 text-brand-success';
            case 'claim':
                return 'bg-brand-warning/20 text-brand-warning';
            case 'status':
                return 'bg-brand-success/20 text-brand-success';
            default:
                return 'bg-brand-primary/20 text-brand-primary';
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-main">Notifications</h1>
                <p className="text-text-muted mt-2">
                    {notifications.filter(n => !n.read).length} unread notifications
                </p>
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
                <div className="space-y-2">
                    {notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`card cursor-pointer transition-all hover-scale group relative ${!notification.read ? 'bg-brand-primary/10 border-l-4 border-brand-primary' : ''
                                }`}
                            onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                        >
                            {/* Dismiss Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notification._id);
                                }}
                                className="absolute top-2 right-2 p-1 rounded-full text-text-muted hover:text-text-main hover:bg-bg-main opacity-0 group-hover:opacity-100 transition-all z-10"
                                title="Delete"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-text-main">
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-text-muted whitespace-nowrap ml-4">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-text-muted mt-1">{notification.message}</p>
                                    {!notification.read && (
                                        <span className="inline-block mt-2 text-xs text-brand-primary font-medium">
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
                    <BellOff className="w-16 h-16 text-text-muted opacity-50 mx-auto mb-4" />
                    <p className="text-text-muted">No notifications yet</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;

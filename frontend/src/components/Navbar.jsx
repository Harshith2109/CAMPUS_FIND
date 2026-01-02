import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/notificationService';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">CF</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">CampusFind</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </Link>
                                <Link to="/items" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Browse Items
                                </Link>
                                <Link to="/report-item" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Report Item
                                </Link>
                                <Link to="/my-items" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    My Items
                                </Link>
                                <Link to="/my-claims" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    My Claims
                                </Link>
                                {(user.role === 'staff' || user.role === 'admin') && (
                                    <Link to="/verify-claims" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Verify Claims
                                    </Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Admin
                                    </Link>
                                )}

                                {/* Notifications */}
                                <Link to="/notifications" className="relative p-2 text-gray-700 hover:text-primary-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-danger-500 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="btn btn-secondary text-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/items" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Browse Items
                                </Link>
                                <Link to="/login" className="btn btn-secondary text-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary text-sm">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 hover:text-primary-600 p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        {user ? (
                            <div className="space-y-2">
                                <Link to="/dashboard" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </Link>
                                <Link to="/items" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    Browse Items
                                </Link>
                                <Link to="/report-item" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    Report Item
                                </Link>
                                <Link to="/my-items" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    My Items
                                </Link>
                                <Link to="/my-claims" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    My Claims
                                </Link>
                                <Link to="/notifications" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="block w-full text-left text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link to="/items" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    Browse Items
                                </Link>
                                <Link to="/login" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

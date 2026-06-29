import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../services/notificationService';
import { Bell, Menu, X, User, LogOut, ScanSearch, CirclePlus, PackageOpen, ShieldCheck, LayoutDashboard, ClipboardList, MapPin, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const startPolling = async () => {
            await fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        };

        startPolling();
    }, [user, fetchUnreadCount]);

    const isActive = (path) => pathname === path;

    return (
        <nav className="bg-bg-surface shadow-md sticky top-0 z-50 border-b border-border-main">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-105">
                                <MapPin className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold text-text-main tracking-tight leading-none">
                                    Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-primary-500">Find</span>
                                </span>
                                <span className="text-[0.65rem] font-medium text-text-muted tracking-wider uppercase leading-none mt-0.5">
                                    Lost & Found
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {user ? (
                            <>
                                <Link to="/dashboard" className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive('/dashboard') ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-text-muted hover:text-brand-primary hover:bg-bg-main'}`}>
                                    <LayoutDashboard className={`w-4 h-4 ${isActive('/dashboard') ? 'text-brand-primary' : ''}`} />
                                    Dashboard
                                </Link>
                                <Link to="/items" className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive('/items') ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-text-muted hover:text-brand-primary hover:bg-bg-main'}`}>
                                    <ScanSearch className={`w-4 h-4 ${isActive('/items') ? 'text-brand-primary' : ''}`} />
                                    Browse Items
                                </Link>
                                <Link to="/report-item" className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive('/report-item') ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-text-muted hover:text-brand-primary hover:bg-bg-main'}`}>
                                    <CirclePlus className={`w-4 h-4 ${isActive('/report-item') ? 'text-brand-primary' : ''}`} />
                                    Report Item
                                </Link>
                                <Link to="/my-items" className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive('/my-items') ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-text-muted hover:text-brand-primary hover:bg-bg-main'}`}>
                                    <PackageOpen className={`w-4 h-4 ${isActive('/my-items') ? 'text-brand-primary' : ''}`} />
                                    My Items
                                </Link>
                                <Link to="/my-claims" className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive('/my-claims') ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-text-muted hover:text-brand-primary hover:bg-bg-main'}`}>
                                    <ClipboardList className={`w-4 h-4 ${isActive('/my-claims') ? 'text-brand-primary' : ''}`} />
                                    My Claims
                                </Link>
                                {(user.role === 'staff' || user.role === 'admin') && (
                                    <Link to="/verify-claims" className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive('/verify-claims') ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-text-muted hover:text-brand-primary hover:bg-bg-main'}`}>
                                        <ShieldCheck className={`w-4 h-4 ${isActive('/verify-claims') ? 'text-brand-primary' : ''}`} />
                                        Verify Claims
                                    </Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive('/admin') ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-text-muted hover:text-brand-primary hover:bg-bg-main'}`}>
                                        <Shield className={`w-4 h-4 ${isActive('/admin') ? 'text-brand-primary' : ''}`} />
                                        Admin
                                    </Link>
                                )}

                                {/* Notifications */}
                                <Link to="/notifications" className="relative p-2 text-text-main hover:text-brand-primary hover-rotate">
                                    <Bell className="w-6 h-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-danger rounded-full shadow-sm ring-1 ring-bg-surface">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div className="flex items-center space-x-4">
                                    <Link to="/profile" className="text-right hover:text-brand-primary transition-colors group">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-text-main group-hover:text-brand-primary">{user.name}</p>
                                            <p className="text-xs text-text-muted capitalize">{user.role}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="btn btn-secondary text-sm gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                    <ThemeToggle />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/items" className="text-text-main hover:text-brand-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <ScanSearch className="w-4 h-4" />
                                    Browse Items
                                </Link>
                                <ThemeToggle />
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
                            className="text-text-main hover:text-brand-primary p-2"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        {user ? (
                            <div className="space-y-2">
                                <Link to="/profile" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium">
                                    My Profile
                                </Link>
                                <Link to="/dashboard" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link to="/items" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <ScanSearch className="w-4 h-4" />
                                    Browse Items
                                </Link>
                                <Link to="/report-item" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <CirclePlus className="w-4 h-4" />
                                    Report Item
                                </Link>
                                <Link to="/my-items" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <PackageOpen className="w-4 h-4" />
                                    My Items
                                </Link>
                                <Link to="/my-claims" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" />
                                    My Claims
                                </Link>
                                <Link to="/notifications" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                                </Link>
                                {(user.role === 'staff' || user.role === 'admin') && (
                                    <Link to="/verify-claims" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Verify Claims
                                    </Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Admin
                                    </Link>
                                )}
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-sm font-medium text-text-muted">Theme</span>
                                    <ThemeToggle />
                                </div>
                                <button
                                    onClick={logout}
                                    className="block w-full text-left text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link to="/items" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <ScanSearch className="w-4 h-4" />
                                    Browse Items
                                </Link>
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-sm font-medium text-text-muted">Theme</span>
                                    <ThemeToggle />
                                </div>
                                <Link to="/login" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="block text-text-main hover:bg-bg-surface px-3 py-2 rounded-md text-sm font-medium">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav >
    );
};

export default Navbar;

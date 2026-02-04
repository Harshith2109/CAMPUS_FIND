import { useState, useEffect } from 'react';
import { AuthContext } from './authContextValue';
import { getCurrentUser, isAuthenticated, logout as authLogout } from '../services/authService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated on mount
        const initAuth = () => {
            if (isAuthenticated()) {
                const currentUser = getCurrentUser();
                setUser(currentUser);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        authLogout();
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

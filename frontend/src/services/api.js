import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if it's NOT a login attempt and we're not already on the login page
            const isLoginRequest = error.config.url.includes('/auth/login');
            const isLoginPage = window.location.pathname === '/login';

            if (!isLoginRequest && !isLoginPage) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        // Handle maintenance mode
        if (error.response?.status === 503 && error.response.data.isMaintenance) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isMaintenancePage = window.location.pathname === '/maintenance';
            const isLoginPage = window.location.pathname === '/login';

            // Redirect non-admins to maintenance page
            if (user.role !== 'admin' && !isMaintenancePage && !isLoginPage) {
                window.location.href = '/maintenance';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

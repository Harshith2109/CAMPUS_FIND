const SystemSettings = require('../models/SystemSettings');

/**
 * Middleware to check for maintenance mode
 * Allows admins to bypass maintenance
 * Allows auth routes (login) to bypass maintenance
 */
const maintenanceMode = async (req, res, next) => {
    try {
        const settings = await SystemSettings.getSettings();

        if (settings.maintenanceMode) {
            // Bypass for admins
            if (req.user && req.user.role === 'admin') {
                return next();
            }

            // Bypass for auth/login routes so admins can log in
            const authBypassRoutes = [
                '/api/auth/login',
                '/api/auth/verify-otp', // if needed for login
                '/api/admin/settings'  // allow admin to turn it off
            ];

            if (authBypassRoutes.some(route => req.originalUrl.startsWith(route))) {
                return next();
            }

            // Also check for health and public static files
            if (req.originalUrl.startsWith('/api/health') || req.originalUrl.startsWith('/uploads')) {
                return next();
            }

            return res.status(503).json({
                success: false,
                message: 'CampusFind is currently undergoing maintenance. Please try again later. (Admins can still log in)',
                isMaintenance: true
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance middleware error:', error);
        next();
    }
};

module.exports = maintenanceMode;

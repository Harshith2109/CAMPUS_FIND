import { toast as hotToast } from 'react-hot-toast';

/**
 * Standard utility for displaying toast notifications
 */
const toast = {
    /**
     * Show a standardized success message
     * @param {string} message 
     */
    success: (message) => {
        hotToast.success(message, {
            duration: 4000,
            style: {
                borderRadius: '10px',
                background: '#10b981',
                color: '#fff',
            },
        });
    },

    /**
     * Show a standardized error message
     * @param {any} error - Error object or string
     * @param {string} defaultMessage - Optional fallback message
     */
    error: (error, defaultMessage = 'An unexpected error occurred') => {
        let message = '';

        if (typeof error === 'string') {
            message = error;
        } else if (error?.response?.data?.message) {
            message = error.response.data.message;
        } else if (error?.message) {
            message = error.message;
        } else {
            message = defaultMessage;
        }

        hotToast.error(message, {
            duration: 5000,
            style: {
                borderRadius: '10px',
                background: '#ef4444',
                color: '#fff',
            },
        });
    },

    /**
     * Show a generic info message
     * @param {string} message 
     */
    info: (message) => {
        hotToast(message, {
            duration: 4000,
            style: {
                borderRadius: '10px',
                background: '#3b82f6',
                color: '#fff',
            },
        });
    }
};

export default toast;

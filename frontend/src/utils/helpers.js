/**
 * Format date to readable string
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format date to input value (YYYY-MM-DD)
 */
export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (date) => {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(date);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
    const colors = {
        active: 'badge-primary',
        claimed: 'badge-warning',
        returned: 'badge-success',
        archived: 'badge-secondary',
        pending: 'badge-warning',
        approved: 'badge-success',
        rejected: 'badge-danger'
    };
    return colors[status] || 'badge-secondary';
};

/**
 * Get match quality color
 */
export const getMatchQualityColor = (quality) => {
    const colors = {
        High: 'text-success-600 bg-success-100',
        Medium: 'text-warning-600 bg-warning-100',
        Low: 'text-gray-600 bg-gray-100'
    };
    return colors[quality] || 'text-gray-600 bg-gray-100';
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Get image URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    // Normalize path separators
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // Remove 'uploads/' prefix if it exists in the path to avoid duplication
    const cleanPath = normalizedPath.startsWith('uploads/') ? normalizedPath.replace('uploads/', '') : normalizedPath;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_URL.replace('/api', '');

    return `${baseUrl}/uploads/${cleanPath}`;
};

/**
 * Category list
 */
export const CATEGORIES = [
    'Electronics',
    'Wallet/Purse',
    'Keys',
    'ID Card',
    'Books/Notes',
    'Clothing',
    'Bags/Backpacks',
    'Jewelry',
    'Sports Equipment',
    'Stationery',
    'Water Bottle',
    'Umbrella',
    'Glasses',
    'Watch',
    'Other'
];

/**
 * Location list (common campus locations)
 */
export const LOCATIONS = [
    'Central Library',
    'Cafeteria',
    'Main Gate',
    'CS Department',
    'Electronics Department',
    'Mechanical Department',
    'Sports Complex',
    'Computer Lab',
    'Auditorium',
    'Parking Area',
    'Hostel',
    'Admin Block',
    'Other'
];

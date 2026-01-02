import api from './api';

/**
 * Get all items with filters
 */
export const getItems = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
    });

    const response = await api.get(`/items?${params.toString()}`);
    return response.data;
};

/**
 * Get single item by ID
 */
export const getItemById = async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
};

/**
 * Create new item (lost or found)
 */
export const createItem = async (itemData) => {
    const formData = new FormData();

    // Append text fields
    Object.keys(itemData).forEach(key => {
        if (key !== 'images' && itemData[key]) {
            formData.append(key, itemData[key]);
        }
    });

    // Append images
    if (itemData.images && itemData.images.length > 0) {
        itemData.images.forEach(image => {
            formData.append('images', image);
        });
    }

    const response = await api.post('/items', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Update item
 */
export const updateItem = async (id, itemData) => {
    const formData = new FormData();

    Object.keys(itemData).forEach(key => {
        if (key !== 'images' && itemData[key]) {
            formData.append(key, itemData[key]);
        }
    });

    if (itemData.images && itemData.images.length > 0) {
        itemData.images.forEach(image => {
            formData.append('images', image);
        });
    }

    const response = await api.put(`/items/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Delete item
 */
export const deleteItem = async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
};

/**
 * Get user's items
 */
export const getMyItems = async () => {
    const response = await api.get('/items/user/my-items');
    return response.data;
};

/**
 * Get matched items for a specific item
 */
export const getMatches = async (id) => {
    const response = await api.get(`/items/${id}/matches`);
    return response.data;
};

/**
 * Get item statistics
 */
export const getItemStats = async () => {
    const response = await api.get('/items/stats');
    return response.data;
};

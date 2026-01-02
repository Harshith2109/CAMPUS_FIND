import api from './api';

/**
 * Create a new claim
 */
export const createClaim = async (claimData) => {
    const formData = new FormData();
    formData.append('itemId', claimData.itemId);
    formData.append('proofDescription', claimData.proofDescription);

    if (claimData.proofImages && claimData.proofImages.length > 0) {
        claimData.proofImages.forEach(image => {
            formData.append('proofImages', image);
        });
    }

    const response = await api.post('/claims', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get all claims (filtered by role)
 */
export const getClaims = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
    });

    const response = await api.get(`/claims?${params.toString()}`);
    return response.data;
};

/**
 * Get single claim by ID
 */
export const getClaimById = async (id) => {
    const response = await api.get(`/claims/${id}`);
    return response.data;
};

/**
 * Update claim status (approve/reject)
 */
export const updateClaimStatus = async (id, statusData) => {
    const response = await api.patch(`/claims/${id}`, statusData);
    return response.data;
};

/**
 * Get user's claims
 */
export const getMyClaims = async () => {
    const response = await api.get('/claims/user/my-claims');
    return response.data;
};

/**
 * Delete claim
 */
export const deleteClaim = async (id) => {
    const response = await api.delete(`/claims/${id}`);
    return response.data;
};

/**
 * Get claim statistics
 */
export const getClaimStats = async () => {
    const response = await api.get('/claims/admin/stats');
    return response.data;
};

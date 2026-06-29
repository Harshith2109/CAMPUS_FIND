const SystemSettings = require('../models/SystemSettings');

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 * @access  Private (Admin)
 */
exports.getSettings = async (req, res, next) => {
    try {
        const settings = await SystemSettings.getSettings();

        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/admin/settings
 * @access  Private (Admin)
 */
exports.updateSettings = async (req, res, next) => {
    try {
        const { categories, allowRegistration, maintenanceMode, maxImagesPerItem, maxImageSize } = req.body;

        const settings = await SystemSettings.getSettings();

        if (categories) settings.categories = categories;
        if (typeof allowRegistration !== 'undefined') settings.allowRegistration = allowRegistration;
        if (typeof maintenanceMode !== 'undefined') settings.maintenanceMode = maintenanceMode;

        if (typeof maxImagesPerItem !== 'undefined' && !isNaN(maxImagesPerItem)) {
            settings.maxImagesPerItem = Number(maxImagesPerItem);
        }
        if (typeof maxImageSize !== 'undefined' && !isNaN(maxImageSize)) {
            settings.maxImageSize = Number(maxImageSize);
        }

        await settings.save();


        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        next(error);
    }
};

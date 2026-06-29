const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SystemSettings = require('../models/SystemSettings');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
    },
    fileFilter: fileFilter
});

// Middleware to validate limits dynamically from database
const validateLimits = (fieldName = 'images') => async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const settings = await SystemSettings.getSettings();
        const { maxImagesPerItem, maxImageSize } = settings;

        // Cleanup function for failed validation
        const cleanup = () => {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        };

        // Check image count
        // Note: For updates, we might need a different check if we're adding to existing ones,
        // but for now we enforce the upload limit per request.
        if (req.files.length > maxImagesPerItem) {
            cleanup();
            return res.status(400).json({
                success: false,
                message: `You can only upload a maximum of ${maxImagesPerItem} images.`
            });
        }

        // Check each file size
        const limitInBytes = maxImageSize * 1024 * 1024;
        const oversizedFile = req.files.find(file => file.size > limitInBytes);

        if (oversizedFile) {
            cleanup();
            return res.status(400).json({
                success: false,
                message: `Each image must be smaller than ${maxImageSize}MB.`
            });
        }

        next();
    } catch (error) {
        console.error('Error in validateLimits middleware:', error);
        next(); // Proceed if settings fail to load, falling back to multer defaults
    }
};

module.exports = { upload, validateLimits };

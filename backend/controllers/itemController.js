const Item = require('../models/Item');
const matchingService = require('../services/matchingService');
const path = require('path');

/**
 * @desc    Create a new item (lost or found)
 * @route   POST /api/items
 * @access  Private
 */
exports.createItem = async (req, res, next) => {
    try {
        const {
            type,
            title,
            description,
            category,
            location,
            date,
            color,
            brand,
            identifyingFeatures
        } = req.body;

        // Handle uploaded images
        const images = req.files ? req.files.map(file => file.filename) : [];

        // Create item
        const item = await Item.create({
            type,
            title,
            description,
            category,
            location,
            date,
            color,
            brand,
            identifyingFeatures,
            images,
            reportedBy: req.user._id
        });

        // Run matching algorithm
        await matchingService.updateMatches(item);

        // Populate reporter info
        await item.populate('reportedBy', 'name email phone department');

        res.status(201).json({
            success: true,
            message: 'Item reported successfully',
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all items with filters
 * @route   GET /api/items
 * @access  Public
 */
exports.getItems = async (req, res, next) => {
    try {
        const {
            type,
            category,
            status,
            search,
            location,
            dateFrom,
            dateTo,
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        const query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (status) query.status = status;
        if (location) query.location = new RegExp(location, 'i');

        // Date range filter
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(dateFrom);
            if (dateTo) query.date.$lte = new Date(dateTo);
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const items = await Item.find(query)
            .populate('reportedBy', 'name email department')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Item.countDocuments(query);

        res.status(200).json({
            success: true,
            count: items.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            items
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
exports.getItemById = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('reportedBy', 'name email phone department')
            .populate('matchedItems', 'title type category location date images')
            .populate({
                path: 'claimRequests',
                populate: { path: 'claimedBy', select: 'name email' }
            });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.status(200).json({
            success: true,
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private (Owner or Admin)
 */
exports.updateItem = async (req, res, next) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check ownership or admin role
        if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this item'
            });
        }

        // Update fields
        const allowedUpdates = [
            'title',
            'description',
            'category',
            'location',
            'date',
            'color',
            'brand',
            'identifyingFeatures',
            'status'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.filename);
            item.images = [...item.images, ...newImages];
        }

        await item.save();

        // Re-run matching if category or key details changed
        if (req.body.category || req.body.description) {
            await matchingService.updateMatches(item);
        }

        await item.populate('reportedBy', 'name email phone department');

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete item
 * @route   DELETE /api/items/:id
 * @access  Private (Owner or Admin)
 */
exports.deleteItem = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check ownership or admin role
        if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this item'
            });
        }

        await item.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get items reported by current user
 * @route   GET /api/items/my-items
 * @access  Private
 */
exports.getMyItems = async (req, res, next) => {
    try {
        const items = await Item.find({ reportedBy: req.user._id })
            .populate('matchedItems', 'title type category location date')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get matched items for a specific item
 * @route   GET /api/items/:id/matches
 * @access  Public
 */
exports.getMatches = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Get matches with scores
        const matches = await matchingService.findMatches(item);

        // Format response with match quality
        const formattedMatches = matches.map(match => ({
            item: match.item,
            score: match.score,
            quality: matchingService.getMatchQuality(match.score)
        }));

        res.status(200).json({
            success: true,
            count: formattedMatches.length,
            matches: formattedMatches
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get item statistics
 * @route   GET /api/items/stats
 * @access  Public
 */
exports.getStats = async (req, res, next) => {
    try {
        const totalItems = await Item.countDocuments();
        const lostItems = await Item.countDocuments({ type: 'lost', status: 'active' });
        const foundItems = await Item.countDocuments({ type: 'found', status: 'active' });
        const claimedItems = await Item.countDocuments({ status: 'claimed' });
        const returnedItems = await Item.countDocuments({ status: 'returned' });

        // Items with matches
        const itemsWithMatches = await Item.countDocuments({
            matchedItems: { $exists: true, $ne: [] }
        });

        res.status(200).json({
            success: true,
            stats: {
                total: totalItems,
                lost: lostItems,
                found: foundItems,
                claimed: claimedItems,
                returned: returnedItems,
                matched: itemsWithMatches,
                matchRate: totalItems > 0 ? ((itemsWithMatches / totalItems) * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

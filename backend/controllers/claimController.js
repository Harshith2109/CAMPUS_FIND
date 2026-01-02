const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

/**
 * @desc    Create a new claim
 * @route   POST /api/claims
 * @access  Private
 */
exports.createClaim = async (req, res, next) => {
    try {
        const { itemId, proofDescription } = req.body;

        // Check if item exists
        const item = await Item.findById(itemId).populate('reportedBy');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check if item is active
        if (item.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This item is no longer available for claims'
            });
        }

        // Check if user already has a pending claim for this item
        const existingClaim = await Claim.findOne({
            item: itemId,
            claimedBy: req.user._id,
            status: 'pending'
        });

        if (existingClaim) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending claim for this item'
            });
        }

        // Handle proof images
        const proofImages = req.files ? req.files.map(file => file.filename) : [];

        // Create claim
        const claim = await Claim.create({
            item: itemId,
            claimedBy: req.user._id,
            proofDescription,
            proofImages
        });

        // Add claim to item's claimRequests
        item.claimRequests.push(claim._id);
        await item.save();

        // Notify item reporter and staff
        await notificationService.notifyClaim(item.reportedBy, claim, item);

        // Notify staff/admin users
        const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } });
        for (const staff of staffUsers) {
            await notificationService.createNotification({
                user: staff._id,
                type: 'claim',
                title: 'New Claim Pending Verification',
                message: `A claim has been submitted for ${item.title}`,
                relatedItem: item._id,
                relatedClaim: claim._id
            });
        }

        await claim.populate('claimedBy', 'name email phone department');
        await claim.populate('item', 'title type category location');

        res.status(201).json({
            success: true,
            message: 'Claim submitted successfully',
            claim
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all claims (filtered by role)
 * @route   GET /api/claims
 * @access  Private
 */
exports.getClaims = async (req, res, next) => {
    try {
        const { status, itemId, page = 1, limit = 20 } = req.query;

        // Build query based on user role
        let query = {};

        if (req.user.role === 'user') {
            // Regular users see only their claims
            query.claimedBy = req.user._id;
        }
        // Staff and admin see all claims

        if (status) query.status = status;
        if (itemId) query.item = itemId;

        // Pagination
        const skip = (page - 1) * limit;

        const claims = await Claim.find(query)
            .populate('claimedBy', 'name email phone department')
            .populate('item', 'title type category location images reportedBy')
            .populate('verifiedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Claim.countDocuments(query);

        res.status(200).json({
            success: true,
            count: claims.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            claims
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single claim by ID
 * @route   GET /api/claims/:id
 * @access  Private
 */
exports.getClaimById = async (req, res, next) => {
    try {
        const claim = await Claim.findById(req.params.id)
            .populate('claimedBy', 'name email phone department')
            .populate('item', 'title type category location images reportedBy')
            .populate('verifiedBy', 'name email');

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        // Check authorization
        if (
            req.user.role === 'user' &&
            claim.claimedBy._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this claim'
            });
        }

        res.status(200).json({
            success: true,
            claim
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update claim status (approve/reject)
 * @route   PATCH /api/claims/:id
 * @access  Private (Staff/Admin)
 */
exports.updateClaimStatus = async (req, res, next) => {
    try {
        const { status, verificationNotes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "approved" or "rejected"'
            });
        }

        const claim = await Claim.findById(req.params.id)
            .populate('claimedBy', 'name email')
            .populate('item');

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        if (claim.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Claim has already been processed'
            });
        }

        // Update claim
        claim.status = status;
        claim.verifiedBy = req.user._id;
        claim.verificationNotes = verificationNotes;
        await claim.save();

        // Update item status if approved
        if (status === 'approved') {
            const item = await Item.findById(claim.item._id);
            item.status = 'claimed';
            await item.save();
        }

        // Notify claimer
        await notificationService.notifyClaimStatus(
            claim.claimedBy,
            claim,
            claim.item,
            status
        );

        // Notify item reporter
        const itemReporter = await User.findById(claim.item.reportedBy);
        if (itemReporter) {
            await notificationService.createNotification({
                user: itemReporter._id,
                type: 'status',
                title: `Claim ${status}`,
                message: `A claim for your item "${claim.item.title}" has been ${status}`,
                relatedItem: claim.item._id,
                relatedClaim: claim._id
            });
        }

        await claim.populate('verifiedBy', 'name email');

        res.status(200).json({
            success: true,
            message: `Claim ${status} successfully`,
            claim
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get claims submitted by current user
 * @route   GET /api/claims/my-claims
 * @access  Private
 */
exports.getMyClaims = async (req, res, next) => {
    try {
        const claims = await Claim.find({ claimedBy: req.user._id })
            .populate('item', 'title type category location images')
            .populate('verifiedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: claims.length,
            claims
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete claim (before verification)
 * @route   DELETE /api/claims/:id
 * @access  Private (Owner only)
 */
exports.deleteClaim = async (req, res, next) => {
    try {
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        // Only claimer can delete their own pending claim
        if (claim.claimedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this claim'
            });
        }

        if (claim.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a processed claim'
            });
        }

        // Remove claim from item's claimRequests
        await Item.findByIdAndUpdate(claim.item, {
            $pull: { claimRequests: claim._id }
        });

        await claim.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Claim deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get claim statistics
 * @route   GET /api/claims/stats
 * @access  Private (Staff/Admin)
 */
exports.getClaimStats = async (req, res, next) => {
    try {
        const totalClaims = await Claim.countDocuments();
        const pendingClaims = await Claim.countDocuments({ status: 'pending' });
        const approvedClaims = await Claim.countDocuments({ status: 'approved' });
        const rejectedClaims = await Claim.countDocuments({ status: 'rejected' });

        res.status(200).json({
            success: true,
            stats: {
                total: totalClaims,
                pending: pendingClaims,
                approved: approvedClaims,
                rejected: rejectedClaims,
                approvalRate: totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

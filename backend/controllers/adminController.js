const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
exports.getStats = async (req, res, next) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Item statistics
        const totalItems = await Item.countDocuments();
        const activeItems = await Item.countDocuments({ status: 'active' });
        const claimedItems = await Item.countDocuments({ status: 'claimed' });
        const itemsByType = await Item.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        const itemsByCategory = await Item.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Claim statistics
        const totalClaims = await Claim.countDocuments();
        const pendingClaims = await Claim.countDocuments({ status: 'pending' });
        const approvedClaims = await Claim.countDocuments({ status: 'approved' });
        const rejectedClaims = await Claim.countDocuments({ status: 'rejected' });

        // Match statistics
        const itemsWithMatches = await Item.countDocuments({
            matchedItems: { $exists: true, $ne: [] }
        });

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentItems = await Item.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        const recentClaims = await Claim.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    byRole: usersByRole
                },
                items: {
                    total: totalItems,
                    active: activeItems,
                    claimed: claimedItems,
                    byType: itemsByType,
                    byCategory: itemsByCategory,
                    matchRate: totalItems > 0 ? ((itemsWithMatches / totalItems) * 100).toFixed(2) : 0
                },
                claims: {
                    total: totalClaims,
                    pending: pendingClaims,
                    approved: approvedClaims,
                    rejected: rejectedClaims,
                    approvalRate: totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(2) : 0
                },
                recentActivity: {
                    items: recentItems,
                    claims: recentClaims
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        // Build query
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { department: new RegExp(search, 'i') }
            ];
        }

        // Pagination
        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            users
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin)
 */
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from changing their own role
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new user (admin)
 * @route   POST /api/admin/users
 * @access  Private (Admin)
 */
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, department, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user (auto-verified since admin created it)
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            department,
            phone,
            isEmailVerified: true,
            verified: true
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle user ban status
 * @route   PATCH /api/admin/users/:id/ban
 * @access  Private (Admin)
 */
exports.toggleUserBan = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from banning themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot ban your own account'
            });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
            isBanned: user.isBanned
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all items (admin view)
 * @route   GET /api/admin/items
 * @access  Private (Admin)
 */
exports.getAllItems = async (req, res, next) => {
    try {
        const { status, type, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;

        const skip = (page - 1) * limit;

        const items = await Item.find(query)
            .populate('reportedBy', 'name email department')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

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
 * @desc    Update item status (moderate)
 * @route   PATCH /api/admin/items/:id/status
 * @access  Private (Admin)
 */
exports.updateItemStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['active', 'claimed', 'returned', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        item.status = status;
        await item.save();

        res.status(200).json({
            success: true,
            message: 'Item status updated successfully',
            item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get recent activity logs
 * @route   GET /api/admin/activity
 * @access  Private (Admin)
 */
exports.getRecentActivity = async (req, res, next) => {
    try {
        const { limit = 50 } = req.query;

        // Get recent items
        const recentItems = await Item.find()
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) / 2)
            .select('title type status reportedBy createdAt');

        // Get recent claims
        const recentClaims = await Claim.find()
            .populate('claimedBy', 'name email')
            .populate('item', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) / 2)
            .select('item claimedBy status createdAt');

        // Combine and sort by date
        const activity = [
            ...recentItems.map(item => ({
                type: 'item',
                action: `${item.type} item reported`,
                details: item.title,
                user: item.reportedBy,
                timestamp: item.createdAt
            })),
            ...recentClaims.map(claim => ({
                type: 'claim',
                action: 'Claim submitted',
                details: claim.item.title,
                user: claim.claimedBy,
                timestamp: claim.createdAt
            }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            count: activity.length,
            activity
        });
    } catch (error) {
        next(error);
    }
};

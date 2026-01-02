const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllItems,
    updateItemStatus,
    getRecentActivity
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getStats);
router.get('/activity', getRecentActivity);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Item moderation
router.get('/items', getAllItems);
router.patch('/items/:id/status', updateItemStatus);

module.exports = router;

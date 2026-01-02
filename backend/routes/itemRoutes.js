const express = require('express');
const router = express.Router();
const {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
    getMyItems,
    getMatches,
    getStats
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getItems);
router.get('/stats', getStats);
router.get('/:id', getItemById);
router.get('/:id/matches', getMatches);

// Protected routes
router.post('/', protect, upload.array('images', 5), createItem);
router.get('/user/my-items', protect, getMyItems);
router.put('/:id', protect, upload.array('images', 5), updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    createClaim,
    getClaims,
    getClaimById,
    updateClaimStatus,
    getMyClaims,
    deleteClaim,
    getClaimStats
} = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/auth');
const { upload, validateLimits } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// User routes
router.post('/', upload.array('proofImages'), validateLimits('proofImages'), createClaim);
router.get('/', getClaims);
router.get('/user/my-claims', getMyClaims);
router.get('/:id', getClaimById);
router.delete('/:id', deleteClaim);

// Staff/Admin routes
router.patch('/:id', authorize('admin'), updateClaimStatus);
router.get('/admin/stats', authorize('admin'), getClaimStats);

module.exports = router;

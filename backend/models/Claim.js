const mongoose = require('mongoose');

/**
 * Claim Schema
 * Represents claim requests for found items
 */
const claimSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: [true, 'Item reference is required']
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    proofDescription: {
        type: String,
        required: [true, 'Please provide proof of ownership'],
        trim: true,
        maxlength: [1000, 'Proof description cannot exceed 1000 characters']
    },
    proofImages: [{
        type: String, // Store file paths
        trim: true
    }],
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verificationNotes: {
        type: String,
        trim: true,
        maxlength: [500, 'Verification notes cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
claimSchema.index({ item: 1 });
claimSchema.index({ claimedBy: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ createdAt: -1 });

// Compound index for common queries
claimSchema.index({ item: 1, status: 1 });
claimSchema.index({ claimedBy: 1, status: 1 });

/**
 * Pre-save middleware to update timestamps
 */
claimSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Claim', claimSchema);

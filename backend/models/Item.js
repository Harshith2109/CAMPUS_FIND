const mongoose = require('mongoose');

/**
 * Item Schema
 * Represents lost and found items
 */
const itemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: [true, 'Please specify if item is lost or found']
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Please provide the location'],
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    date: {
        type: Date,
        required: [true, 'Please provide the date when item was lost/found'],
        default: Date.now
    },
    images: [{
        type: String, // Store file paths
        trim: true
    }],
    color: {
        type: String,
        trim: true,
        maxlength: [50, 'Color cannot exceed 50 characters']
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [100, 'Brand cannot exceed 100 characters']
    },
    identifyingFeatures: {
        type: String,
        trim: true,
        maxlength: [500, 'Identifying features cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['active', 'claimed', 'returned', 'archived'],
        default: 'active'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchedItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    claimRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Claim'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster queries
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ reportedBy: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ location: 1 });
itemSchema.index({ date: -1 });

// Text index for search functionality
itemSchema.index({
    title: 'text',
    description: 'text',
    location: 'text',
    color: 'text',
    brand: 'text',
    identifyingFeatures: 'text'
});

/**
 * Virtual property to check if item has matches
 */
itemSchema.virtual('isMatched').get(function () {
    return this.matchedItems && this.matchedItems.length > 0;
});

/**
 * Virtual property to get match count
 */
itemSchema.virtual('matchCount').get(function () {
    return this.matchedItems ? this.matchedItems.length : 0;
});

/**
 * Pre-save middleware to update timestamps
 */
itemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Item', itemSchema);

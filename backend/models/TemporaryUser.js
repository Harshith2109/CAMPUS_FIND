const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Temporary User Schema
 * Stores user data during registration before email verification
 */
const temporaryUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true, // Only one temp user per email at a time
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._-]+@rvce\.edu\.in$/,
            'Please use your RVCE email (yourname@rvce.edu.in)'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['student', 'staff', 'admin'],
        default: 'student'
    },
    phone: {
        type: String,
        trim: true,
        maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department name cannot exceed 100 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // Expire after 15 minutes (should be slightly longer than OTP expiry)
        expires: 900
    }
});

// Index for faster queries
temporaryUserSchema.index({ email: 1 });

// Hashing is handled in the main User model during verification
// to avoid double-hashing issues when moving data between collections.

module.exports = mongoose.model('TemporaryUser', temporaryUserSchema);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanupUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        const result = await User.deleteMany({ isEmailVerified: false });

        console.log(`✅ Deleted ${result.deletedCount} unverified users.`);

        process.exit();
    } catch (error) {
        console.error('❌ Error cleaning up users:', error);
        process.exit(1);
    }
};

cleanupUsers();

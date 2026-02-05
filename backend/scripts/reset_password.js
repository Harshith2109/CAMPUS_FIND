require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        const email = 'sagarkumar.sit25@rvce.edu.in';
        const newPassword = '803119@Sagar';

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log('✅ User found:', user.name);
        console.log('   Current role:', user.role);

        // Update password (will be auto-hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        console.log('\n✅ Password updated successfully!');
        console.log('\nYou can now login with:');
        console.log('   Email:', email);
        console.log('   Password:', newPassword);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetPassword();

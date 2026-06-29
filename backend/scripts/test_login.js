require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        const email = 'sagarkumar.sit25@rvce.edu.in';
        const password = '803119@Sagar';

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        console.log('✅ User found:', user.name);
        console.log('   Role:', user.role);
        console.log('   Verified:', user.verified);
        console.log('   Banned:', user.isBanned);

        // Test password
        const isMatch = await user.comparePassword(password);
        console.log('\n🔐 Password match:', isMatch ? '✅ YES' : '❌ NO');

        if (isMatch) {
            const token = user.generateAuthToken();
            console.log('\n✅ Login would succeed!');
            console.log('   Token would be generated');
        } else {
            console.log('\n❌ Login would fail - incorrect password');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testLogin();

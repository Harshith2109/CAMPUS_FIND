require('dotenv').config();
const mongoose = require('mongoose');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({
            email: 'sagarkumar.sit25@rvce.edu.in'
        });

        if (!user) {
            console.log('❌ User not found in database');
            console.log('\nℹ️  This user needs to register first.');
        } else {
            console.log('✅ User found:');
            console.log('   Name:', user.name);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Email Verified:', user.isEmailVerified);
            console.log('   Verified:', user.verified);
            console.log('   Banned:', user.isBanned);

            if (!user.isEmailVerified) {
                console.log('\n⚠️  ISSUE: Email is not verified');
                console.log('   The user must verify their email before logging in.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkUser();

require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Migration script to update user roles from old to new system
 * Old: 'user', 'admin'
 * New: 'student', 'staff', 'admin'
 */

const migrateRoles = async () => {
    try {
        console.log('🔄 Starting role migration...\n');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected\n');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const tempUsersCollection = db.collection('temporaryusers');

        // Update main users collection
        const usersResult = await usersCollection.updateMany(
            { role: 'user' },
            { $set: { role: 'student' } }
        );
        console.log(`✅ Updated ${usersResult.modifiedCount} users from 'user' to 'student'`);

        // Update temporary users collection
        const tempUsersResult = await tempUsersCollection.updateMany(
            { role: 'user' },
            { $set: { role: 'student' } }
        );
        console.log(`✅ Updated ${tempUsersResult.modifiedCount} temporary users from 'user' to 'student'`);

        // Display current user roles
        console.log('\n📊 Current user roles in database:');
        const roleStats = await usersCollection.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]).toArray();

        roleStats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} user(s)`);
        });

        console.log('\n✨ Migration completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

migrateRoles();

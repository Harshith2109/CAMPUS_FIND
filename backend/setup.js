/**
 * Setup Script - Add Hardcoded Users to Database
 * 
 * Usage: node setup.js
 * 
 * This script creates predefined admin and test users in the database.
 * It will only add users if they don't already exist (checked by email).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Hardcoded users to add
const HARDCODED_USERS = [
    {
        name: 'Admin User',
        email: 'harshithhs.sit25@rvce.edu.in',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        department: 'Administration'
    },
    
];

/**
 * Connect to MongoDB
 */
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');
        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        return false;
    }
}

/**
 * Add hardcoded users to database
 */
async function setupUsers() {
    try {
        console.log('\n🔧 Setting up hardcoded users...\n');

        let addedCount = 0;
        let skippedCount = 0;

        for (const userData of HARDCODED_USERS) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
                skippedCount++;
                continue;
            }

            // Create new user
            const user = new User(userData);
            await user.save();
            console.log(`✅ Added: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
            addedCount++;
        }

        console.log(`\n✨ Setup Complete!`);
        console.log(`   Added: ${addedCount} new users`);
        console.log(`   Skipped: ${skippedCount} existing users\n`);

        // Display all available credentials
        console.log('📝 Available Login Credentials:');
        console.log('━'.repeat(60));
        for (const user of HARDCODED_USERS) {
            console.log(`Email: ${user.email}`);
            console.log(`Password: ${user.password}`);
            console.log(`Role: ${user.role.toUpperCase()}`);
            console.log('─'.repeat(60));
        }

        return true;
    } catch (error) {
        console.error('❌ Error setting up users:', error.message);
        return false;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          CampusFind - User Setup Script                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    // Connect to database
    const connected = await connectDB();
    if (!connected) {
        console.error('\n❌ Failed to connect to database. Make sure MongoDB is running.');
        process.exit(1);
    }

    // Add users
    const success = await setupUsers();

    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database\n');

    process.exit(success ? 0 : 1);
}

// Run the setup
main();

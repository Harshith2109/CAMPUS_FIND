/**
 * Setup Script - Setup Admin User from Environment Variables
 * 
 * Usage: node setup.js
 * 
 * This script creates or updates the admin user based on .env configuration.
 * It is best practice to run this during deployment.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Connect to MongoDB
 */
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        return false;
    }
}

/**
 * Setup Admin User
 */
async function setupAdmin() {
    try {
        let admins = [];

        // Check for admins configuration
        if (process.env.ADMIN_ACCOUNTS) {
            try {
                admins = JSON.parse(process.env.ADMIN_ACCOUNTS);
            } catch (e) {
                console.error('❌ Error parsing ADMIN_ACCOUNTS environment variable. It must be a valid JSON string.');
                return false;
            }
        }

        if (admins.length === 0) {
            console.error('❌ Error: No admin configuration found. Set ADMIN_ACCOUNTS in .env as a JSON array.');
            return false;
        }

        console.log('\n🔧 Setting up Admin users from environment variables...\n');

        for (const adminConfig of admins) {
            const { email, password } = adminConfig;

            if (!email || !password) {
                console.warn(`⚠️ Skipping invalid admin config: ${JSON.stringify(adminConfig)}`);
                continue;
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: email });

            if (existingUser) {
                // Update existing admin
                existingUser.role = 'admin';
                existingUser.isEmailVerified = true;
                existingUser.verified = true;

                // Update password if provided
                existingUser.password = password;

                await existingUser.save();
                console.log(`🔄 Updated Admin: ${email}`);
            } else {
                // Create new admin
                const user = new User({
                    name: 'System Admin',
                    email: email,
                    password: password,
                    role: 'admin',
                    department: 'Administration',
                    phone: '',
                    isEmailVerified: true,
                    verified: true
                });

                await user.save();
                console.log(`✅ Created Admin: ${email}`);
            }
        }

        console.log(`\n✨ Admin Setup Complete! Processed ${admins.length} admin(s).`);
        return true;
    } catch (error) {
        console.error('❌ Error setting up admin:', error.message);
        return false;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          CampusFind - Admin Setup Script                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    // Connect to database
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    // Run setup
    const success = await setupAdmin();

    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database\n');

    process.exit(success ? 0 : 1);
}

// Run the setup
main();

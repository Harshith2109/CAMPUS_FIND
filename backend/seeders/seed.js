require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');

// Sample data
const users = [
    {
        name: 'Admin User',
        email: 'harshithhs.sit25@rvce.edu.in',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        department: 'Administration'
    },
    {
        name: 'Priya Sharma',
        email: 'priya@rvce.edu.in',
        password: 'user123',
        role: 'user',
        phone: '9876543212',
        department: 'Computer Science'
    },
    {
        name: 'Rahul Kumar',
        email: 'rahul@rvce.edu.in',
        password: 'user123',
        role: 'user',
        phone: '9876543213',
        department: 'Electronics'
    },
    {
        name: 'Anita Desai',
        email: 'anita@rvce.edu.in',
        password: 'user123',
        role: 'user',
        phone: '9876543214',
        department: 'Mechanical'
    }
];

const items = [
    // Lost items
    {
        type: 'lost',
        title: 'Black Leather Wallet',
        description: 'Lost my black leather wallet near the library. Contains ID card and some cash.',
        category: 'Wallet/Purse',
        location: 'Central Library',
        date: new Date('2025-12-27'),
        color: 'Black',
        brand: 'Leather',
        identifyingFeatures: 'Has a small tear on the back side',
        status: 'active'
    },
    {
        type: 'lost',
        title: 'iPhone 13 Pro',
        description: 'Lost my iPhone 13 Pro in blue color. Has a cracked screen protector.',
        category: 'Electronics',
        location: 'Cafeteria',
        date: new Date('2025-12-26'),
        color: 'Blue',
        brand: 'Apple',
        identifyingFeatures: 'Cracked screen protector, custom wallpaper',
        status: 'active'
    },
    {
        type: 'lost',
        title: 'Student ID Card',
        description: 'Lost my student ID card with photo. Name: Priya Sharma',
        category: 'ID Card',
        location: 'Main Gate',
        date: new Date('2025-12-28'),
        color: 'White',
        identifyingFeatures: 'Photo ID with student number',
        status: 'active'
    },
    {
        type: 'lost',
        title: 'Engineering Textbook',
        description: 'Lost my Data Structures textbook. Has my name written inside.',
        category: 'Books/Notes',
        location: 'CS Department',
        date: new Date('2025-12-25'),
        color: 'Blue',
        identifyingFeatures: 'Name written on first page, highlighted sections',
        status: 'active'
    },
    {
        type: 'lost',
        title: 'Silver Watch',
        description: 'Lost my silver wristwatch near the sports complex.',
        category: 'Watch',
        location: 'Sports Complex',
        date: new Date('2025-12-27'),
        color: 'Silver',
        brand: 'Titan',
        identifyingFeatures: 'Engraved initials on back',
        status: 'active'
    },
    // Found items
    {
        type: 'found',
        title: 'Black Wallet',
        description: 'Found a black wallet near the library entrance. Contains some cards.',
        category: 'Wallet/Purse',
        location: 'Central Library',
        date: new Date('2025-12-27'),
        color: 'Black',
        identifyingFeatures: 'Contains ID cards and cash',
        status: 'active'
    },
    {
        type: 'found',
        title: 'Blue iPhone',
        description: 'Found an iPhone in the cafeteria. Screen is slightly damaged.',
        category: 'Electronics',
        location: 'Cafeteria',
        date: new Date('2025-12-26'),
        color: 'Blue',
        brand: 'Apple',
        identifyingFeatures: 'Damaged screen protector',
        status: 'active'
    },
    {
        type: 'found',
        title: 'Student ID',
        description: 'Found a student ID card near the main gate.',
        category: 'ID Card',
        location: 'Main Gate',
        date: new Date('2025-12-28'),
        color: 'White',
        identifyingFeatures: 'Has student photo',
        status: 'active'
    },
    {
        type: 'found',
        title: 'Red Backpack',
        description: 'Found a red backpack in the library. Contains notebooks.',
        category: 'Bags/Backpacks',
        location: 'Central Library',
        date: new Date('2025-12-26'),
        color: 'Red',
        identifyingFeatures: 'Contains notebooks and stationery',
        status: 'active'
    },
    {
        type: 'found',
        title: 'Prescription Glasses',
        description: 'Found black-framed glasses in the CS lab.',
        category: 'Glasses',
        location: 'CS Department',
        date: new Date('2025-12-27'),
        color: 'Black',
        identifyingFeatures: 'Black rectangular frames',
        status: 'active'
    },
    {
        type: 'found',
        title: 'Water Bottle',
        description: 'Found a blue water bottle near the sports complex.',
        category: 'Water Bottle',
        location: 'Sports Complex',
        date: new Date('2025-12-28'),
        color: 'Blue',
        brand: 'Milton',
        identifyingFeatures: 'Has stickers on it',
        status: 'active'
    },
    {
        type: 'found',
        title: 'USB Drive',
        description: 'Found a 32GB USB drive in the computer lab.',
        category: 'Electronics',
        location: 'Computer Lab',
        date: new Date('2025-12-25'),
        color: 'Black',
        brand: 'SanDisk',
        identifyingFeatures: '32GB capacity',
        status: 'active'
    }
];

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Clear existing data
const clearData = async () => {
    try {
        await User.deleteMany();
        await Item.deleteMany();
        await Claim.deleteMany();
        await Notification.deleteMany();
        console.log('🗑️  Cleared existing data');
    } catch (error) {
        console.error('Error clearing data:', error);
    }
};

// Seed users
const seedUsers = async () => {
    try {
        const createdUsers = await User.create(users);
        console.log(`✅ Created ${createdUsers.length} users`);
        return createdUsers;
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
};

// Seed items
const seedItems = async (users) => {
    try {
        // Assign items to users
        const itemsWithUsers = items.map((item, index) => ({
            ...item,
            reportedBy: users[index % users.length]._id
        }));

        const createdItems = await Item.create(itemsWithUsers);
        console.log(`✅ Created ${createdItems.length} items`);
        return createdItems;
    } catch (error) {
        console.error('Error seeding items:', error);
        throw error;
    }
};

// Seed sample claim
const seedClaims = async (items, users) => {
    try {
        // Create a sample claim for the wallet
        const walletItem = items.find(item => item.title === 'Black Wallet' && item.type === 'found');
        const claimer = users.find(user => user.role === 'user');

        if (walletItem && claimer) {
            const claim = await Claim.create({
                item: walletItem._id,
                claimedBy: claimer._id,
                proofDescription: 'This is my wallet. I can describe the contents: ID card with my photo, library card, and some cash.',
                status: 'pending'
            });

            // Add claim to item
            walletItem.claimRequests.push(claim._id);
            await walletItem.save();

            console.log('✅ Created sample claim');
            return [claim];
        }
        return [];
    } catch (error) {
        console.error('Error seeding claims:', error);
        throw error;
    }
};

// Seed sample notifications
const seedNotifications = async (users, items) => {
    try {
        const user = users.find(u => u.role === 'user');
        const item = items[0];

        if (user && item) {
            await Notification.create([
                {
                    user: user._id,
                    type: 'match',
                    title: 'Potential Match Found!',
                    message: `We found a potential match for your ${item.type} item: ${item.title}`,
                    relatedItem: item._id,
                    read: false
                },
                {
                    user: user._id,
                    type: 'system',
                    title: 'Welcome to CampusFind!',
                    message: 'Start reporting lost or found items to help the campus community.',
                    read: false
                }
            ]);

            console.log('✅ Created sample notifications');
        }
    } catch (error) {
        console.error('Error seeding notifications:', error);
    }
};

// Main seed function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        await connectDB();
        await clearData();

        const createdUsers = await seedUsers();
        const createdItems = await seedItems(createdUsers);
        await seedClaims(createdItems, createdUsers);
        await seedNotifications(createdUsers, createdItems);

        console.log('\n✨ Database seeding completed successfully!\n');
        console.log('📝 Sample Credentials:');
        console.log('   Admin: admin@campusfind.com / admin123');
        console.log('   User:  priya@student.com / user123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();

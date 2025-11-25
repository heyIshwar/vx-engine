require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../lib/config');
const User = require('../modules/User/model');
const UserPreference = require('../models/UserPreference');

/**
 * Seed script to populate database with initial data
 * Run with: npm run seed
 */

async function connectDatabase() {
    try {
        const dbConfig = config.get('database');
        let connectionString;
        
        if (process.env.MONGODB_URI) {
            connectionString = process.env.MONGODB_URI;
        } else {
            const { username, password, host, port, name, authSource } = dbConfig;
            if (username && password) {
                connectionString = `mongodb://${username}:${password}@${host}:${port}/${name}?authSource=${authSource || 'admin'}`;
            } else {
                connectionString = `mongodb://${host}:${port}/${name}`;
            }
        }
        
        await mongoose.connect(connectionString);
        console.log('✓ Connected to MongoDB');
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        process.exit(1);
    }
}

async function seedUsers() {
    try {
        console.log('\n📦 Seeding users...');

        // Admin user
        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123';
        const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            admin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                username: 'admin',
                password: adminPasswordHash,
                isAdmin: true,
                flags: {},
                isDeleted: false
            });
            console.log(`✓ Created admin user: ${adminEmail} / ${adminPassword}`);
        } else {
            console.log(`✓ Admin user already exists: ${adminEmail}`);
        }

        // Create admin preferences if not exists
        let adminPrefs = await UserPreference.findOne({ userId: admin._id });
        if (!adminPrefs) {
            await UserPreference.create({ userId: admin._id });
            console.log('✓ Created admin preferences');
        }

        // Test users
        const testUsers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'password123'
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                username: 'janesmith',
                password: 'password123'
            },
            {
                name: 'Test User',
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123'
            }
        ];

        for (const userData of testUsers) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                const passwordHash = await bcrypt.hash(userData.password, 10);
                user = await User.create({
                    ...userData,
                    password: passwordHash,
                    flags: {},
                    isDeleted: false
                });
                console.log(`✓ Created test user: ${userData.email} / ${userData.password}`);

                // Create user preferences
                await UserPreference.create({ userId: user._id });
            } else {
                console.log(`✓ Test user already exists: ${userData.email}`);
            }
        }

        console.log('\n✅ User seeding completed!');
        console.log('\n📋 Login Credentials:');
        console.log('Admin:');
        console.log(`  Email: ${adminEmail}`);
        console.log(`  Password: ${adminPassword}`);
        console.log('\nTest Users:');
        testUsers.forEach(u => {
            console.log(`  ${u.email} / ${u.password}`);
        });

    } catch (error) {
        console.error('✗ Error seeding users:', error);
        throw error;
    }
}

async function seed() {
    try {
        await connectDatabase();
        await seedUsers();
        console.log('\n🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Seeding failed:', error);
        process.exit(1);
    }
}

// Run seed if called directly
if (require.main === module) {
    seed();
}

module.exports = { seed, seedUsers };


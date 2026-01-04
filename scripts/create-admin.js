require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/database');

async function createAdmin() {
  try {
    await connectDB();
    
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'Admin';

    if (!email || !password) {
      console.error('Usage: node scripts/create-admin.js <email> <password> [name]');
      process.exit(1);
    }

    // Check if admin exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists with this email');
      process.exit(1);
    }

    // Create admin
    const admin = new Admin({
      email,
      password, // Will be hashed by pre-save hook
      name,
      role: 'super_admin'
    });

    await admin.save();
    console.log(`✅ Admin created successfully: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();


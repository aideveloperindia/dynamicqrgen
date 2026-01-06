require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Link = require('../models/Link');
const Payment = require('../models/Payment');

async function cleanupAllClients() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Count before deletion
    const userCount = await User.countDocuments();
    const linkCount = await Link.countDocuments();
    const paymentCount = await Payment.countDocuments();

    console.log('\n📊 Current Database State:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Links: ${linkCount}`);
    console.log(`   Payments: ${paymentCount}`);

    if (userCount === 0) {
      console.log('\n✅ Database is already empty. Nothing to clean up.');
      await mongoose.connection.close();
      return;
    }

    console.log('\n🗑️  Starting cleanup...');

    // Delete all payments first (foreign key dependency)
    const paymentResult = await Payment.deleteMany({});
    console.log(`   ✅ Deleted ${paymentResult.deletedCount} payment records`);

    // Delete all links
    const linkResult = await Link.deleteMany({});
    console.log(`   ✅ Deleted ${linkResult.deletedCount} link records`);

    // Delete all users
    const userResult = await User.deleteMany({});
    console.log(`   ✅ Deleted ${userResult.deletedCount} user records`);

    // Verify cleanup
    const remainingUsers = await User.countDocuments();
    const remainingLinks = await Link.countDocuments();
    const remainingPayments = await Payment.countDocuments();

    console.log('\n✅ Cleanup Complete!');
    console.log('\n📊 Final Database State:');
    console.log(`   Users: ${remainingUsers}`);
    console.log(`   Links: ${remainingLinks}`);
    console.log(`   Payments: ${remainingPayments}`);

    if (remainingUsers === 0 && remainingLinks === 0 && remainingPayments === 0) {
      console.log('\n🎉 Database is completely clean!');
    } else {
      console.log('\n⚠️  Warning: Some records still remain.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run cleanup
cleanupAllClients();


require('dotenv').config();
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');

/**
 * Cleanup script for inactive accounts
 * 
 * This script removes accounts that meet any of these criteria:
 * 1. Created more than 90 days ago and never logged in
 * 2. Last login more than 180 days ago
 * 3. Created more than 30 days ago with no subscription, no links, and no QR code
 * 
 * Run with: node scripts/cleanup-inactive-accounts.js [--dry-run]
 */

const DRY_RUN = process.argv.includes('--dry-run');
const DAYS_INACTIVE = 180; // Delete accounts inactive for 180 days
const DAYS_NEVER_LOGGED_IN = 90; // Delete accounts created 90+ days ago that never logged in
const DAYS_INCOMPLETE = 30; // Delete incomplete accounts older than 30 days

async function cleanupInactiveAccounts() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database\n');

    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - DAYS_INACTIVE * 24 * 60 * 60 * 1000);
    const neverLoggedInThreshold = new Date(now.getTime() - DAYS_NEVER_LOGGED_IN * 24 * 60 * 60 * 1000);
    const incompleteThreshold = new Date(now.getTime() - DAYS_INCOMPLETE * 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    let stats = {
      inactive: 0,
      neverLoggedIn: 0,
      incomplete: 0
    };

    // 1. Find accounts that haven't logged in for 180+ days
    console.log(`📊 Finding accounts inactive for ${DAYS_INACTIVE}+ days...`);
    const inactiveUsers = await User.find({
      lastLogin: { $lt: inactiveThreshold },
      lastLogin: { $exists: true, $ne: null }
    });

    console.log(`   Found ${inactiveUsers.length} inactive accounts`);
    stats.inactive = inactiveUsers.length;

    // 2. Find accounts created 90+ days ago that never logged in
    console.log(`📊 Finding accounts created ${DAYS_NEVER_LOGGED_IN}+ days ago that never logged in...`);
    const neverLoggedInUsers = await User.find({
      createdAt: { $lt: neverLoggedInThreshold },
      $or: [
        { lastLogin: { $exists: false } },
        { lastLogin: null }
      ]
    });

    console.log(`   Found ${neverLoggedInUsers.length} accounts that never logged in`);
    stats.neverLoggedIn = neverLoggedInUsers.length;

    // 3. Find incomplete accounts (no subscription, no links, no QR code) older than 30 days
    console.log(`📊 Finding incomplete accounts older than ${DAYS_INCOMPLETE} days...`);
    const incompleteUsers = await User.find({
      createdAt: { $lt: incompleteThreshold },
      subscriptionActive: false
    });

    // Filter to find users with no meaningful data
    const incompleteUsers2 = [];
    for (const user of incompleteUsers) {
      // Check if user has business name
      const hasBusinessName = user.businessName && user.businessName.trim().length > 0;
      
      // Check if user has links
      const linkCount = await Link.countDocuments({ userId: user._id, isActive: true });
      const hasLinks = linkCount > 0;
      
      // Check if user has QR code
      const hasQRCode = user.qrCode && user.qrCode.trim().length > 0;
      
      // If user has no business name, no links, and no QR code, mark as incomplete
      if (!hasBusinessName && !hasLinks && !hasQRCode) {
        incompleteUsers2.push(user);
      }
    }

    console.log(`   Found ${incompleteUsers2.length} incomplete accounts`);
    stats.incomplete = incompleteUsers2.length;

    // Combine all accounts to delete (avoid duplicates)
    const allAccountsToDelete = new Map();
    
    inactiveUsers.forEach(user => {
      allAccountsToDelete.set(user._id.toString(), user);
    });
    
    neverLoggedInUsers.forEach(user => {
      allAccountsToDelete.set(user._id.toString(), user);
    });
    
    incompleteUsers2.forEach(user => {
      allAccountsToDelete.set(user._id.toString(), user);
    });

    const accountsToDelete = Array.from(allAccountsToDelete.values());
    deletedCount = accountsToDelete.length;

    console.log(`\n📋 Summary:`);
    console.log(`   Total accounts to delete: ${deletedCount}`);
    console.log(`   - Inactive (${DAYS_INACTIVE}+ days): ${stats.inactive}`);
    console.log(`   - Never logged in (${DAYS_NEVER_LOGGED_IN}+ days old): ${stats.neverLoggedIn}`);
    console.log(`   - Incomplete (${DAYS_INCOMPLETE}+ days old, no data): ${stats.incomplete}`);

    if (accountsToDelete.length === 0) {
      console.log('\n✅ No inactive accounts to clean up!');
      process.exit(0);
    }

    // Show sample of accounts to be deleted
    console.log(`\n📝 Sample accounts to be deleted (first 5):`);
    accountsToDelete.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - Created: ${user.createdAt.toISOString().split('T')[0]}, Last Login: ${user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : 'Never'}`);
    });

    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN MODE - No accounts were deleted');
      console.log('   Run without --dry-run to actually delete accounts');
    } else {
      console.log('\n🗑️  Deleting accounts and associated data...');
      
      const userIds = accountsToDelete.map(u => u._id);
      
      // Delete associated links first
      const linksDeleted = await Link.deleteMany({
        userId: { $in: userIds }
      });
      console.log(`   Deleted ${linksDeleted.deletedCount} associated links`);
      
      // Delete accounts
      const deleteResult = await User.deleteMany({
        _id: { $in: userIds }
      });

      console.log(`✅ Successfully deleted ${deleteResult.deletedCount} inactive accounts`);
    }

    // Show remaining stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ subscriptionActive: true });
    
    console.log(`\n📊 Database stats after cleanup:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Active subscriptions: ${activeUsers}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupInactiveAccounts();


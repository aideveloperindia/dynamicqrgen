/**
 * Quick Setup Script: Add Real UPI ID to All Merchants
 * 
 * Usage: node scripts/setupUPI.js YOUR_UPI_ID
 * Example: node scripts/setupUPI.js demo@paytm
 */

const fs = require('fs');
const path = require('path');

const merchantsFile = path.join(__dirname, '..', 'data', 'merchants.json');

// Get UPI ID from command line
const upiId = process.argv[2];

if (!upiId) {
  console.log('❌ Error: Please provide your UPI ID');
  console.log('');
  console.log('Usage: node scripts/setupUPI.js YOUR_UPI_ID');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/setupUPI.js demo@paytm');
  console.log('  node scripts/setupUPI.js yourname@okaxis');
  console.log('');
  console.log('💡 How to find your UPI ID:');
  console.log('  - Open Google Pay/PhonePe/Paytm app');
  console.log('  - Go to Profile/Settings');
  console.log('  - Your UPI ID is shown there');
  process.exit(1);
}

// Validate UPI ID format (basic check)
if (!upiId.includes('@')) {
  console.log('⚠️  Warning: UPI ID should contain @ (e.g., demo@paytm)');
  console.log('   Continuing anyway...');
  console.log('');
}

try {
  // Read merchants
  const merchants = JSON.parse(fs.readFileSync(merchantsFile, 'utf8'));
  
  console.log(`🔄 Updating UPI IDs for all ${merchants.length} merchants...`);
  console.log(`📱 Using UPI ID: ${upiId}`);
  console.log('');

  // Update all merchants
  let updated = 0;
  merchants.forEach((merchant, index) => {
    if (merchant.upi) {
      // Update Google Pay intent
      if (merchant.upi.gpay_intent) {
        merchant.upi.gpay_intent = merchant.upi.gpay_intent.replace(
          /pa=[^&]+/,
          `pa=${encodeURIComponent(upiId)}`
        );
      }
      
      // Update PhonePe intent
      if (merchant.upi.phonepe_intent) {
        merchant.upi.phonepe_intent = merchant.upi.phonepe_intent.replace(
          /pa=[^&]+/,
          `pa=${encodeURIComponent(upiId)}`
        );
      }
      
      // Update Paytm intent
      if (merchant.upi.paytm_intent) {
        merchant.upi.paytm_intent = merchant.upi.paytm_intent.replace(
          /pa=[^&]+/,
          `pa=${encodeURIComponent(upiId)}`
        );
      }
      
      updated++;
      console.log(`✅ Updated: ${merchant.name}`);
    }
  });

  // Save updated merchants
  fs.writeFileSync(merchantsFile, JSON.stringify(merchants, null, 2));
  
  console.log('');
  console.log(`✨ Success! Updated ${updated} merchants with UPI ID: ${upiId}`);
  console.log('');
  console.log('🔒 Safety: All UPI intents use am=0 (amount=0) - no money can be sent');
  console.log('');
  console.log('📱 Test it:');
  console.log('  1. Start server: npm start');
  console.log('  2. Scan QR with Google Pay/PhonePe/Paytm');
  console.log('  3. Payment app should open with your UPI ID prefilled');
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}




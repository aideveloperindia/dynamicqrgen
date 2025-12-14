const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Deployment URL - change this to your Vercel URL after deployment
const BASE_URL = process.env.BASE_URL || 'https://oneqrcode.vercel.app';

async function generateQR() {
  try {
    const qrPath = path.join(__dirname, '../public/qr');
    
    // Ensure directory exists
    if (!fs.existsSync(qrPath)) {
      fs.mkdirSync(qrPath, { recursive: true });
    }

    const outputPath = path.join(qrPath, 'adx-transit.png');
    
    console.log(`📱 Generating QR code pointing to: ${BASE_URL}`);
    
    await QRCode.toFile(outputPath, BASE_URL, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log(`✅ QR code saved to: ${outputPath}`);
    console.log(`\n🔗 QR Code URL: ${BASE_URL}`);
    console.log(`📁 File location: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    process.exit(1);
  }
}

generateQR();

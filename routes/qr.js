const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectDB = require('../config/database');
const QRCode = require('qrcode');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    await connectDB();
  }
  next();
});

// Generate QR code for user
router.get('/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.paymentCompleted) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please complete payment to generate QR code' 
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const qrUrl = `${baseUrl}/p/${user.uniqueSlug}`;
    
    const qrPath = path.join(__dirname, '../public/qr');
    if (!fs.existsSync(qrPath)) {
      fs.mkdirSync(qrPath, { recursive: true });
    }

    const outputPath = path.join(qrPath, `${user.uniqueSlug}.png`);
    
    await QRCode.toFile(outputPath, qrUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrUrl: `/qr/${user.uniqueSlug}.png`,
      pageUrl: qrUrl,
      message: 'QR code generated successfully'
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ success: false, message: 'Error generating QR code' });
  }
});

// Download QR code
router.get('/download', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.paymentCompleted) {
      return res.status(403).send('Please complete payment to download QR code');
    }

    const qrPath = path.join(__dirname, '../public/qr', `${user.uniqueSlug}.png`);
    
    if (fs.existsSync(qrPath)) {
      res.download(qrPath, `qr-${user.uniqueSlug}.png`);
    } else {
      res.status(404).send('QR code not found. Please generate it first.');
    }
  } catch (error) {
    console.error('QR download error:', error);
    res.status(500).send('Error downloading QR code');
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectDB = require('../config/database');
const QRCode = require('qrcode');
const User = require('../models/User');

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('QR route DB error:', error);
    next(error);
  }
});

// Generate QR code for user (returns base64 - works with Vercel)
router.get('/generate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check subscription status
    const now = new Date();
    const isActive = user.subscriptionActive && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now;
    
    if (!isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please subscribe (₹999/year) to generate QR code' 
      });
    }

    // Check if user has at least one active link
    const Link = require('../models/Link');
    const activeLinks = await Link.find({ userId: user._id, isActive: true });
    
    if (!activeLinks || activeLinks.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please add at least one link before generating QR code' 
      });
    }

    const baseUrl = process.env.BASE_URL || 'https://dynamicqrgen.vercel.app';
    const pageUrl = `${baseUrl}/p/${user.uniqueSlug}`;
    
    // Generate QR as base64 data URL (works on Vercel's read-only filesystem)
    const qrDataUrl = await QRCode.toDataURL(pageUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Store QR in user document for persistence
    user.qrCode = qrDataUrl;
    await user.save();

    res.json({
      success: true,
      qrUrl: qrDataUrl,
      pageUrl: pageUrl,
      message: 'QR code generated successfully'
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ success: false, message: 'Error generating QR code: ' + error.message });
  }
});

// Get existing QR code
router.get('/get', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check subscription status
    const now = new Date();
    const isActive = user.subscriptionActive && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now;
    
    if (!isActive) {
      return res.status(403).json({ success: false, message: 'Active subscription required' });
    }

    if (user.qrCode) {
      const baseUrl = process.env.BASE_URL || 'https://dynamicqrgen.vercel.app';
      res.json({
        success: true,
        qrUrl: user.qrCode,
        pageUrl: `${baseUrl}/p/${user.uniqueSlug}`
      });
    } else {
      res.json({ success: false, message: 'QR code not generated yet' });
    }
  } catch (error) {
    console.error('QR get error:', error);
    res.status(500).json({ success: false, message: 'Error getting QR code' });
  }
});

module.exports = router;


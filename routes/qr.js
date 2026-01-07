const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectDB = require('../config/database');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const User = require('../models/User');

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('QR route DB error:', error.message);
    // Don't crash - continue anyway, routes will handle DB errors individually
    next();
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

    // Check if account is activated by admin
    if (!user.accountActivated) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is pending admin approval. Once approved, you can download your QR code.' 
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

    // Create canvas with QR code and business name
    const qrImage = await loadImage(qrDataUrl);
    const businessName = user.businessName || user.name || 'QR Code';
    
    // Calculate canvas dimensions
    const qrSize = 500;
    const padding = 40;
    const textHeight = 60;
    const canvasWidth = qrSize + (padding * 2);
    const canvasHeight = qrSize + (padding * 2) + textHeight;
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw QR code
    ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);
    
    // Draw business name below QR code
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Center the text
    const textX = canvasWidth / 2;
    const textY = qrSize + padding + 10;
    
    // Draw text with word wrapping if needed
    const maxWidth = qrSize;
    const words = businessName.split(' ');
    let line = '';
    let y = textY;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, textX, y);
        line = words[n] + ' ';
        y += 40; // Line height
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, textX, y);
    
    // Convert canvas to base64 data URL
    const finalQrDataUrl = canvas.toDataURL('image/png');

    // Store QR in user document for persistence
    user.qrCode = finalQrDataUrl;
    await user.save();

    res.json({
      success: true,
      qrUrl: finalQrDataUrl,
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

    // Check if account is activated by admin
    if (!user.accountActivated) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is pending admin approval. Once approved, you can download your QR code.' 
      });
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


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectDB = require('../config/database');
const QRCode = require('qrcode');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Try to load canvas, but make it optional (may fail on Vercel)
let canvasAvailable = false;
let createCanvas, loadImage, registerFont;
try {
  const canvasModule = require('canvas');
  createCanvas = canvasModule.createCanvas;
  loadImage = canvasModule.loadImage;
  registerFont = canvasModule.registerFont;
  canvasAvailable = true;
  
  // Try to register a font if available (for better Vercel compatibility)
  // If no font file exists, canvas will use default fonts
  try {
    // Check if we have a font file (optional - will fallback to system fonts if not)
    const fontPath = path.join(__dirname, '../fonts', 'Roboto-Regular.ttf');
    if (fs.existsSync(fontPath)) {
      registerFont(fontPath, { family: 'Roboto' });
      console.log('✅ Registered Roboto font');
    }
  } catch (fontError) {
    // Font registration is optional - continue without it
    console.log('ℹ️  No custom font file found, using system fonts');
  }
} catch (error) {
  console.warn('Canvas package not available, will use QR code without text overlay:', error.message);
  canvasAvailable = false;
}

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

// Helper function to render text with fallback fonts
function renderTextWithFallback(ctx, text, x, y, maxWidth) {
  // Try different font configurations that work better on Vercel
  const fontConfigs = [
    'bold 32px Roboto, sans-serif',  // If Roboto is registered
    'bold 32px DejaVu Sans, sans-serif',  // Common Linux font
    'bold 32px Liberation Sans, sans-serif',  // Common Linux font
    'bold 32px Arial, sans-serif',  // Fallback
    'bold 32px sans-serif'  // Ultimate fallback
  ];
  
  for (const fontConfig of fontConfigs) {
    try {
      ctx.font = fontConfig;
      const metrics = ctx.measureText(text);
      
      // If text renders without boxes (has reasonable width), use this font
      if (metrics.width > 0 && metrics.width < maxWidth * 2) {
        return { font: fontConfig, metrics };
      }
    } catch (e) {
      continue;
    }
  }
  
  // Last resort: use default sans-serif
  ctx.font = 'bold 32px sans-serif';
  return { font: ctx.font, metrics: ctx.measureText(text) };
}

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

    let finalQrDataUrl = qrDataUrl;
    
    // Try to add business name below QR code if canvas is available
    console.log('QR Generation Debug:', {
      canvasAvailable,
      hasBusinessName: !!user.businessName,
      businessName: user.businessName,
      businessNameTrimmed: user.businessName ? user.businessName.trim() : ''
    });
    
    if (canvasAvailable && user.businessName && user.businessName.trim() !== '') {
      try {
        const businessName = user.businessName.trim();
        console.log('✅ Adding business name to QR:', businessName);
        
        const qrImage = await loadImage(qrDataUrl);
        
        // Calculate canvas dimensions
        const qrSize = 500;
        const padding = 40;
        const textHeight = 80; // Increased for better text visibility
        const canvasWidth = qrSize + (padding * 2);
        const canvasHeight = qrSize + (padding * 2) + textHeight;
        
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw QR code
        ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);
        
        // Draw business name below QR code with font fallback
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Center the text
        const textX = canvasWidth / 2;
        const textY = qrSize + padding + 15; // Slightly more spacing
        
        // Draw text with word wrapping if needed
        const maxWidth = qrSize - 20; // Slight margin for text
        const words = businessName.split(' ');
        let line = '';
        let y = textY;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          
          // Use font fallback to find a working font
          const { font, metrics } = renderTextWithFallback(ctx, testLine, textX, y, maxWidth);
          ctx.font = font;
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line.trim(), textX, y);
            line = words[n] + ' ';
            y += 40; // Line height
          } else {
            line = testLine;
          }
        }
        // Draw the last line
        if (line.trim()) {
          const { font } = renderTextWithFallback(ctx, line.trim(), textX, y, maxWidth);
          ctx.font = font;
          ctx.fillText(line.trim(), textX, y);
        }
        
        // Convert canvas to base64 data URL
        finalQrDataUrl = canvas.toDataURL('image/png');
        console.log('✅ QR code with business name generated successfully');
      } catch (canvasError) {
        console.error('❌ Canvas error, using QR code without text:', canvasError.message);
        // Use QR code without text overlay if canvas fails
        finalQrDataUrl = qrDataUrl;
      }
    } else {
      if (!canvasAvailable) {
        console.warn('⚠️ Canvas not available - QR code generated without business name');
      } else if (!user.businessName || user.businessName.trim() === '') {
        console.warn('⚠️ Business name not set - QR code generated without business name');
      }
    }

    // DON'T store QR code in database - generate on-demand to save storage costs
    // QR codes are deterministic (same input = same output), so we can regenerate anytime
    // This saves 100% of QR code storage costs for 10,000+ clients

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

// Get QR code (generates on-demand, no storage needed)
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

    // Generate QR code on-demand (no storage needed)
    const baseUrl = process.env.BASE_URL || 'https://dynamicqrgen.vercel.app';
    const pageUrl = `${baseUrl}/p/${user.uniqueSlug}`;
    
    // Generate QR as base64 data URL
    const qrDataUrl = await QRCode.toDataURL(pageUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    let finalQrDataUrl = qrDataUrl;
    
    // Try to add business name below QR code if canvas is available
    console.log('QR Get Debug:', {
      canvasAvailable,
      hasBusinessName: !!user.businessName,
      businessName: user.businessName,
      businessNameTrimmed: user.businessName ? user.businessName.trim() : ''
    });
    
    if (canvasAvailable && user.businessName && user.businessName.trim() !== '') {
      try {
        const businessName = user.businessName.trim();
        console.log('✅ Adding business name to QR:', businessName);
        
        const qrImage = await loadImage(qrDataUrl);
        
        const qrSize = 500;
        const padding = 40;
        const textHeight = 80; // Increased for better text visibility
        const canvasWidth = qrSize + (padding * 2);
        const canvasHeight = qrSize + (padding * 2) + textHeight;
        
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);
        
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const textX = canvasWidth / 2;
        const textY = qrSize + padding + 15; // Slightly more spacing
        const maxWidth = qrSize - 20; // Slight margin for text
        const words = businessName.split(' ');
        let line = '';
        let y = textY;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          
          // Use font fallback to find a working font
          const { font, metrics } = renderTextWithFallback(ctx, testLine, textX, y, maxWidth);
          ctx.font = font;
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line.trim(), textX, y);
            line = words[n] + ' ';
            y += 40;
          } else {
            line = testLine;
          }
        }
        // Draw the last line
        if (line.trim()) {
          const { font } = renderTextWithFallback(ctx, line.trim(), textX, y, maxWidth);
          ctx.font = font;
          ctx.fillText(line.trim(), textX, y);
        }
        
        finalQrDataUrl = canvas.toDataURL('image/png');
        console.log('✅ QR code with business name generated successfully');
      } catch (canvasError) {
        console.error('❌ Canvas error, using QR code without text:', canvasError.message);
        finalQrDataUrl = qrDataUrl;
      }
    } else {
      if (!canvasAvailable) {
        console.warn('⚠️ Canvas not available - QR code generated without business name');
      } else if (!user.businessName || user.businessName.trim() === '') {
        console.warn('⚠️ Business name not set - QR code generated without business name');
      }
    }

    res.json({
      success: true,
      qrUrl: finalQrDataUrl,
      pageUrl: pageUrl
    });
  } catch (error) {
    console.error('QR get error:', error);
    res.status(500).json({ success: false, message: 'Error getting QR code' });
  }
});

module.exports = router;

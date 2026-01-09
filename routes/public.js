const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');
const path = require('path');
const fs = require('fs');

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Public route DB error:', error.message);
    // Don't crash - continue anyway, routes will handle DB errors individually
    next();
  }
});

// Public page for user's QR code
router.get('/:slug', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueSlug: req.params.slug });
    
    if (!user) {
      return res.status(404).send('Page not found');
    }

    // Check subscription status (consistent with rest of app)
    const now = new Date();
    const isActive = user.subscriptionActive && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now;
    
    // TEMPORARILY DISABLED for testing - uncomment after testing
    // if (!isActive) {
    //   return res.status(403).send('This page is not active. Subscription expired.');
    // }

    const links = await Link.find({ 
      userId: user._id, 
      isActive: true 
    }).sort({ order: 1 });

    // Generate QR code on-demand (no storage needed - saves 100% QR storage costs)
    // QR codes are deterministic, so we can regenerate anytime from user's slug
    let qrCode = null;
    try {
      const QRCode = require('qrcode');
      const baseUrl = process.env.BASE_URL || 'https://dynamicqrgen.vercel.app';
      const pageUrl = `${baseUrl}/p/${user.uniqueSlug}`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(pageUrl, {
        width: 500,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Try to add business name if canvas is available
      let canvasAvailable = false;
      let createCanvas, loadImage;
      try {
        const canvasModule = require('canvas');
        createCanvas = canvasModule.createCanvas;
        loadImage = canvasModule.loadImage;
        canvasAvailable = true;
      } catch (error) {
        canvasAvailable = false;
      }

      if (canvasAvailable && user.businessName && user.businessName.trim() !== '') {
        try {
          const businessName = user.businessName || user.name || 'QR Code';
          const qrImage = await loadImage(qrDataUrl);
          
          const qrSize = 500;
          const padding = 40;
          const textHeight = 60;
          const canvasWidth = qrSize + (padding * 2);
          const canvasHeight = qrSize + (padding * 2) + textHeight;
          
          const canvas = createCanvas(canvasWidth, canvasHeight);
          const ctx = canvas.getContext('2d');
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);
          
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          const textX = canvasWidth / 2;
          const textY = qrSize + padding + 10;
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
              y += 40;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, textX, y);
          
          qrCode = canvas.toDataURL('image/png');
        } catch (canvasError) {
          qrCode = qrDataUrl;
        }
      } else {
        qrCode = qrDataUrl;
      }
    } catch (qrError) {
      console.error('Error generating QR code for public page:', qrError);
      // Continue without QR code if generation fails
    }

    res.render('public-page', {
      user: {
        ...user.toObject(),
        qrCode: qrCode
      },
      links,
      isPublic: true
    });
  } catch (error) {
    console.error('Public page error:', error);
    res.status(500).send('Error loading page');
  }
});

// Redirect handler for links
router.get('/:slug/redirect/:linkId', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueSlug: req.params.slug });
    
    if (!user) {
      return res.status(404).send('Page not found');
    }

    // Check subscription status (consistent with rest of app)
    const now = new Date();
    const isActive = user.subscriptionActive && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now;
    
    // TEMPORARILY DISABLED for testing - uncomment after testing
    // if (!isActive) {
    //   return res.status(403).send('This page is not active. Subscription expired.');
    // }

    const link = await Link.findById(req.params.linkId);
    
    if (!link || link.userId.toString() !== user._id.toString() || !link.isActive) {
      return res.status(404).send('Link not found');
    }

    // Check if this is a UPI payment link
    const isUPILink = link.url && (
      link.url.toLowerCase().startsWith('upi://') ||
      link.url.toLowerCase().startsWith('upiqr://') ||
      link.url.toLowerCase().includes('upi://') ||
      link.url.toLowerCase().includes('pay?pa=') ||
      link.url.toLowerCase().includes('pay?pn=')
    );

    // For UPI links, return the URL directly so client-side can handle it
    // This allows mobile browsers to show the UPI app selector
    if (isUPILink) {
      // Extract UPI URL if it's embedded in a regular URL
      let upiUrl = link.url;
      
      // If it's a regular URL containing UPI parameters, extract the UPI part
      if (upiUrl.includes('upi://')) {
        const upiMatch = upiUrl.match(/upi:\/\/[^\s"']+/i);
        if (upiMatch) {
          upiUrl = upiMatch[0];
        }
      }
      
      // Return HTML page that will trigger UPI app on mobile
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Opening Payment...</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <p>Opening payment app...</p>
            <p style="color: #888; font-size: 14px;">If the app doesn't open, <a href="${upiUrl}" style="color: #4285F4;">click here</a></p>
          </div>
          <script>
            // Try to open UPI link directly
            window.location.href = "${upiUrl.replace(/"/g, '&quot;')}";
            
            // Fallback: try after a short delay
            setTimeout(function() {
              window.location.href = "${upiUrl.replace(/"/g, '&quot;')}";
            }, 500);
          </script>
        </body>
        </html>
      `);
    }

    // For regular links, redirect normally
    res.redirect(link.url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Error redirecting');
  }
});

// Generate QR code for download (on-demand, exact same as client generated)
router.get('/:slug/qr-code', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueSlug: req.params.slug });
    
    if (!user) {
      return res.status(404).send('Page not found');
    }

    const QRCode = require('qrcode');
    const baseUrl = process.env.BASE_URL || 'https://dynamicqrgen.vercel.app';
    const pageUrl = `${baseUrl}/p/${user.uniqueSlug}`;
    
    // Generate QR code (exact same as client generated)
    const qrDataUrl = await QRCode.toDataURL(pageUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Try to add business name if canvas is available (exact same as client version)
    let canvasAvailable = false;
    let createCanvas, loadImage, registerFont;
    try {
      const canvasModule = require('canvas');
      createCanvas = canvasModule.createCanvas;
      loadImage = canvasModule.loadImage;
      registerFont = canvasModule.registerFont;
      canvasAvailable = true;
      
      // Register font file for Vercel compatibility (required for text rendering)
      try {
        const fontPath = path.join(__dirname, '../fonts', 'Roboto-Regular.ttf');
        if (fs.existsSync(fontPath)) {
          registerFont(fontPath, { family: 'Roboto' });
          console.log('✅ Registered Roboto font from file');
        } else {
          console.warn('⚠️  Roboto font file not found at:', fontPath);
          console.warn('⚠️  Text rendering may show boxes on Vercel without font file');
        }
      } catch (fontError) {
        console.error('❌ Error registering font:', fontError.message);
        console.warn('⚠️  Text rendering may show boxes on Vercel');
      }
    } catch (error) {
      console.warn('Canvas not available:', error.message);
      canvasAvailable = false;
    }
    
    // Helper function to render text - use registered Roboto font or fallback
    function renderTextWithFallback(ctx, text, x, y, maxWidth) {
      const fontConfigs = [
        'bold 32px Roboto',  // Registered font (if available)
        'bold 32px',  // Canvas default (may show boxes on Vercel)
        '32px Roboto',  // Without bold
        '32px'  // Ultimate fallback
      ];
      
      for (const fontConfig of fontConfigs) {
        try {
          ctx.font = fontConfig;
          const metrics = ctx.measureText(text);
          if (metrics.width > 0 && metrics.width < maxWidth * 3) {
            return { font: fontConfig, metrics };
          }
        } catch (e) {
          continue;
        }
      }
      
      ctx.font = '32px';
      return { font: '32px', metrics: ctx.measureText(text) };
    }

    let finalQrDataUrl = qrDataUrl;
    
    // Add business name below QR code (exact same logic as client dashboard)
    console.log('Public QR Generation Debug:', {
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
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw QR code
        ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);
        
        // Draw business name below QR code with font fallback
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const textX = canvasWidth / 2;
        const textY = qrSize + padding + 15; // Slightly more spacing
        const maxWidth = qrSize - 20; // Slight margin for text
        
        // Word wrapping for long business names
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
        
        finalQrDataUrl = canvas.toDataURL('image/png');
        console.log('QR code with business name generated successfully');
      } catch (canvasError) {
        console.error('Canvas error while adding business name:', canvasError);
        // Fallback to QR code without text
        finalQrDataUrl = qrDataUrl;
      }
    } else {
      if (!canvasAvailable) {
        console.warn('Canvas not available - QR code generated without business name');
      } else if (!user.businessName || user.businessName.trim() === '') {
        console.warn('Business name not set - QR code generated without business name');
      }
    }

    // Convert base64 to buffer and send as PNG
    const base64Data = finalQrDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${user.uniqueSlug}.png"`);
    res.send(buffer);
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).send('Error generating QR code');
  }
});

module.exports = router;


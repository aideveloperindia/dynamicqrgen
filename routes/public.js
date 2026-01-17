const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');

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

// Payment page - displays bank's QR code and UPI ID
// This is for client's customers to pay the client directly
router.get('/:slug/pay', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueSlug: req.params.slug });
    
    if (!user) {
      return res.status(404).send('Page not found');
    }

    // Check if payment is configured
    const hasBankQrCode = user.bankQrCode && user.bankQrCode.trim() !== '';
    const hasUpiId = user.upiId && user.upiId.trim() !== '';
    const hasPaymentLink = user.paymentLink && user.paymentLink.trim() !== '';
    
    // Escape payment link for HTML data attribute (escape quotes and ampersands)
    const escapedPaymentLink = (user.paymentLink || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    if (!hasBankQrCode && !hasUpiId && !hasPaymentLink) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Not Configured</title>
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
              background: white;
              border-radius: 12px;
              max-width: 400px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Payment Not Configured</h2>
            <p>Please configure payment in the dashboard.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Extract clean UPI ID if it's a full URL
    let upiId = user.upiId || '';
    if (upiId.includes('pa=')) {
      const match = upiId.match(/pa=([^&]+)/i);
      if (match) {
        upiId = decodeURIComponent(match[1]);
      }
    }
    
    const businessName = user.businessName || user.name || 'Merchant';
    
    // Render payment page with bank QR code and UPI ID
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pay ${businessName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
            text-align: center;
          }
          .business-name {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
          }
          .qr-section {
            text-align: center;
            margin-bottom: 30px;
          }
          .qr-code {
            max-width: 300px;
            width: 100%;
            height: auto;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 10px;
            background: white;
            margin: 0 auto 15px;
          }
          .qr-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .download-btn {
            display: inline-block;
            padding: 10px 20px;
            background: #4285F4;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            margin-top: 10px;
            transition: background 0.3s;
          }
          .download-btn:hover {
            background: #3367d6;
          }
          .upi-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #e0e0e0;
          }
          .upi-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-align: center;
          }
          .upi-id-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
          }
          .upi-id {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            font-family: monospace;
            flex: 1;
            text-align: center;
            word-break: break-all;
          }
          .copy-btn {
            padding: 8px 16px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
            white-space: nowrap;
          }
          .copy-btn:hover {
            background: #1da851;
          }
          .copy-btn:active {
            background: #1a8f45;
          }
          .instructions {
            text-align: center;
            color: #888;
            font-size: 12px;
            margin-top: 20px;
            line-height: 1.6;
          }
          .back-link {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: #4285F4;
            text-decoration: none;
            font-size: 14px;
          }
          .back-link:hover {
            text-decoration: underline;
          }
          .no-qr-message {
            text-align: center;
            color: #666;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .payment-link-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
          }
          .payment-link-btn {
            padding: 15px 30px;
            background: #4285F4;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            width: 100%;
            max-width: 300px;
          }
          .payment-link-btn:hover {
            background: #3367d6;
          }
          .payment-link-btn:active {
            background: #2a5bc4;
          }
          .payment-link-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Pay ${businessName}</h1>
          <p class="business-name">Scan QR code or copy UPI ID to pay</p>
          
          ${hasBankQrCode ? `
            <div class="qr-section">
              <p class="qr-label">Scan this QR code to pay</p>
              <img src="${user.bankQrCode}" alt="Payment QR Code" class="qr-code" id="qrCodeImage">
              <a href="${user.bankQrCode}" download="payment-qr-code.png" class="download-btn">Download QR Code</a>
            </div>
          ` : `
            <div class="no-qr-message">
              <p>QR code not available. Please use UPI ID below to pay.</p>
            </div>
          `}
          
          ${hasUpiId ? `
            <div class="upi-section">
              <p class="upi-label">Or copy UPI ID to pay manually</p>
              <div class="upi-id-container">
                <span class="upi-id" id="upiId">${upiId}</span>
                <button class="copy-btn" onclick="copyUpiId()">Copy</button>
              </div>
            </div>
          ` : ''}
          
          ${hasPaymentLink ? `
            <div class="payment-link-section">
              <p class="payment-link-label">Or click to open payment link</p>
              <button class="payment-link-btn" id="paymentLinkBtn" data-payment-link="${escapedPaymentLink}">Click to Pay</button>
              <p style="font-size: 12px; color: #888; margin-top: 10px;">
                <a href="#" id="manualPaymentLink" style="color: #4285F4; text-decoration: none;">Click here if payment app doesn't open</a>
              </p>
            </div>
          ` : ''}
          
          <div class="instructions">
            <p><strong>How to pay:</strong></p>
            <p>1. Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
            ${hasBankQrCode ? '<p>2. Scan the QR code above</p>' : ''}
            ${hasUpiId ? '<p>2. Or copy the UPI ID manually</p>' : ''}
            ${hasPaymentLink ? '<p>2. Or click the payment link button above</p>' : ''}
            <p>3. Enter amount and complete payment</p>
          </div>
          
          <a href="/p/${user.uniqueSlug}" class="back-link">← Back to ${businessName}</a>
        </div>
        
        <script>
          function copyUpiId() {
            const upiId = document.getElementById('upiId').textContent;
            const btn = event.target;
            const originalText = btn.textContent;
            
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(upiId).then(function() {
                btn.textContent = 'Copied!';
                btn.style.background = '#4CAF50';
                setTimeout(function() {
                  btn.textContent = originalText;
                  btn.style.background = '#25D366';
                }, 2000);
              }).catch(function(err) {
                // Fallback to old method
                fallbackCopy(upiId, btn, originalText);
              });
            } else {
              // Fallback for browsers without clipboard API
              fallbackCopy(upiId, btn, originalText);
            }
          }
          
          function fallbackCopy(text, btn, originalText) {
            // Create temporary textarea
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            textarea.style.top = '-999999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            try {
              const successful = document.execCommand('copy');
              if (successful) {
                btn.textContent = 'Copied!';
                btn.style.background = '#4CAF50';
                setTimeout(function() {
                  btn.textContent = originalText;
                  btn.style.background = '#25D366';
                }, 2000);
              } else {
                // If execCommand fails, show manual copy option
                showManualCopy(text, btn, originalText);
              }
            } catch (err) {
              // If execCommand fails, show manual copy option
              showManualCopy(text, btn, originalText);
            } finally {
              document.body.removeChild(textarea);
            }
          }
          
          function showManualCopy(text, btn, originalText) {
            // Select the text in the UPI ID element
            const upiIdElement = document.getElementById('upiId');
            const range = document.createRange();
            range.selectNodeContents(upiIdElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Show message
            btn.textContent = 'Select & Copy';
            btn.style.background = '#ff9800';
            setTimeout(function() {
              btn.textContent = originalText;
              btn.style.background = '#25D366';
            }, 3000);
          }
          
          // Payment link button handler
          (function() {
            const paymentLinkBtn = document.getElementById('paymentLinkBtn');
            const manualPaymentLink = document.getElementById('manualPaymentLink');
            
            if (!paymentLinkBtn) {
              console.log('Payment link button not found');
              return;
            }
            
            const paymentLink = paymentLinkBtn.getAttribute('data-payment-link');
            console.log('Payment link from data attribute:', paymentLink);
            
            if (!paymentLink || paymentLink.trim() === '') {
              console.log('Payment link is empty');
              paymentLinkBtn.disabled = true;
              paymentLinkBtn.textContent = 'Payment Link Not Configured';
              if (manualPaymentLink) manualPaymentLink.style.display = 'none';
              return;
            }
            
            // Decode HTML entities once
            const decodedLink = paymentLink
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
            
            console.log('Decoded payment link:', decodedLink);
            
            // Function to open payment link
            function openPaymentLink() {
              console.log('Attempting to open:', decodedLink);
              
              // Try multiple methods
              try {
                // Method 1: Direct location change
                window.location.href = decodedLink;
              } catch (e) {
                console.error('Method 1 failed:', e);
                try {
                  // Method 2: Create and click link
                  const link = document.createElement('a');
                  link.href = decodedLink;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(function() {
                    document.body.removeChild(link);
                  }, 100);
                } catch (e2) {
                  console.error('Method 2 failed:', e2);
                  // Method 3: window.open
                  window.open(decodedLink, '_blank');
                }
              }
            }
            
            // Button click handler
            paymentLinkBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              // Show feedback
              this.textContent = 'Opening...';
              
              // Open immediately
              openPaymentLink();
            });
            
            // Manual link click handler
            if (manualPaymentLink) {
              manualPaymentLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openPaymentLink();
              });
              // Set the href as well for right-click "Open in new tab"
              manualPaymentLink.href = decodedLink;
            }
          })();
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Payment page error:', error);
    res.status(500).send('Error loading payment page');
  }
});

// Helper function to enhance UPI links with required parameters for Google Pay/PhonePe compatibility
function enhanceUPILink(upiUrl, user) {
  try {
    // Parse the UPI URL
    const url = new URL(upiUrl);
    const params = new URLSearchParams(url.search);
    
    // Get payee name from user data (required by Google Pay/PhonePe)
    const payeeName = user.upiPayeeName || user.businessName || user.name || 'Merchant';
    const encodedPayeeName = encodeURIComponent(payeeName);
    
    // Add pn (payee name) if missing - REQUIRED by Google Pay and PhonePe
    if (!params.has('pn')) {
      params.set('pn', encodedPayeeName);
    }
    
    // Add cu (currency) if missing - REQUIRED
    if (!params.has('cu')) {
      params.set('cu', 'INR');
    }
    
    // Add optional but recommended parameters for better compatibility
    if (!params.has('tn')) {
      params.set('tn', 'Payment');
    }
    
    if (!params.has('tr')) {
      // Generate a simple transaction reference
      params.set('tr', `TXN${Date.now()}`);
    }
    
    // Reconstruct the URL
    url.search = params.toString();
    return url.toString();
  } catch (error) {
    // If URL parsing fails, try manual enhancement
    console.warn('URL parsing failed, using manual enhancement:', error.message);
    
    let enhancedUrl = upiUrl.trim();
    const payeeName = user.upiPayeeName || user.businessName || user.name || 'Merchant';
    const encodedPayeeName = encodeURIComponent(payeeName);
    
    // Add pn if missing
    if (!enhancedUrl.includes('pn=')) {
      const separator = enhancedUrl.includes('?') ? '&' : '?';
      enhancedUrl += `${separator}pn=${encodedPayeeName}`;
    }
    
    // Add cu if missing
    if (!enhancedUrl.includes('cu=')) {
      enhancedUrl += `&cu=INR`;
    }
    
    // Add tn if missing
    if (!enhancedUrl.includes('tn=')) {
      enhancedUrl += `&tn=Payment`;
    }
    
    // Add tr if missing
    if (!enhancedUrl.includes('tr=')) {
      enhancedUrl += `&tr=TXN${Date.now()}`;
    }
    
    return enhancedUrl;
  }
}

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

    // Check if this is a UPI payment link - supports both upi://pay and upi://collect
    const isUPILink = link.url && (
      link.url.toLowerCase().startsWith('upi://') ||
      link.url.toLowerCase().startsWith('upiqr://')
    );

    // For UPI links, enhance with required parameters and open UPI app directly
    if (isUPILink) {
      // Enhance UPI link with required parameters (pn, cu, tn, tr) for Google Pay/PhonePe compatibility
      const enhancedUPIUrl = enhanceUPILink(link.url.trim(), user);
      // Use encodeURIComponent for the href attribute, but keep original for JavaScript
      const encodedForHref = encodeURI(enhancedUPIUrl);
      
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
            .open-link {
              display: inline-block;
              margin-top: 15px;
              padding: 12px 24px;
              background: #4285F4;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-size: 16px;
            }
            .open-link:hover {
              background: #3367d6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <p>Opening payment app...</p>
            <a href="${encodedForHref}" class="open-link">Click here if app doesn't open</a>
          </div>
          <script>
            (function() {
              const upiUrl = ${JSON.stringify(enhancedUPIUrl)};
              console.log('Opening enhanced UPI link:', upiUrl);
              
              // Try to open immediately
              try {
                window.location.href = upiUrl;
              } catch (e) {
                console.error('Error:', e);
                // Fallback: create and click link
                const link = document.createElement('a');
                link.href = upiUrl;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(function() {
                  document.body.removeChild(link);
                }, 100);
              }
            })();
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

// Download uploaded dynamic QR code
router.get('/:slug/download/dynamic-qr', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueSlug: req.params.slug });
    
    if (!user) {
      return res.status(404).send('Page not found');
    }

    if (!user.uploadedQrCode || user.uploadedQrCode.trim() === '') {
      return res.status(404).send('Dynamic QR code not found');
    }

    // Extract base64 data from data URL
    const base64Data = user.uploadedQrCode.split(',')[1];
    if (!base64Data) {
      return res.status(500).send('Invalid QR code format');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="dynamic-qr-${user.uniqueSlug}.png"`);
    res.send(buffer);
  } catch (error) {
    console.error('Dynamic QR download error:', error);
    res.status(500).send('Error downloading QR code');
  }
});

// Download payment QR code
router.get('/:slug/download/payment-qr', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueSlug: req.params.slug });
    
    if (!user) {
      return res.status(404).send('Page not found');
    }

    if (!user.bankQrCode || user.bankQrCode.trim() === '') {
      return res.status(404).send('Payment QR code not found');
    }

    // Extract base64 data from data URL
    const base64Data = user.bankQrCode.split(',')[1];
    if (!base64Data) {
      return res.status(500).send('Invalid QR code format');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="payment-qr-${user.uniqueSlug}.png"`);
    res.send(buffer);
  } catch (error) {
    console.error('Payment QR download error:', error);
    res.status(500).send('Error downloading QR code');
  }
});

module.exports = router;


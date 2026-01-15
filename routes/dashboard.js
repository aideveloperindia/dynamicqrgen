const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');
const multer = require('multer');
const path = require('path');

// Note: We use strict file size limits (100KB) instead of compression
// This is simpler, more reliable, and works everywhere (including Vercel)
// Users must compress images before uploading - saves storage costs

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Dashboard DB connection error:', error.message);
    // Don't crash - continue anyway, routes will handle DB errors individually
    next();
  }
});

// Configure multer with MEMORY storage (Vercel has read-only filesystem)
// Strict size limit: 100KB max (saves storage, works everywhere, no compression needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 }, // 100KB max - strict limit for cost savings
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper function to convert image to base64 data URL
// Simple approach: Multer already enforces 100KB limit, so we just convert to base64
// No compression needed - files are already small enough
async function compressAndConvertToDataUrl(buffer, mimetype) {
  try {
    // Multer already enforces 100KB limit, so file is guaranteed to be small
    // Just convert to base64 - simple, reliable, works everywhere
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Image conversion error:', error);
    throw new Error('Failed to process image. Please try again.');
  }
}

// Legacy function for backward compatibility (for custom icons)
function bufferToDataUrl(buffer, mimetype) {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

// Default categories with icons
const DEFAULT_CATEGORIES = {
  instagram: { icon: 'fab fa-instagram', name: 'Instagram', color: 'gradient' },
  facebook: { icon: 'fab fa-facebook', name: 'Facebook', color: '#1877F2' },
  whatsapp: { icon: 'fab fa-whatsapp', name: 'WhatsApp', color: '#25D366' },
  payment: { icon: 'fas fa-credit-card', name: 'Payment', color: '#25D366' },
  website: { icon: 'fas fa-globe', name: 'Website', color: '#4285F4' },
  google: { icon: 'fab fa-google', name: 'Google Reviews', color: '#EA4335' },
  menu: { icon: 'fas fa-utensils', name: 'Menu Card', color: '#FF6B6B' },
  youtube: { icon: 'fab fa-youtube', name: 'YouTube', color: '#FF0000' },
  twitter: { icon: 'fab fa-twitter', name: 'Twitter', color: '#1DA1F2' },
  linkedin: { icon: 'fab fa-linkedin', name: 'LinkedIn', color: '#0077B5' }
};

// Dashboard page
router.get('/', auth, async (req, res) => {
  try {
    // Check if req.user exists
    if (!req.user || !req.user._id) {
      console.error('Dashboard: req.user is missing or invalid');
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      return res.redirect('/login');
    }
    
    // Check if req.user is actually a User (not an Admin)
    // Admins have 'role' field, Users don't (or have 'uniqueSlug'/'businessName')
    if (req.user.role) {
      // Admin trying to access user dashboard - redirect to admin dashboard
      return res.redirect('/admin');
    }
    
    // Ensure req.user is a User document - always fetch fresh from DB to ensure it's a User
    const user = await User.findById(req.user._id);
    if (!user) {
      // User not found - might be an Admin ID or deleted user
      console.error('Dashboard: User not found for ID:', req.user._id);
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      return res.redirect('/login');
    }
    
    // Check if profile is complete - redirect to complete profile if not
    const isProfileComplete = user.businessName && user.businessName.trim() !== '' && 
                              user.phoneNumber && user.phoneNumber.trim() !== '';
    
    if (!isProfileComplete) {
      return res.redirect('/complete-profile');
    }
    
    const links = await Link.find({ userId: user._id, isActive: true }).sort({ order: 1 });
    
    res.render('dashboard', {
      user,
      links,
      defaultCategories: DEFAULT_CATEGORIES,
      baseUrl: process.env.BASE_URL || 'http://localhost:4000'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    console.error('Error stack:', error.stack);
    console.error('req.user:', req.user ? { _id: req.user._id, email: req.user.email, role: req.user.role } : 'null');
    res.status(500).send('Error loading dashboard');
  }
});

// Update business name and logo (logo is optional)
// Error handler for multer file size errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File size too large. Maximum size is 100KB. Please compress your image.' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: 'File upload error: ' + err.message 
    });
  }
  if (err) {
    return res.status(400).json({ 
      success: false, 
      message: 'File upload error: ' + err.message 
    });
  }
  next();
};

router.post('/update-profile', auth, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'bankQrCode', maxCount: 1 }, { name: 'uploadedQrCode', maxCount: 1 }]), handleMulterError, async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user._id) {
      console.error('Profile update: User not authenticated', { 
        isAuthenticated: req.isAuthenticated(),
        user: req.user 
      });
      return res.status(403).json({ success: false, message: 'Authentication required' });
    }

    const { businessName, phoneNumber, address, upiId, upiPayeeName, upiAid, paymentLink } = req.body;
    const logoFile = req.files && req.files['logo'] ? req.files['logo'][0] : null;
    const bankQrCodeFile = req.files && req.files['bankQrCode'] ? req.files['bankQrCode'][0] : null;
    const uploadedQrCodeFile = req.files && req.files['uploadedQrCode'] ? req.files['uploadedQrCode'][0] : null;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update profile fields - handle missing fields gracefully
    if (businessName !== undefined) user.businessName = businessName || '';
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber || user.phoneNumber || '';
    if (address !== undefined) user.address = address || '';
    
    // Handle UPI ID - extract aid parameter if present in full URL
    if (upiId !== undefined) {
      let extractedUpiId = upiId || '';
      let extractedAid = '';
      
      // First, check if the original UPI ID contains an aid parameter
      const aidMatch = upiId.match(/[&?]aid=([^&]+)/i);
      if (aidMatch) {
        extractedAid = decodeURIComponent(aidMatch[1]);
      }
      
      // If UPI ID is a full URL, extract the UPI ID from pa= parameter
      if (extractedUpiId.includes('pa=')) {
        const paMatch = extractedUpiId.match(/pa=([^&]+)/i);
        if (paMatch) {
          extractedUpiId = decodeURIComponent(paMatch[1]);
        }
      } else if (extractedAid) {
        // If we found aid but UPI ID is not a full URL, try to clean it up
        // Remove aid and any other URL parameters from the UPI ID
        extractedUpiId = extractedUpiId.replace(/[&?]aid=[^&]*/i, '').replace(/[&?].*/, '').trim();
      }
      
      user.upiId = extractedUpiId;
      
      // If aid was extracted from UPI ID, save it (unless upiAid was explicitly provided)
      if (extractedAid && (!upiAid || upiAid === '')) {
        user.upiAid = extractedAid;
      }
    }
    
    if (upiPayeeName !== undefined) user.upiPayeeName = upiPayeeName || '';
    if (upiAid !== undefined) user.upiAid = upiAid || '';
    if (paymentLink !== undefined) user.paymentLink = paymentLink || '';
    
    // Store logo as base64 data URL in MongoDB
    // Multer already enforces 100KB limit, so file is guaranteed to be small
    if (logoFile) {
      try {
        // Check file size before processing
        if (logoFile.size > 100 * 1024) {
          console.warn('Logo file size exceeds limit:', logoFile.size);
          return res.status(400).json({ 
            success: false, 
            message: 'Logo file is too large. Maximum size is 100KB. Please compress your image.' 
          });
        }
        user.logo = await compressAndConvertToDataUrl(logoFile.buffer, logoFile.mimetype);
      } catch (logoError) {
        console.error('Logo processing error:', logoError);
        return res.status(400).json({ 
          success: false, 
          message: 'Error processing logo: ' + (logoError.message || 'Unknown error') 
        });
      }
    }
    
    // Store bank QR code as base64 data URL in MongoDB
    if (bankQrCodeFile) {
      try {
        // Check file size before processing
        if (bankQrCodeFile.size > 100 * 1024) {
          console.warn('Bank QR code file size exceeds limit:', bankQrCodeFile.size);
          return res.status(400).json({ 
            success: false, 
            message: 'QR code file is too large. Maximum size is 100KB. Please compress your image.' 
          });
        }
        user.bankQrCode = await compressAndConvertToDataUrl(bankQrCodeFile.buffer, bankQrCodeFile.mimetype);
      } catch (qrError) {
        console.error('Bank QR code processing error:', qrError);
        return res.status(400).json({ 
          success: false, 
          message: 'Error processing QR code: ' + (qrError.message || 'Unknown error') 
        });
      }
    }
    
    // Store uploaded dynamic QR code as base64 data URL in MongoDB
    if (uploadedQrCodeFile) {
      try {
        // Check file size before processing
        if (uploadedQrCodeFile.size > 100 * 1024) {
          console.warn('Dynamic QR code file size exceeds limit:', uploadedQrCodeFile.size);
          return res.status(400).json({ 
            success: false, 
            message: 'QR code file is too large. Maximum size is 100KB. Please compress your image.' 
          });
        }
        user.uploadedQrCode = await compressAndConvertToDataUrl(uploadedQrCodeFile.buffer, uploadedQrCodeFile.mimetype);
      } catch (qrError) {
        console.error('Dynamic QR code processing error:', qrError);
        return res.status(400).json({ 
          success: false, 
          message: 'Error processing QR code: ' + (qrError.message || 'Unknown error') 
        });
      }
    }
    
    try {
    await user.save();
    res.json({ success: true, message: 'Profile updated successfully' });
    } catch (saveError) {
      console.error('User save error:', saveError);
      console.error('Save error stack:', saveError.stack);
      // Always return JSON - this fixes the JSON parsing error
      return res.status(500).json({ 
        success: false, 
        message: 'Error saving profile: ' + (saveError.message || 'Unknown error') 
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    if (error.name === 'MulterError') {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'File size too large. Maximum size is 100KB. Please compress your images.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'File upload error: ' + error.message 
      });
    }
    
    // Always return JSON, never HTML - this fixes the JSON parsing error
    return res.status(500).json({ 
      success: false, 
      message: 'Error updating profile: ' + (error.message || 'Unknown error') 
    });
  }
});

// Add or update a link
router.post('/link', auth, upload.single('customIcon'), async (req, res) => {
  try {
    let { category, url, displayName, categoryType, linkId, order } = req.body;
    
    if (!url || !displayName) {
      return res.status(400).json({ success: false, message: 'URL and display name are required' });
    }
    
    // Save URL as-is - no complex formatting
    url = url.trim();

    let icon = '';
    if (categoryType === 'custom') {
      if (req.file) {
        // Store custom icon as base64 data URL
        // Multer already enforces 100KB limit, so just convert
        icon = bufferToDataUrl(req.file.buffer, req.file.mimetype);
      } else if (linkId) {
        // If updating and no new file, keep existing icon
        const existingLink = await Link.findById(linkId);
        if (existingLink) {
          icon = existingLink.icon;
        } else {
          return res.status(400).json({ success: false, message: 'Custom category requires icon upload' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Custom category requires icon upload' });
      }
    } else if (categoryType === 'default' && DEFAULT_CATEGORIES[category]) {
      icon = DEFAULT_CATEGORIES[category].icon;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid category or icon' });
    }

    if (linkId) {
      // Update existing link
      const link = await Link.findById(linkId);
      if (link && link.userId.toString() === req.user._id.toString()) {
        link.url = url;
        link.displayName = displayName;
        link.icon = icon;
        link.order = parseInt(order) || 0;
        await link.save();
        return res.json({ success: true, message: 'Link updated successfully', link });
      }
      return res.status(404).json({ success: false, message: 'Link not found' });
    } else {
      // Create new link
      const link = new Link({
        userId: req.user._id,
        category: category || 'custom',
        categoryType: categoryType || 'default',
        url,
        icon,
        displayName,
        order: parseInt(order) || 0
      });
      await link.save();
      return res.json({ success: true, message: 'Link added successfully', link });
    }
  } catch (error) {
    console.error('Link save error:', error);
    res.status(500).json({ success: false, message: 'Error saving link: ' + error.message });
  }
});

// Delete a link (soft delete - sets isActive to false)
router.delete('/link/:id', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (link && link.userId.toString() === req.user._id.toString()) {
      // Soft delete: set isActive to false (preserves data for analytics)
      link.isActive = false;
      await link.save();
      return res.json({ success: true, message: 'Link deleted successfully' });
    }
    return res.status(404).json({ success: false, message: 'Link not found' });
  } catch (error) {
    console.error('Link delete error:', error);
    res.status(500).json({ success: false, message: 'Error deleting link' });
  }
});

// Get user's public page data
router.get('/preview', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const links = await Link.find({ userId: req.user._id, isActive: true }).sort({ order: 1 });
    
    res.json({ user, links });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ success: false, message: 'Error loading preview' });
  }
});

module.exports = router;


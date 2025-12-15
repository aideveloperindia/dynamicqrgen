const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    await connectDB();
  }
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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
    const user = await User.findById(req.user._id);
    const links = await Link.find({ userId: req.user._id, isActive: true }).sort({ order: 1 });
    
    res.render('dashboard', {
      user,
      links,
      defaultCategories: DEFAULT_CATEGORIES,
      baseUrl: process.env.BASE_URL || 'http://localhost:4000'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// Update business name and logo
router.post('/update-profile', auth, upload.single('logo'), async (req, res) => {
  try {
    const { businessName } = req.body;
    const user = await User.findById(req.user._id);
    
    user.businessName = businessName || '';
    
    if (req.file) {
      user.logo = '/uploads/' + req.file.filename;
    }
    
    await user.save();
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Add or update a link
router.post('/link', auth, upload.single('customIcon'), async (req, res) => {
  try {
    const { category, url, displayName, categoryType, linkId, order } = req.body;
    
    if (!url || !displayName) {
      return res.status(400).json({ success: false, message: 'URL and display name are required' });
    }

    let icon = '';
    if (categoryType === 'custom') {
      if (req.file) {
        icon = '/uploads/' + req.file.filename;
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
    res.status(500).json({ success: false, message: 'Error saving link' });
  }
});

// Delete a link
router.delete('/link/:id', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (link && link.userId.toString() === req.user._id.toString()) {
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


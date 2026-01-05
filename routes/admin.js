const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Admin authentication middleware - Auto-login if not authenticated
const adminAuth = async (req, res, next) => {
  try {
    await connectDB();
    
    // Check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      // Auto-login for admin
      let admin = await Admin.findOne({ email: 'admin@qrconnect.com' });
      if (!admin) {
        admin = new Admin({
          email: 'admin@qrconnect.com',
          password: 'admin123',
          name: 'Admin',
          role: 'super_admin'
        });
        await admin.save();
      }
      
      req.login(admin, (err) => {
        if (err) {
          return res.redirect('/admin/login');
        }
        req.admin = admin;
        return next();
      });
      return;
    }

    // Check if user is admin
    let admin = await Admin.findById(req.user._id || req.user);
    if (!admin) {
      // Try to auto-login
      admin = await Admin.findOne({ email: 'admin@qrconnect.com' });
      if (admin) {
        req.login(admin, (err) => {
          if (err) {
            return res.redirect('/admin/login');
          }
          req.admin = admin;
          return next();
        });
        return;
      }
      
      if (req.accepts('html')) {
        return res.redirect('/admin/login');
      }
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    if (req.accepts('html')) {
      return res.redirect('/admin/login');
    }
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

// Ensure DB connection
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Admin route DB error:', error.message);
    // Don't crash - continue anyway, routes will handle DB errors individually
    next();
  }
});

// Admin login page - AUTO LOGIN (no password required)
router.get('/login', async (req, res) => {
  try {
    await connectDB();
    
    // Check if already logged in as admin
    if (req.isAuthenticated && req.isAuthenticated()) {
      const admin = await Admin.findById(req.user._id || req.user);
      if (admin) {
        return res.redirect('/admin');
      }
    }

    // Auto-create admin session (no password required)
    // Find or create a default admin
    let admin = await Admin.findOne({ email: 'admin@qrconnect.com' });
    
    if (!admin) {
      // Create default admin if doesn't exist
      admin = new Admin({
        email: 'admin@qrconnect.com',
        password: 'admin123', // Will be hashed
        name: 'Admin',
        role: 'super_admin'
      });
      await admin.save();
    }

    // Auto-login
    req.login(admin, (err) => {
      if (err) {
        console.error('Auto login error:', err);
        return res.redirect('/admin');
      }
      res.redirect('/admin');
    });
  } catch (error) {
    console.error('Admin auto-login error:', error);
    res.redirect('/admin');
  }
});

// Admin login (kept for compatibility, but auto-login is used)
router.post('/login', async (req, res) => {
  // Redirect to auto-login
  res.redirect('/admin/login');
});

// Admin dashboard page
router.get('/', adminAuth, async (req, res) => {
  try {
    res.render('admin-dashboard');
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).send('Error loading admin dashboard');
  }
});

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalClients = await User.countDocuments();
    const activeSubscriptions = await User.countDocuments({ 
      subscriptionActive: true,
      subscriptionEndDate: { $gt: new Date() }
    });
    const totalLinks = await Link.countDocuments({ isActive: true });
    const totalQRCodes = await User.countDocuments({ qrCode: { $ne: '' } });
    
    // Revenue stats
    const activeUsers = await User.find({ 
      subscriptionActive: true,
      subscriptionEndDate: { $gt: new Date() }
    });
    const totalRevenue = activeUsers.reduce((sum, user) => sum + (user.subscriptionAmount || 0), 0);

    // Recent clients (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentClients = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      stats: {
        totalClients,
        activeSubscriptions,
        totalLinks,
        totalQRCodes,
        totalRevenue,
        recentClients
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
});

// Get all clients with pagination
router.get('/clients', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const clients = await User.find()
      .select('-password -qrCode') // Exclude large fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin clients error:', error);
    res.status(500).json({ success: false, message: 'Error fetching clients' });
  }
});

// Get client details
router.get('/clients/:id', adminAuth, async (req, res) => {
  try {
    const client = await User.findById(req.params.id).select('-password');
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const links = await Link.find({ userId: client._id, isActive: true }).sort({ order: 1 });

    res.json({
      success: true,
      client,
      links
    });
  } catch (error) {
    console.error('Admin client details error:', error);
    res.status(500).json({ success: false, message: 'Error fetching client details' });
  }
});

module.exports = router;


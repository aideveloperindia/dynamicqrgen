const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    await connectDB();
    
    // Check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      // For HTML requests, redirect to login
      if (req.accepts('html')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if user is admin
    const admin = await Admin.findById(req.user._id || req.user);
    if (!admin) {
      // For HTML requests, redirect to login
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
    console.error('Admin route DB error:', error);
    next(error);
  }
});

// Admin login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Check if already admin
    Admin.findById(req.user._id || req.user).then(admin => {
      if (admin) {
        return res.redirect('/admin');
      }
      res.render('admin-login');
    }).catch(() => {
      res.render('admin-login');
    });
  } else {
    res.render('admin-login');
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    req.login(admin, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Login failed' });
      }
      res.json({ success: true, message: 'Admin login successful', admin: { email: admin.email, name: admin.name } });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
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


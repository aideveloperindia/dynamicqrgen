const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');
const Admin = require('../models/Admin');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcryptjs');

// Admin authentication middleware - Requires password authentication
const adminAuth = async (req, res, next) => {
  try {
    await connectDB();
    
    // Check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (req.accepts('html')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if user is admin
    let admin = await Admin.findById(req.user._id || req.user);
    if (!admin) {
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

// Admin login page
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

    // Ensure admin exists with password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || '0DynamicQR@#';
    // Need to explicitly select password field (it's select: false by default)
    let admin = await Admin.findOne({ email: 'admin@qrconnect.com' }).select('+password');
    
    if (!admin) {
      // Create default admin with password from env
      admin = new Admin({
        email: 'admin@qrconnect.com',
        password: adminPassword, // Will be hashed by pre-save hook
        name: 'Admin',
        role: 'super_admin'
      });
      await admin.save();
    } else {
      // Update password if env variable is set and different
      if (process.env.ADMIN_PASSWORD) {
        try {
          const isMatch = await admin.comparePassword(adminPassword);
          if (!isMatch) {
            // Password changed in env, update it
            admin.password = adminPassword;
            await admin.save();
          }
        } catch (compareError) {
          // If compare fails (e.g., password field missing), update password
          console.warn('Password compare failed, updating password:', compareError.message);
          admin.password = adminPassword;
          await admin.save();
        }
      }
    }

    res.render('admin-login');
  } catch (error) {
    console.error('Admin login page error:', error);
    res.status(500).send('Error loading login page');
  }
});

// Admin login POST - Password authentication
router.post('/login', async (req, res) => {
  try {
    await connectDB();
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.json({ success: false, message: 'Email and password required' });
    }

    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || '0DynamicQR@#';
    
    // Find admin - need to explicitly select password field
    let admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!admin) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password - check against env variable or stored password
    let isMatch = false;
    try {
      isMatch = await admin.comparePassword(password);
    } catch (compareError) {
      console.warn('Password compare error:', compareError.message);
    }
    const envPasswordMatch = password === adminPassword;
    
    if (!isMatch && !envPasswordMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Update password if env variable is set and different
    if (process.env.ADMIN_PASSWORD && !isMatch && envPasswordMatch) {
      admin.password = adminPassword;
      await admin.save();
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Login admin
    req.login(admin, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.json({ success: false, message: 'Login failed' });
      }
      return res.json({ success: true, message: 'Login successful' });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.json({ success: false, message: 'Login error' });
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

    // Feedback statistics (aggregate across all clients)
    const veryUsefulCount = await Feedback.countDocuments({ feedbackType: 'very_useful' });
    const goodIdeaCount = await Feedback.countDocuments({ feedbackType: 'good_idea' });
    const notUsefulCount = await Feedback.countDocuments({ feedbackType: 'not_useful' });
    const totalFeedback = veryUsefulCount + goodIdeaCount + notUsefulCount;

    res.json({
      success: true,
      stats: {
        totalClients,
        activeSubscriptions,
        totalLinks,
        totalQRCodes,
        totalRevenue,
        recentClients,
        feedback: {
          veryUseful: veryUsefulCount,
          goodIdea: goodIdeaCount,
          notUseful: notUsefulCount,
          total: totalFeedback
        }
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

    // Get feedback stats for each client
    const clientsWithFeedback = await Promise.all(
      clients.map(async (client) => {
        const veryUseful = await Feedback.countDocuments({ userId: client._id, feedbackType: 'very_useful' });
        const goodIdea = await Feedback.countDocuments({ userId: client._id, feedbackType: 'good_idea' });
        const notUseful = await Feedback.countDocuments({ userId: client._id, feedbackType: 'not_useful' });
        const totalFeedback = veryUseful + goodIdea + notUseful;

        return {
          ...client.toObject(),
          feedback: {
            veryUseful,
            goodIdea,
            notUseful,
            total: totalFeedback
          }
        };
      })
    );

    res.json({
      success: true,
      clients: clientsWithFeedback,
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

// Get client details - API endpoint (for JSON requests)
router.get('/clients/:id/api', adminAuth, async (req, res) => {
  try {
    const client = await User.findById(req.params.id).select('-password');
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const links = await Link.find({ userId: client._id, isActive: true }).sort({ order: 1 });

    // Get feedback statistics for this client
    const veryUseful = await Feedback.countDocuments({ userId: client._id, feedbackType: 'very_useful' });
    const goodIdea = await Feedback.countDocuments({ userId: client._id, feedbackType: 'good_idea' });
    const notUseful = await Feedback.countDocuments({ userId: client._id, feedbackType: 'not_useful' });
    const totalFeedback = veryUseful + goodIdea + notUseful;

    res.json({
      success: true,
      client,
      links,
      feedback: {
        veryUseful,
        goodIdea,
        notUseful,
        total: totalFeedback
      }
    });
  } catch (error) {
    console.error('Admin client details error:', error);
    res.status(500).json({ success: false, message: 'Error fetching client details' });
  }
});

// Get client details - Page view (for HTML requests)
router.get('/clients/:id', adminAuth, async (req, res) => {
  try {
    // If it's an API request (JSON), return JSON
    if (req.headers.accept && req.headers.accept.includes('application/json') || req.query.format === 'json') {
      const client = await User.findById(req.params.id).select('-password');
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }

      const links = await Link.find({ userId: client._id, isActive: true }).sort({ order: 1 });

      return res.json({
        success: true,
        client,
        links
      });
    }

    // Otherwise, render the client detail page (it will fetch data via JavaScript)
    res.render('admin-client-detail');
  } catch (error) {
    console.error('Admin client details error:', error);
    res.status(500).send('Error loading client details');
  }
});

// Activate client account
router.post('/clients/:id/activate', adminAuth, async (req, res) => {
  try {
    const client = await User.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Only activate if payment is completed
    if (!client.paymentCompleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot activate account. Payment not completed.' 
      });
    }

    client.accountActivated = true;
    await client.save();

    res.json({ 
      success: true, 
      message: 'Account activated successfully' 
    });
  } catch (error) {
    console.error('Account activation error:', error);
    res.status(500).json({ success: false, message: 'Error activating account' });
  }
});

module.exports = router;


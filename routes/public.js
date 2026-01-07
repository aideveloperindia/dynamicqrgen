const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const User = require('../models/User');
const Link = require('../models/Link');

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

    // Get QR code if available
    const qrCode = user.qrCode || null;

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

    res.redirect(link.url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Error redirecting');
  }
});

module.exports = router;


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
    console.error('Public route DB error:', error);
    next(error);
  }
});

// Public page for user's QR code
router.get('/:slug', async (req, res) => {
  try {
    const user = await User.findOne({ uniqueSlug: req.params.slug });
    
    if (!user) {
      return res.status(404).send('Page not found');
    }

    if (!user.paymentCompleted) {
      return res.status(403).send('This page is not active yet. Payment pending.');
    }

    const links = await Link.find({ 
      userId: user._id, 
      isActive: true 
    }).sort({ order: 1 });

    res.render('public-page', {
      user,
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
    
    if (!user || !user.paymentCompleted) {
      return res.status(404).send('Page not found');
    }

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


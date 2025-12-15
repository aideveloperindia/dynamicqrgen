const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const passport = require('passport');

// Ensure DB connection for serverless
router.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    await connectDB();
  }
  next();
});

// Google OAuth login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
  async (req, res, next) => {
    // Ensure DB connection before authentication
    if (process.env.VERCEL) {
      try {
        await connectDB();
      } catch (error) {
        console.error('DB connection error in callback:', error);
      }
    }
    next();
  },
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  async (req, res) => {
    try {
      // User is authenticated at this point
      // Save session explicitly
      req.session.userId = req.user._id.toString();
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect('/login?error=session_error');
        }
        // Redirect to dashboard
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/login?error=callback_error');
    }
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

module.exports = router;


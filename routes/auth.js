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
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  (req, res) => {
    // Ensure session is saved before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/login?error=session_error');
      }
      res.redirect('/dashboard');
    });
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


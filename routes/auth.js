const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const passport = require('passport');

// Ensure DB connection for all auth routes
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Auth route DB error:', error);
    next(error);
  }
});

// Google OAuth login
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Google OAuth callback with explicit error handling
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    console.log('Passport authenticate callback:', { err: err?.message, user: user?.email, info });
    
    if (err) {
      console.error('Passport auth error:', err);
      return res.redirect('/login?error=auth_error&msg=' + encodeURIComponent(err.message));
    }
    
    if (!user) {
      console.error('No user returned from Google:', info);
      return res.redirect('/login?error=no_user');
    }
    
    // Log in the user
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.redirect('/login?error=login_error&msg=' + encodeURIComponent(loginErr.message));
      }
      
      console.log('User logged in:', user.email);
      
      // Save session and redirect
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.redirect('/login?error=save_error');
        }
        
        console.log('Session saved, redirecting to dashboard');
        res.redirect('/dashboard');
      });
    });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destroy error:', destroyErr);
      }
      res.clearCookie('qr.sid');
      res.redirect('/');
    });
  });
});

module.exports = router;


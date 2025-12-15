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

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login?error=auth_failed',
    failureMessage: true
  }),
  (req, res) => {
    // User is authenticated - passport has set req.user
    console.log('OAuth success, user:', req.user?.email);
    
    // Regenerate session to prevent fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.redirect('/login?error=session_error');
      }
      
      // Re-establish passport login after regeneration
      req.login(req.user, (loginErr) => {
        if (loginErr) {
          console.error('Login error after regenerate:', loginErr);
          return res.redirect('/login?error=login_error');
        }
        
        // Save session explicitly
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.redirect('/login?error=save_error');
          }
          
          console.log('Session saved, redirecting to dashboard');
          res.redirect('/dashboard');
        });
      });
    });
  }
);

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


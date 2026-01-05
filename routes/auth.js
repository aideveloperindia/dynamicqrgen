const express = require('express');
const router = express.Router();
const connectDB = require('../config/database');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Ensure DB connection for all auth routes
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Auth route DB error:', error.message);
    // Don't crash - continue anyway, routes will handle DB errors individually
    next();
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

// Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate unique slug
    const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!baseSlug || baseSlug.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email format for slug generation' });
    }

    let uniqueSlug = baseSlug;
    let counter = 1;
    
    while (await User.findOne({ uniqueSlug })) {
      uniqueSlug = `${baseSlug}${counter}`;
      counter++;
      // Prevent infinite loop
      if (counter > 1000) {
        return res.status(500).json({ success: false, message: 'Unable to generate unique identifier. Please try again.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      uniqueSlug,
      lastLogin: new Date()
    });

    await user.save();

    // Auto login with proper session handling
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login after registration error:', loginErr);
        // User created but login failed - still return success but ask to login
        return res.status(500).json({ 
          success: false, 
          message: 'Account created but auto-login failed. Please login manually.' 
        });
      }

      // Save session explicitly for serverless environments
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save after registration error:', saveErr);
          return res.status(500).json({ 
            success: false, 
            message: 'Account created but session failed. Please login manually.' 
          });
        }

        res.json({ 
          success: true, 
          message: 'Registration successful', 
          user: { email: user.email, name: user.name } 
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field === 'email' ? 'Email' : 'Username'} already exists` 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user has password (might be Google-only account)
    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Please login with Google or set a password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Login user with proper session handling
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
      }

      // Save session explicitly for serverless environments
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
        }

        res.json({ success: true, message: 'Login successful', user: { email: user.email, name: user.name } });
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
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


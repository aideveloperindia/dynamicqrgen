require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Determine if we're in production (Vercel sets this)
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

// Trust proxy - REQUIRED for Vercel (behind proxy)
app.set('trust proxy', 1);

// Connect to MongoDB (lazy connection for serverless)
// Don't block serverless function startup
if (!process.env.VERCEL) {
  connectDB();
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with MongoDB store (required for serverless)
let sessionStore = null;
try {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  WARNING: MONGODB_URI not set. Sessions will not persist.');
  } else {
    try {
      sessionStore = MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600,
        ttl: 24 * 60 * 60,
        autoRemove: 'native'
      });
      
      sessionStore.on('error', function(error) {
        console.error('❌ Session store error:', error.message);
        console.error('   Session store will use memory fallback');
        // Don't crash - continue without session store
        sessionStore = null;
      });
      
      sessionStore.on('connect', function() {
        console.log('✅ Session store connected to MongoDB');
      });
      
      console.log('✅ Session store initialized');
    } catch (storeError) {
      console.error('Failed to create session store:', storeError.message);
      sessionStore = null;
      // Continue without session store (will use memory store as fallback)
    }
  }
} catch (err) {
  console.error('Session store setup error:', err.message);
  sessionStore = null;
  // Continue without session store (will use memory store as fallback)
}

// Session configuration - use store if available, otherwise memory store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: sessionStore || undefined, // Use MongoDB store if available, otherwise memory store
  proxy: true,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  },
  name: 'qr.sid'
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Async error wrapper helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Set Content Security Policy headers to allow favicon and images
app.use((req, res, next) => {
  // Only set CSP if not already set (Vercel might set it)
  if (!res.getHeader('Content-Security-Policy')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "img-src 'self' data: https: blob:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://checkout.razorpay.com https://api.razorpay.com https://checkout-static-next.razorpay.com; " +
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://checkout-static-next.razorpay.com; " +
      "font-src 'self' https://cdnjs.cloudflare.com data:; " +
      "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com; " +
      "frame-src https://api.razorpay.com https://checkout.razorpay.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "frame-ancestors 'none';"
    );
  }
  next();
});

// Serve static files - MUST be before routes for Vercel
const publicPath = path.join(__dirname, 'public');
const fs = require('fs');

// Favicon route - serve the logo as favicon
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(publicPath, 'images', 'qrconnect logo.png');
  if (fs.existsSync(faviconPath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(faviconPath);
  } else {
    res.status(404).end();
  }
});

// Explicit image serving for Vercel compatibility
app.use('/images', (req, res, next) => {
  const filePath = path.join(publicPath, 'images', req.path);
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    
    // Set proper content-type
    if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.jpeg' || ext === '.jpg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(filePath);
  } else {
    next();
  }
});

// Serve other static files
app.use(express.static(publicPath, {
  maxAge: '1y',
  immutable: true
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payment');
const qrRoutes = require('./routes/qr');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/payment', paymentRoutes);
app.use('/qr', qrRoutes);
app.use('/p', publicRoutes);
app.use('/admin', adminRoutes);

// Health check route (no DB needed)
// Health check endpoint with MongoDB diagnostics
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'local',
    mongodb: {
      uri_set: !!process.env.MONGODB_URI,
      uri_preview: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@') : 'not set',
      connected: false,
      error: null
    }
  };

  // Test MongoDB connection
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      health.mongodb.connected = mongoose.connection.readyState === 1;
      if (health.mongodb.connected) {
        health.mongodb.host = mongoose.connection.host;
        health.mongodb.database = mongoose.connection.name;
      }
    } catch (error) {
      health.mongodb.error = error.message;
      health.status = 'degraded';
    }
  } else {
    health.status = 'degraded';
    health.mongodb.error = 'MONGODB_URI not set in environment variables';
  }

  res.json(health);
});

// Home route - show landing page or redirect to dashboard
app.get('/', async (req, res) => {
  try {
    // Ensure DB connection for serverless (but don't fail if it doesn't work)
    if (process.env.VERCEL) {
      try {
        await connectDB();
      } catch (dbError) {
        console.error('DB connection error in home route:', dbError.message);
        // Continue anyway - landing page doesn't need DB
      }
    }
    
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard');
    }
    res.render('landing');
  } catch (error) {
    console.error('Home route error:', error);
    // Always render landing page even on error
    try {
      res.render('landing');
    } catch (renderError) {
      res.status(500).send('Error loading page. Please try again.');
    }
  }
});

// Login route
app.get('/login', async (req, res) => {
  try {
    // Ensure DB connection for serverless (but don't fail if it doesn't work)
    if (process.env.VERCEL) {
      try {
        await connectDB();
      } catch (dbError) {
        console.error('DB connection error in login route:', dbError.message);
        // Continue anyway - login page doesn't need DB initially
      }
    }
    
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard');
    }
    res.render('login');
  } catch (error) {
    console.error('Login route error:', error);
    // Always render login page even on error
    try {
      res.render('login');
    } catch (renderError) {
      res.status(500).send('Error loading login page. Please try again.');
    }
  }
});

// Legacy routes for backward compatibility (old static page)
const LINKS = {
  instagram: 'https://www.instagram.com/adx_transit?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  payment: 'upi://pay?pa=starjay@ybl&pn=ADX%20Transit&am=0&cu=INR',
  whatsapp: 'https://wa.me/919912941214',
  website: 'https://www.adxtransit.com/',
  google: 'https://share.google/29IalFzkiMoJRpQlj'
};

app.get('/legacy', (req, res) => {
  res.render('index', { links: LINKS });
});

app.get('/instagram', (req, res) => {
  res.redirect(LINKS.instagram);
});

app.get('/payment', (req, res) => {
  res.redirect(LINKS.payment);
});

app.get('/whatsapp', (req, res) => {
  res.redirect(LINKS.whatsapp);
});

app.get('/website', (req, res) => {
  res.redirect(LINKS.website);
});

app.get('/google', (req, res) => {
  res.redirect(LINKS.google);
});

// Global error handler middleware (must be last)
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  console.error('Stack:', err.stack);
  
  // If response already sent, delegate to default handler
  if (res.headersSent) {
    return next(err);
  }
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : (err.message || 'An unexpected error occurred');
  
  // Return JSON for API requests
  if (req.xhr || req.headers['content-type']?.includes('application/json') || req.path.startsWith('/api/')) {
    return res.status(500).json({ 
      success: false, 
      message: message,
      error: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  }
  
  // Try to render error page, but fallback to plain text if that fails
  try {
    res.status(500).render('error', { 
      error: message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  } catch (renderError) {
    console.error('Failed to render error page:', renderError);
    // Fallback to plain text response
    res.status(500).send(`<html><body style="font-family: Arial; padding: 40px; text-align: center; background: #000; color: #fff;"><h1>Something Went Wrong</h1><p>${message}</p><a href="/" style="color: #4CAF50;">Go Home</a></body></html>`);
  }
});

// 404 handler (must be after all routes)
app.use((req, res) => {
  // Return JSON for API requests
  if (req.xhr || req.headers['content-type']?.includes('application/json') || req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: 'Route not found' 
    });
  }
  
  res.status(404).send('Page not found');
});

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
// Trigger redeploy Mon Dec 15 15:22:46 IST 2025

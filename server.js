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

// Connect to MongoDB (lazy connection for serverless)
// Don't block serverless function startup
if (!process.env.VERCEL) {
  connectDB();
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with MongoDB store (required for serverless)
// Initialize store with error handling
let sessionStore;
try {
  sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600,
    ttl: 24 * 60 * 60,
    autoRemove: 'native'
  });
} catch (error) {
  console.error('Session store creation error:', error);
  // Fallback to memory store if MongoDB fails
  sessionStore = undefined;
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  },
  name: 'sessionId'
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files - MUST be before routes for Vercel
const publicPath = path.join(__dirname, 'public');

// Serve static files with proper headers
app.use(express.static(publicPath, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.jpeg' || ext === '.jpg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
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

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/payment', paymentRoutes);
app.use('/qr', qrRoutes);
app.use('/p', publicRoutes);

// Home route - redirect to login or dashboard
app.get('/', async (req, res) => {
  try {
    // Ensure DB connection for serverless
    if (process.env.VERCEL) {
      await connectDB();
    }
    
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard');
    }
    res.render('login');
  } catch (error) {
    console.error('Home route error:', error);
    res.render('login');
  }
});

// Login route
app.get('/login', async (req, res) => {
  try {
    // Ensure DB connection for serverless
    if (process.env.VERCEL) {
      await connectDB();
    }
    
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard');
    }
    res.render('login');
  } catch (error) {
    console.error('Login route error:', error);
    res.render('login');
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

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;

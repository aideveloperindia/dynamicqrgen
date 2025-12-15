require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
const publicPath = path.join(__dirname, 'public');
const fs = require('fs');

// Serve uploads
app.use('/uploads', express.static(path.join(publicPath, 'uploads'), {
  maxAge: '1y',
  immutable: true
}));

// Serve images with explicit file reading for Vercel compatibility
app.use('/images', (req, res, next) => {
  const filePath = path.join(publicPath, 'images', req.path);
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.jpeg' || ext === '.jpg') {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(filePath);
  } else {
    next();
  }
});

app.use('/qr', express.static(path.join(publicPath, 'qr'), {
  maxAge: '1y',
  immutable: true
}));

// General static files fallback
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

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/payment', paymentRoutes);
app.use('/qr', qrRoutes);
app.use('/p', publicRoutes);

// Home route - redirect to login or dashboard
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
});

// Login route
app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
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

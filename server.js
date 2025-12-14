const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files - MUST be before routes
// CRITICAL: In Vercel, static files in public/ are auto-served, but Express handles them as fallback
const publicPath = path.join(__dirname, 'public');
const fs = require('fs');

// Serve images with explicit file reading for Vercel compatibility
app.use('/images', (req, res, next) => {
  const filePath = path.join(publicPath, 'images', req.path);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    
    // Set proper content-type
    if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.jpeg' || ext === '.jpg') {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Send file
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

// Debug route to check if files exist
app.get('/debug/images', (req, res) => {
  const fs = require('fs');
  const imagesPath = path.join(__dirname, 'public/images');
  try {
    const files = fs.readdirSync(imagesPath);
    res.json({ files, path: imagesPath });
  } catch (error) {
    res.json({ error: error.message, path: imagesPath });
  }
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Links configuration
const LINKS = {
  instagram: 'https://www.instagram.com/adx_transit?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  payment: 'upi://pay?pa=starjay@ybl&pn=ADX%20Transit&am=0&cu=INR',
  whatsapp: 'https://wa.me/919912941214',
  website: 'https://www.adxtransit.com/',
  google: 'https://share.google/29IalFzkiMoJRpQlj'
};

// Main route - shows the icons page
app.get('/', (req, res) => {
  res.render('index', { links: LINKS });
});

// Redirect routes for each icon
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

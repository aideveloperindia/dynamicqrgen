const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files - MUST be before routes
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/qr', express.static(path.join(__dirname, 'public/qr')));
app.use(express.static('public'));

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


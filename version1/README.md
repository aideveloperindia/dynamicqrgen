# Dynamic QR Code Website

A simple, clean website that displays 5 action icons when a QR code is scanned.

## Features

- **Single QR Code** - One QR code that opens the website
- **5 Action Icons**:
  - 📷 Instagram
  - 💳 Payment (UPI)
  - 💬 WhatsApp
  - 🌐 Website
  - 📍 Google Business

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Generate QR code:
```bash
npm run generate-qr
```

## Configuration

All links are configured in `server.js`:
- Instagram: `https://www.instagram.com/adx_transit...`
- Payment UPI: `starjay@ybl`
- WhatsApp: `https://wa.me/919912941214`
- Website: `https://www.adxtransit.com/`
- Google Business: `https://share.google/29IalFzkiMoJRpQlj`

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect to Vercel
3. Update `BASE_URL` in `scripts/generateQR.js` with your Vercel URL
4. Regenerate QR code: `npm run generate-qr`

## QR Code Location

The QR code is saved to: `public/qr/adx-transit.png`

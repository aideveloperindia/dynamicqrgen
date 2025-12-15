# Dynamic QR Code Generator - Multi-User System

A complete dynamic QR code generation platform where business owners can create their own QR codes with customizable links.

## Features

- 🔐 **Google OAuth Login** - One-click login with Google account
- 📊 **User Dashboard** - Manage your business profile and links
- 🔗 **Multiple Link Types** - Support for Instagram, Facebook, WhatsApp, Payment, Website, Google Reviews, Menu Card, YouTube, Twitter, LinkedIn, and custom categories
- 🎨 **Custom Categories** - Create custom categories with your own logo uploads
- 💳 **Razorpay Integration** - Secure payment processing (₹100 activation fee)
- 📱 **QR Code Generation** - Generate and download QR codes for your unique page
- 📄 **Dynamic Pages** - Each user gets a unique URL (e.g., `/p/username`)
- 📱 **Mobile Responsive** - Fully responsive design for all devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/dynamicqrgen

# Option 2: MongoDB Atlas (Free tier recommended)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dynamicqrgen

# Google OAuth Credentials
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here

# Razorpay Test Keys
# Get from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Base URL for QR codes
BASE_URL=http://localhost:4000
# For production: BASE_URL=https://yourdomain.com

# Port
PORT=4000
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application type to "Web application"
6. Add authorized redirect URI: `http://localhost:4000/auth/google/callback` (for local)
7. Copy Client ID and Client Secret to `.env` file

### 4. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Dashboard → Settings → API Keys
3. Generate Test Keys
4. Copy Key ID and Key Secret to `.env` file

### 5. MongoDB Setup

**Option A: MongoDB Atlas (Recommended - Free)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env`

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/dynamicqrgen` in `.env`

### 6. Create Required Directories

```bash
mkdir -p public/uploads
mkdir -p public/qr
```

### 7. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## User Flow

1. **Login**: User visits the site and logs in with Google
2. **Dashboard**: User lands on dashboard after login
3. **Profile Setup**: User adds business name and logo (optional)
4. **Add Links**: User adds links for Instagram, WhatsApp, Payment, etc.
5. **Custom Categories**: User can create custom categories with logo uploads
6. **Payment**: User pays ₹100 via Razorpay to activate QR code
7. **Generate QR**: After payment, user can generate and download QR code
8. **Share**: User shares/prints QR code, customers scan and see the page with all links

## Project Structure

```
dynamicqrgen/
├── config/
│   ├── database.js       # MongoDB connection
│   └── passport.js       # Google OAuth configuration
├── models/
│   ├── User.js           # User model
│   ├── Link.js           # Link model
│   └── Payment.js        # Payment model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── dashboard.js      # Dashboard routes
│   ├── payment.js        # Payment routes
│   ├── qr.js             # QR code generation routes
│   └── public.js         # Public page routes
├── middleware/
│   └── auth.js           # Authentication middleware
├── views/
│   ├── login.ejs         # Login page
│   ├── dashboard.ejs     # User dashboard
│   ├── public-page.ejs   # Public QR code page
│   └── index.ejs         # Legacy static page
├── public/
│   ├── images/           # Static images
│   ├── uploads/          # User uploaded logos
│   └── qr/               # Generated QR codes
├── server.js              # Main server file
└── package.json          # Dependencies
```

## Default Categories

The system includes these default categories:
- Instagram
- Facebook
- WhatsApp
- Payment (UPI)
- Website
- Google Reviews
- Menu Card
- YouTube
- Twitter
- LinkedIn

Users can also create custom categories with their own logos.

## Payment Flow

1. User clicks "Pay ₹100" button
2. Razorpay checkout opens
3. User completes payment
4. Payment is verified on server
5. User's account is activated
6. QR code generation becomes available

## API Endpoints

- `GET /` - Home (redirects to login or dashboard)
- `GET /login` - Login page
- `GET /auth/google` - Google OAuth login
- `GET /auth/logout` - Logout
- `GET /dashboard` - User dashboard (protected)
- `POST /dashboard/update-profile` - Update business profile
- `POST /dashboard/link` - Add/update link
- `DELETE /dashboard/link/:id` - Delete link
- `POST /payment/create-order` - Create payment order
- `POST /payment/verify` - Verify payment
- `GET /qr/generate` - Generate QR code (protected)
- `GET /p/:slug` - Public user page
- `GET /p/:slug/redirect/:linkId` - Redirect to link

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update `BASE_URL` in `.env` to your Vercel URL
5. Deploy

### Environment Variables for Production

Make sure to update:
- `BASE_URL` to your production URL
- `MONGODB_URI` to production database
- `SESSION_SECRET` to a strong random string
- Use production Razorpay keys (not test keys)

## License

MIT

## Built By

AI Developer India

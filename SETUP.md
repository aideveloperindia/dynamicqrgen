# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create .env File
Copy the example below and create a `.env` file in the root directory:

```env
# MongoDB - Use MongoDB Atlas (Free) or Local
MONGODB_URI=mongodb://localhost:27017/dynamicqrgen

# Google OAuth - Get from https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Session Secret - Generate a random string
SESSION_SECRET=your_random_secret_here

# Razorpay Test Keys - Get from https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Base URL
BASE_URL=http://localhost:4000
PORT=4000
```

## Step 3: Get Google OAuth Credentials

1. Visit https://console.cloud.google.com/
2. Create a new project
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen (if prompted)
6. Application type: Web application
7. Authorized redirect URIs: `http://localhost:4000/auth/google/callback`
8. Copy Client ID and Secret to `.env`

## Step 4: Get Razorpay Test Keys

1. Sign up at https://razorpay.com/
2. Go to Dashboard → Settings → API Keys
3. Generate Test Keys
4. Copy Key ID and Key Secret to `.env`

## Step 5: Setup MongoDB

### Option A: MongoDB Atlas (Recommended - Free)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/dynamicqrgen`

## Step 6: Start Server
```bash
npm start
```

Visit http://localhost:4000 and login with Google!

## Important Notes

- For production, update `BASE_URL` and `GOOGLE_CALLBACK_URL` to your production domain
- Use production Razorpay keys (not test keys) in production
- Set `NODE_ENV=production` in production for secure cookies







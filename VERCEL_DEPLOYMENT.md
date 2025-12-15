# Vercel Deployment Guide

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### MongoDB
```
MONGODB_URI=your_mongodb_connection_string
```

### Google OAuth
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://your-vercel-domain.vercel.app/auth/google/callback
```

### Session Secret
```
SESSION_SECRET=dynamicqrgen_secret_key_2024_change_in_production
```

### Razorpay
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Base URL
```
BASE_URL=https://your-vercel-domain.vercel.app
```

## Important Notes

1. **Update Google OAuth Callback URL** after deployment:
   - Go to Google Cloud Console
   - Add production callback URL: `https://your-vercel-domain.vercel.app/auth/google/callback`
   - Update `GOOGLE_CALLBACK_URL` in Vercel environment variables

2. **MongoDB Connection**: The connection is now lazy-loaded for serverless compatibility

3. **Static Files**: Make sure to commit static files (images, etc.) to the repository

4. **File Uploads**: For production, consider using cloud storage (AWS S3, Cloudinary) instead of local file system

## Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Add all environment variables
4. Deploy
5. Update Google OAuth callback URL
6. Test the deployment


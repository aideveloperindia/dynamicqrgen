# Google OAuth Callback URL Issue - Fix

## 🔍 Problem

Your health endpoint shows:
```json
{
  "google_oauth": {
    "callback_url": "https://dynamicqrgen.vercel.app/auth/google/callback"
  }
}
```

But you're testing **locally** on `http://localhost:4000`. This mismatch can cause 500 errors!

## ✅ Solution

### For Local Testing:

Your `.env` file should have:
```env
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
BASE_URL=http://localhost:4000
```

### For Production (Vercel):

Your Vercel environment variables should have:
```env
GOOGLE_CALLBACK_URL=https://dynamicqrgen.vercel.app/auth/google/callback
BASE_URL=https://dynamicqrgen.vercel.app
```

## 🔧 Quick Fix Steps

### 1. Update `.env` for Local Testing

```bash
# Edit .env file
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
BASE_URL=http://localhost:4000
MONGODB_URI=your_mongodb_uri
```

### 2. Update Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

**Add BOTH callback URLs:**

**Authorized redirect URIs:**
- `http://localhost:4000/auth/google/callback` (for local testing)
- `https://dynamicqrgen.vercel.app/auth/google/callback` (for production)

**Authorized JavaScript origins:**
- `http://localhost:4000` (for local testing)
- `https://dynamicqrgen.vercel.app` (for production)

### 3. Restart Server

After updating `.env`:
```bash
# Kill existing server
lsof -ti:4000 | xargs kill -9

# Start server
npm start
```

### 4. Test

1. Visit: `http://localhost:4000/health`
2. Check `google_oauth.callback_url` should be: `http://localhost:4000/auth/google/callback`
3. Visit: `http://localhost:4000/login`
4. Click: "Continue with Google"
5. Should redirect to Google login page

## ⚠️ Common Issues

### Issue: "redirect_uri_mismatch" Error

**Cause:** Callback URL in `.env` doesn't match Google Console

**Fix:**
1. Check `.env` has: `GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback`
2. Check Google Console has the same URL in "Authorized redirect URIs"
3. Restart server

### Issue: Still Getting 500 Error

**Check:**
1. Server logs show: `🔐 Google OAuth configured:`
2. Health endpoint shows: `strategy_registered: true`
3. Callback URL matches exactly (no trailing slash, correct protocol)

### Issue: Works Locally But Not on Vercel

**Fix:**
1. Set Vercel environment variables:
   - `GOOGLE_CALLBACK_URL=https://dynamicqrgen.vercel.app/auth/google/callback`
   - `BASE_URL=https://dynamicqrgen.vercel.app`
2. Add Vercel URL to Google Console
3. Redeploy Vercel project

## 📋 Checklist

- [ ] `.env` has `GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback` for local
- [ ] Google Console has `http://localhost:4000/auth/google/callback` in redirect URIs
- [ ] Google Console has `https://dynamicqrgen.vercel.app/auth/google/callback` in redirect URIs
- [ ] Server restarted after updating `.env`
- [ ] Health endpoint shows correct callback URL
- [ ] Tested clicking "Continue with Google" button


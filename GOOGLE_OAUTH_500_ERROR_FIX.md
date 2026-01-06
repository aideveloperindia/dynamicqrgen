# Google OAuth 500 Error - Fix Guide

## 🔍 What's Happening

When you click "Continue with Google", you're getting a 500 error. This usually means one of these issues:

## ✅ Quick Fixes (Check These First)

### 1. **Check Environment Variables**

**For Local Development:**
Check your `.env` file has:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
BASE_URL=http://localhost:4000
```

**For Vercel (Production):**
1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check these are set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL` (should be: `https://dynamicqrgen.vercel.app/auth/google/callback`)
   - `BASE_URL` (should be: `https://dynamicqrgen.vercel.app`)
3. **Important**: After adding/updating, **redeploy** your Vercel project!

### 2. **Check Google Cloud Console Configuration**

Go to: https://console.cloud.google.com/apis/credentials

**Authorized JavaScript origins:**
- `http://localhost:4000` (for local)
- `https://dynamicqrgen.vercel.app` (for production)

**Authorized redirect URIs:**
- `http://localhost:4000/auth/google/callback` (for local)
- `https://dynamicqrgen.vercel.app/auth/google/callback` (for production)

**⚠️ Common Mistakes:**
- ❌ Missing `https://` or `http://`
- ❌ Wrong path (should be `/auth/google/callback`, not `/auth/google/callback/`)
- ❌ Extra spaces or typos
- ❌ Using wrong domain

### 3. **Check MongoDB Connection**

The 500 error might also be caused by MongoDB connection issues during authentication.

**Check:**
- MongoDB URI is set in environment variables
- MongoDB cluster is running (not paused)
- Network Access is set to `0.0.0.0/0` (Allow from anywhere)

**Test MongoDB:**
Visit: `http://localhost:4000/health` (or `https://dynamicqrgen.vercel.app/health`)

Look for:
```json
{
  "mongodb": {
    "connected": true
  }
}
```

If `connected: false`, fix MongoDB first.

---

## 🔧 Step-by-Step Fix

### Step 1: Verify Environment Variables

**Local:**
```bash
# Check if .env file exists and has the variables
cat .env | grep GOOGLE
```

**Vercel:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all Google OAuth variables are set
3. If missing, add them
4. **Redeploy** after adding

### Step 2: Verify Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Check **Authorized redirect URIs**:
   - Must include: `https://dynamicqrgen.vercel.app/auth/google/callback`
   - Must match exactly (no trailing slash, correct protocol)
4. Check **Authorized JavaScript origins**:
   - Must include: `https://dynamicqrgen.vercel.app`
5. Click **Save**

### Step 3: Check Server Logs

**Local:**
Check your terminal where the server is running. Look for:
- `🔐 Google OAuth configured:` - Should show credentials are loaded
- `❌ Google OAuth not configured` - Means credentials are missing
- `❌ Google OAuth strategy not registered` - Means strategy failed to initialize

**Vercel:**
1. Go to: Vercel Dashboard → Your Project → Functions
2. Click: **View Function Logs**
3. Look for Google OAuth related errors

### Step 4: Test the Flow

1. **Clear browser cookies** for your domain
2. Visit: `http://localhost:4000/login` (or your Vercel URL)
3. Click: "Continue with Google"
4. **Expected**: Should redirect to Google login page
5. **If 500 error**: Check logs for specific error message

---

## 🐛 Common Error Messages & Fixes

### Error: "Google OAuth is not configured"
**Fix:** Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in environment variables

### Error: "Google OAuth strategy not registered"
**Fix:** 
- Check credentials are correct (no typos)
- Check callback URL matches Google Console
- Restart server after setting environment variables

### Error: "Database connection failed"
**Fix:** 
- Check MongoDB URI is set
- Check MongoDB cluster is running
- Check Network Access is set correctly

### Error: "redirect_uri_mismatch" (from Google)
**Fix:** 
- Check callback URL in Google Console matches exactly
- Must be: `https://dynamicqrgen.vercel.app/auth/google/callback`
- No trailing slash, correct protocol

### Error: "invalid_client" (from Google)
**Fix:** 
- Check `GOOGLE_CLIENT_ID` is correct
- Check `GOOGLE_CLIENT_SECRET` is correct
- No extra spaces or quotes

---

## 🧪 Test Locally First

Before deploying to Vercel, test locally:

1. **Set up `.env` file:**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
BASE_URL=http://localhost:4000
MONGODB_URI=your_mongodb_uri
```

2. **Add to Google Console:**
   - Authorized JavaScript origin: `http://localhost:4000`
   - Authorized redirect URI: `http://localhost:4000/auth/google/callback`

3. **Start server:**
```bash
npm start
```

4. **Test:**
   - Visit: `http://localhost:4000/login`
   - Click: "Continue with Google"
   - Should redirect to Google login

5. **If it works locally but not on Vercel:**
   - Check Vercel environment variables
   - Check callback URL in Google Console includes Vercel URL
   - Redeploy Vercel project

---

## 📋 Checklist

Before reporting the issue, check:

- [ ] `GOOGLE_CLIENT_ID` is set in environment variables
- [ ] `GOOGLE_CLIENT_SECRET` is set in environment variables
- [ ] `GOOGLE_CALLBACK_URL` is set correctly
- [ ] Google Console has correct redirect URI
- [ ] Google Console has correct JavaScript origin
- [ ] MongoDB is connected (check `/health` endpoint)
- [ ] Server logs show Google OAuth is configured
- [ ] Tried clearing browser cookies
- [ ] Tested locally first (if possible)
- [ ] Redeployed Vercel after setting environment variables

---

## 🆘 Still Not Working?

1. **Check server logs** for the exact error message
2. **Check browser console** (F12) for any client-side errors
3. **Check Vercel function logs** for server-side errors
4. **Verify** all environment variables are set and correct
5. **Verify** Google Console configuration matches exactly

The error message in the logs will tell you exactly what's wrong!


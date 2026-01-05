# Vercel 500 Error Fix

## ✅ Fixed Issues

### 1. Removed Deprecated `builds` Configuration
**Problem**: `builds` array in `vercel.json` is deprecated and causes warnings  
**Fix**: Removed `builds` array - Vercel auto-detects Node.js projects now

**Before:**
```json
{
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ]
}
```

**After:**
```json
{
  "routes": [...]
}
```

Vercel will automatically detect `server.js` as a Node.js serverless function.

---

## 🔍 Common 500 Error Causes

### 1. MongoDB Connection Failure
**Symptoms**: 500 error on any route that needs database

**Check:**
- MongoDB URI is correct in Vercel
- MongoDB Atlas IP whitelist allows `0.0.0.0/0` (or Vercel IPs)
- Database user has correct permissions

**Fix:**
- Verify `MONGODB_URI` in Vercel environment variables
- Check MongoDB Atlas → Network Access → Add IP Address: `0.0.0.0/0`

### 2. Missing Environment Variables
**Symptoms**: 500 error on routes using env vars

**Check:**
- All required env vars are set in Vercel
- No typos in variable names
- Values are correct

**Required Variables:**
- `MONGODB_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `SESSION_SECRET`
- `BASE_URL`
- `RAZORPAY_KEY_ID` (optional)
- `RAZORPAY_KEY_SECRET` (optional)

### 3. Session Store Initialization Failure
**Symptoms**: 500 error on authentication routes

**Check:**
- MongoDB connection works
- `connect-mongo` package is installed
- Session store can connect to MongoDB

**Fix:**
- Verify MongoDB connection
- Check Vercel logs for session store errors

### 4. Route Handler Errors
**Symptoms**: 500 error on specific routes

**Check:**
- Vercel function logs for specific error
- Route handler try-catch blocks
- Database queries

**Fix:**
- Check Vercel logs for stack trace
- Fix the specific error in route handler

---

## 🧪 Debugging Steps

### Step 1: Check Vercel Logs
1. Go to: Vercel Dashboard → Your Project
2. Click: **Functions** tab
3. Click: **View Function Logs**
4. Look for:
   - Error messages
   - Stack traces
   - MongoDB connection errors
   - Missing environment variables

### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for:
   - JavaScript errors
   - Network errors
   - Failed requests

### Step 3: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Find the failed request (500 error)
4. Click on it
5. Check:
   - **Headers** - Request/Response headers
   - **Response** - Error message (if any)
   - **Preview** - Error details

### Step 4: Test Specific Routes
Try accessing:
- `/` - Landing page
- `/login` - Login page
- `/dashboard` - Dashboard (requires login)
- `/auth/google` - Google OAuth

See which route gives 500 error.

---

## 🔧 Quick Fixes

### Fix 1: Redeploy After vercel.json Change
After removing `builds` from `vercel.json`:
1. Commit and push changes
2. Vercel will auto-redeploy
3. Wait for deployment to complete
4. Test again

### Fix 2: Verify Environment Variables
1. Go to Vercel → Settings → Environment Variables
2. Verify all variables are set
3. Make sure they're enabled for **Production**, **Preview**, and **Development**
4. Redeploy if you added/updated any

### Fix 3: Check MongoDB Connection
1. Verify MongoDB URI in Vercel
2. Check MongoDB Atlas → Network Access
3. Ensure IP `0.0.0.0/0` is whitelisted (or Vercel IPs)
4. Test connection from MongoDB Atlas dashboard

### Fix 4: Clear Vercel Cache
1. Go to Vercel Dashboard
2. Click on your deployment
3. Click **Redeploy** → **Redeploy with existing Build Cache** (uncheck this)
4. Redeploy

---

## 📋 What to Check Next

After fixing `vercel.json`:

1. **Commit and push** the changes
2. **Wait for Vercel to redeploy**
3. **Check Vercel logs** for the specific 500 error
4. **Test the route** that's failing
5. **Share the error message** from Vercel logs so I can help fix it

---

## 🚨 Most Likely Causes

Based on the 500 error:

1. **MongoDB Connection** - Most common cause
   - Check MongoDB Atlas network access
   - Verify MongoDB URI is correct

2. **Missing Environment Variable** - Second most common
   - Check all env vars are set in Vercel
   - No typos in variable names

3. **Session Store Error** - If on auth routes
   - MongoDB connection issue
   - Session store initialization failing

---

**After you push the vercel.json fix, check Vercel logs and share the specific error message!**


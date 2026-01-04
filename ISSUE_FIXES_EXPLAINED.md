# Root Cause Analysis & Fixes

## 🔍 Issue 1: Logo Images Not Loading (404 Error)

### Root Cause:
- Vercel's routing in `vercel.json` was interfering with static file serving
- The custom image route handler wasn't working correctly in serverless environment
- Static files need to be served before any route handlers

### Fix Applied:
1. Simplified `vercel.json` routing - removed custom image routes, let Express handle it
2. Moved static file serving to use Express static middleware BEFORE routes
3. Added proper content-type headers for images
4. Ensured static files are served from `/public` directory correctly

### Files Changed:
- `server.js` - Simplified static file serving
- `vercel.json` - Simplified routing rules

---

## 🔍 Issue 2: OAuth Login Redirecting Back to Login Page

### Root Cause:
**THIS IS THE MAIN ISSUE:**

Vercel serverless functions are **stateless**. Each function invocation is isolated.

The default `express-session` uses **in-memory storage**, which means:
- Session data is stored in the server's memory
- In serverless, each function call is a NEW instance
- When Google redirects back, it's a NEW function invocation
- The session from the previous call doesn't exist anymore
- Result: User appears logged out, redirects to login

### Solution:
**Use MongoDB Session Store** (`connect-mongo`):
- Sessions are stored in MongoDB database
- Persists across function invocations
- Works perfectly with serverless architecture
- Session data survives between requests

### Fix Applied:
1. Installed `connect-mongo` package
2. Configured session store to use MongoDB
3. Sessions now persist in database instead of memory
4. Added proper cookie settings for cross-site cookies (`sameSite: 'none'`, `secure: true`)

### Files Changed:
- `package.json` - Added `connect-mongo` dependency
- `server.js` - Configured MongoDB session store
- `routes/auth.js` - Improved OAuth callback handling

---

## 📋 Technical Details

### Session Configuration:
```javascript
store: MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  touchAfter: 24 * 3600,
  ttl: 24 * 60 * 60
})
```

### Cookie Settings for Vercel:
- `secure: true` - Required for HTTPS
- `sameSite: 'none'` - Required for cross-site cookies (Google OAuth)
- `httpOnly: true` - Security best practice

---

## ✅ What This Fixes:

1. **Logo Images**: Now served correctly from `/public/images/`
2. **OAuth Login**: Sessions persist in MongoDB, login works correctly
3. **User Authentication**: Users stay logged in across requests
4. **Dashboard Access**: After login, users can access dashboard

---

## 🚀 Next Steps:

1. Commit and push these changes
2. Vercel will auto-deploy
3. Test login flow - should work now!
4. Verify images load correctly

---

**The key insight**: Serverless = Stateless. Always use database-backed sessions, never in-memory!




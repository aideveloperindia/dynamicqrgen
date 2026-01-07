# Gmail Login Troubleshooting Guide

## Quick Check: Is Gmail Login Working?

### 1. Check Environment Variables

Make sure these are set in Vercel (or your `.env` file):

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=https://dynamicqrgen.vercel.app/auth/google/callback
BASE_URL=https://dynamicqrgen.vercel.app
```

### 2. Verify Google Cloud Console Settings

Go to: https://console.cloud.google.com/apis/credentials

**Authorized JavaScript origins:**
- `http://localhost:4000` (for local testing)
- `https://dynamicqrgen.vercel.app` (for production)

**Authorized redirect URIs:**
- `http://localhost:4000/auth/google/callback` (for local testing)
- `https://dynamicqrgen.vercel.app/auth/google/callback` (for production)

### 3. Common Issues & Solutions

#### Issue: "Authentication failed" or redirects back to login
**Possible causes:**
- ❌ Callback URL mismatch in Google Console
- ❌ Missing or incorrect environment variables
- ❌ Session storage issue (MongoDB connection)

**Solutions:**
1. Double-check callback URL matches exactly (including `https://` and `/auth/google/callback`)
2. Verify all environment variables are set in Vercel
3. Check Vercel logs for specific error messages

#### Issue: "Google account email not available"
**Cause:** Google profile doesn't have an email
**Solution:** Ensure your Google account has a verified email address

#### Issue: "Invalid Google profile"
**Cause:** Google OAuth returned incomplete data
**Solution:** Check Google Cloud Console OAuth consent screen is properly configured

### 4. Testing Steps

1. **Clear browser cookies** for your domain
2. **Visit** https://dynamicqrgen.vercel.app/login
3. **Click** "Continue with Google"
4. **Select** a Google account
5. **Allow** permissions
6. **Should redirect** to `/dashboard`

### 5. Check Server Logs

In Vercel, check function logs for:
- `🔐 Google OAuth configured:` - Shows if credentials are loaded
- `Passport authenticate callback:` - Shows authentication result
- `User logged in:` - Confirms successful login
- Any error messages

### 6. Debug Mode

If login fails, check the URL parameters:
- `?error=auth_error&msg=...` - Google OAuth error
- `?error=no_user` - User creation failed
- `?error=login_error` - Session login failed
- `?error=save_error` - Session save failed

## Recent Improvements

✅ **Better error handling** - More specific error messages
✅ **Profile validation** - Checks for required email and name
✅ **Credential validation** - Warns if OAuth credentials are missing
✅ **Improved logging** - Better debugging information

## Still Not Working?

1. Check Vercel deployment logs
2. Verify MongoDB connection (sessions require DB)
3. Ensure `SESSION_SECRET` is set in Vercel
4. Check if `MONGODB_URI` is correct and accessible




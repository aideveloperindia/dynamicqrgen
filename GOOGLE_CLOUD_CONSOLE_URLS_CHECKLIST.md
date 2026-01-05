# Google Cloud Console URLs Checklist
## Email: nad.nandagiri@gmail.com

**Date**: December 15, 2025  
**Project**: Dynamic QR Generator

---

## ✅ Required URLs Configuration

### 1. Authorized JavaScript Origins

These should be configured in:
**Google Cloud Console → APIs & Services → Credentials → Your OAuth 2.0 Client ID**

**Required URLs:**
```
http://localhost:4000
https://dynamicqrgen.vercel.app
```

**Why both?**
- `http://localhost:4000` - For local development/testing
- `https://dynamicqrgen.vercel.app` - For production deployment

---

### 2. Authorized Redirect URIs

These should be configured in the same OAuth Client ID settings:

**Required URLs:**
```
http://localhost:4000/auth/google/callback
https://dynamicqrgen.vercel.app/auth/google/callback
```

**Why both?**
- `http://localhost:4000/auth/google/callback` - For local development/testing
- `https://dynamicqrgen.vercel.app/auth/google/callback` - For production deployment

---

## 📋 Verification Checklist

### ✅ Authorized JavaScript Origins
- [ ] `http://localhost:4000` is listed
- [ ] `https://dynamicqrgen.vercel.app` is listed
- [ ] No trailing slashes
- [ ] Exact match (case-sensitive for protocol)

### ✅ Authorized Redirect URIs
- [ ] `http://localhost:4000/auth/google/callback` is listed
- [ ] `https://dynamicqrgen.vercel.app/auth/google/callback` is listed
- [ ] No trailing slashes
- [ ] Exact match (case-sensitive)

---

## 🔍 How to Check in Google Cloud Console

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Make sure you're logged in as**: `nad.nandagiri@gmail.com`
3. **Select your project** (if you have multiple)
4. **Click on your OAuth 2.0 Client ID** (the one with Client ID: `914942931826-tii8hk81d0obua5c6njr91av09lnkm2p.apps.googleusercontent.com`)
5. **Scroll down** to see:
   - **Authorized JavaScript origins** section
   - **Authorized redirect URIs** section

---

## ⚠️ Common Issues

### Issue 1: Missing Production URL
**Symptom**: Google login works locally but not on Vercel  
**Fix**: Add `https://dynamicqrgen.vercel.app` and its callback URL

### Issue 2: Trailing Slash
**Symptom**: Redirect errors  
**Fix**: Remove trailing slashes (should NOT end with `/`)

### Issue 3: Wrong Protocol
**Symptom**: CORS errors  
**Fix**: Use `https://` for production, `http://` for localhost

### Issue 4: Case Sensitivity
**Symptom**: Redirect fails  
**Fix**: URLs are case-sensitive - use exact case

---

## 📝 What You Should See

### Authorized JavaScript Origins:
```
http://localhost:4000
https://dynamicqrgen.vercel.app
```

### Authorized Redirect URIs:
```
http://localhost:4000/auth/google/callback
https://dynamicqrgen.vercel.app/auth/google/callback
```

---

## 🔧 If URLs Are Missing

### To Add URLs:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, click **+ ADD URI**
4. Add: `https://dynamicqrgen.vercel.app`
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add: `https://dynamicqrgen.vercel.app/auth/google/callback`
7. Click **SAVE**

---

## ✅ Expected Configuration

Based on your environment variables, your OAuth Client ID is:
- **Client ID**: `914942931826-tii8hk81d0obua5c6njr91av09lnkm2p.apps.googleusercontent.com`

This OAuth client should have:

**Authorized JavaScript origins:**
- ✅ `http://localhost:4000`
- ✅ `https://dynamicqrgen.vercel.app`

**Authorized redirect URIs:**
- ✅ `http://localhost:4000/auth/google/callback`
- ✅ `https://dynamicqrgen.vercel.app/auth/google/callback`

---

## 🧪 Testing

After verifying/updating URLs:

1. **Test Local**:
   - Visit: `http://localhost:4000/login`
   - Click "Continue with Google"
   - Should redirect to Google, then back to dashboard

2. **Test Production**:
   - Visit: `https://dynamicqrgen.vercel.app/login`
   - Click "Continue with Google"
   - Should redirect to Google, then back to dashboard

---

**Please share what URLs you see in your Google Cloud Console so I can verify they match!**


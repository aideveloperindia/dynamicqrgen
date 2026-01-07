# MongoDB Connection Troubleshooting Guide

## 🔍 Your MongoDB Connection String

```
mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority
```

## ✅ Verify This is Set in Vercel

1. Go to: https://vercel.com/dashboard
2. Select: `dynamicqrgen` project
3. Go to: **Settings** → **Environment Variables**
4. Check: `MONGODB_URI` exists with the exact string above
5. Ensure it's enabled for: **Production**, **Preview**, **Development**

## 🚨 Most Common Issue: IP Whitelist

### Problem
MongoDB Atlas blocks connections from IPs that aren't whitelisted. Vercel uses dynamic IPs, so you need to allow all IPs.

### Fix
1. Go to: https://cloud.mongodb.com/
2. Select your cluster: `dynamicqrgen`
3. Click: **Network Access** (left sidebar)
4. Click: **Add IP Address**
5. Click: **Allow Access from Anywhere**
   - This adds `0.0.0.0/0` (all IPs)
6. Click: **Confirm**
7. Wait 1-2 minutes for changes to propagate

### Alternative (More Secure)
If you want to be more secure:
1. Get Vercel IP ranges (they publish them)
2. Add each IP range to MongoDB Atlas
3. But `0.0.0.0/0` is easier for now

---

## 🔍 Other Common Issues

### Issue 1: Wrong Password
**Error**: `authentication failed`

**Fix**:
1. Check password in MongoDB Atlas → Database Access
2. Verify password matches in Vercel `MONGODB_URI`
3. Password: `mgVt9t9eahqLRHUF`

### Issue 2: Database Name Mismatch
**Error**: `database not found`

**Fix**:
- Your URI includes `/dynamicqrgen` - make sure this database exists
- Or create it in MongoDB Atlas

### Issue 3: Connection Timeout
**Error**: `ETIMEDOUT` or `timeout`

**Fix**:
1. Check MongoDB Atlas → Network Access
2. Ensure `0.0.0.0/0` is whitelisted
3. Check MongoDB Atlas cluster is running (not paused)

### Issue 4: User Permissions
**Error**: `not authorized`

**Fix**:
1. Go to MongoDB Atlas → Database Access
2. Find user: `nadnandagiri_db_user`
3. Ensure user has **Read and write** permissions
4. Or **Atlas admin** role

---

## 🧪 Test Connection

### Method 1: Check Vercel Logs
1. Go to: Vercel Dashboard → Your Project
2. Click: **Functions** → **View Function Logs**
3. Look for:
   - `✅ MongoDB Connected: dynamicqrgen.76sxpyb.mongodb.net`
   - OR `❌ MongoDB connection failed:`

### Method 2: Test Health Endpoint
Visit: `https://dynamicqrgen.vercel.app/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

If this works but other routes fail → MongoDB connection issue

### Method 3: Test MongoDB Atlas Connection
1. Go to: MongoDB Atlas → Clusters
2. Click: **Connect** on your cluster
3. Choose: **Connect your application**
4. Copy the connection string
5. Compare with your Vercel `MONGODB_URI`
6. Should match (except password)

---

## 🔧 Quick Fixes

### Fix 1: Verify MongoDB URI Format
Your URI should be:
```
mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority
```

**Check**:
- ✅ Username: `nadnandagiri_db_user`
- ✅ Password: `mgVt9t9eahqLRHUF`
- ✅ Host: `dynamicqrgen.76sxpyb.mongodb.net`
- ✅ Database: `dynamicqrgen`
- ✅ Options: `retryWrites=true&w=majority`

### Fix 2: Check MongoDB Atlas Status
1. Go to: https://cloud.mongodb.com/
2. Check cluster status (should be green/running)
3. If paused → Click "Resume"

### Fix 3: Verify User Exists
1. Go to: MongoDB Atlas → Database Access
2. Find: `nadnandagiri_db_user`
3. Verify:
   - User exists
   - Password is correct
   - Has proper permissions

### Fix 4: Test Connection String
Use MongoDB Compass or MongoDB Shell to test:
```bash
mongosh "mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority"
```

If this works → Connection string is correct
If this fails → Fix MongoDB Atlas settings

---

## 📋 Checklist

- [ ] MongoDB URI is set in Vercel environment variables
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] MongoDB cluster is running (not paused)
- [ ] Database user `nadnandagiri_db_user` exists
- [ ] User password matches in Vercel
- [ ] User has read/write permissions
- [ ] Database `dynamicqrgen` exists
- [ ] Connection string format is correct

---

## 🚨 If Still Failing

1. **Check Vercel Logs** for specific error message
2. **Share the error** from logs so I can help
3. **Test health endpoint**: `/health` (should work without DB)
4. **Verify MongoDB Atlas** cluster is accessible

The improved error logging will now show exactly what's wrong!




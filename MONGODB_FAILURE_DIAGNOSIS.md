# MongoDB Failure Diagnosis - What's Missing or Misconfigured

## 🔍 Quick Diagnosis Checklist

### ✅ 1. MongoDB URI in Vercel
**Check**: Is `MONGODB_URI` set in Vercel?
- Go to: Vercel Dashboard → Settings → Environment Variables
- Look for: `MONGODB_URI`
- Value should be: `mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority`

**If Missing**: Add it now!

---

### ✅ 2. MongoDB Atlas Network Access (MOST COMMON ISSUE)
**This is likely the problem!**

**Check**: Is `0.0.0.0/0` whitelisted?
1. Go to: https://cloud.mongodb.com/
2. Click: **Network Access** (left sidebar)
3. Look for: `0.0.0.0/0` in the list
4. If NOT there → **This is your problem!**

**Fix**:
1. Click: **Add IP Address**
2. Click: **Allow Access from Anywhere**
3. Click: **Confirm**
4. Wait 2-3 minutes

**Why**: Vercel uses dynamic IPs. Without `0.0.0.0/0`, MongoDB blocks all connections.

---

### ✅ 3. MongoDB Cluster Status
**Check**: Is cluster running?
1. Go to: https://cloud.mongodb.com/
2. Check cluster status (should be green/running)
3. If paused → Click "Resume"

---

### ✅ 4. MongoDB User Permissions
**Check**: Does user have correct permissions?
1. Go to: MongoDB Atlas → **Database Access**
2. Find user: `nadnandagiri_db_user`
3. Check permissions:
   - Should have: **Read and write to any database**
   - OR: **Atlas admin** role

---

### ✅ 5. MongoDB Password
**Check**: Is password correct?
- Password in Vercel: `mgVt9t9eahqLRHUF`
- Password in MongoDB Atlas → Database Access → `nadnandagiri_db_user`
- **Must match exactly!**

---

### ✅ 6. Database Name
**Check**: Does database exist?
- Your URI includes: `/dynamicqrgen`
- This database should exist in MongoDB Atlas
- If it doesn't exist, MongoDB will create it on first write

---

### ✅ 7. Connection String Format
**Your URI should be exactly**:
```
mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority
```

**Check for**:
- ✅ No extra spaces
- ✅ No line breaks
- ✅ Password is URL-encoded (if it has special chars)
- ✅ Database name `/dynamicqrgen` is included

---

## 🚨 Most Likely Issue: Network Access

**90% of MongoDB connection failures are due to IP whitelist!**

### Step-by-Step Fix:

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Click**: Network Access (left sidebar, under Security)
3. **Check**: Do you see `0.0.0.0/0` in the list?
   - ✅ **YES** → Network access is OK, check other issues
   - ❌ **NO** → This is your problem!

4. **If NO**:
   - Click: **Add IP Address** button
   - Click: **Allow Access from Anywhere** button
   - This adds: `0.0.0.0/0` with comment "Allow Access from Anywhere"
   - Click: **Confirm**
   - **Wait 2-3 minutes** for changes to propagate

5. **Verify**:
   - You should see `0.0.0.0/0` in the Network Access list
   - Status should be "Active"

---

## 🔧 Other Possible Issues

### Issue: MongoDB URI Not Loaded in Vercel
**Symptom**: Logs show "MONGODB_URI not set"

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Verify `MONGODB_URI` exists
3. Make sure it's enabled for **Production**, **Preview**, **Development**
4. **Redeploy** after adding/updating

### Issue: Wrong Environment
**Symptom**: Variables set but not loading

**Fix**:
- In Vercel, when adding env vars, check ALL environments:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

### Issue: Cluster Paused
**Symptom**: Connection timeout

**Fix**:
1. Go to MongoDB Atlas → Clusters
2. Check if cluster shows "Paused"
3. If paused → Click "Resume"
4. Wait for cluster to start

### Issue: User Password Changed
**Symptom**: Authentication failed

**Fix**:
1. Go to MongoDB Atlas → Database Access
2. Find `nadnandagiri_db_user`
3. Check current password
4. Update in Vercel if different

---

## 🧪 How to Verify What's Wrong

### Method 1: Check Vercel Logs
1. Go to: Vercel Dashboard → Your Project
2. Click: **Functions** tab
3. Click: **View Function Logs**
4. Look for:
   - `🔄 Attempting MongoDB connection...`
   - `✅ MongoDB Connected: ...` (SUCCESS)
   - `❌ MongoDB connection failed:` (FAILURE)
   - Error message will tell you exactly what's wrong

### Method 2: Test Health Endpoint
Visit: `https://dynamicqrgen.vercel.app/health`

- ✅ **Works** → Server is running, MongoDB might be the issue
- ❌ **500 Error** → Server itself has issues

### Method 3: Test MongoDB Connection Locally
Create a test file to verify your connection string works:

```javascript
// test-mongo.js
require('dotenv').config();
const mongoose = require('mongoose');

const uri = 'mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Failed:', err.message));
```

Run: `node test-mongo.js`

---

## 📋 Complete Checklist

Go through each item:

- [ ] `MONGODB_URI` is set in Vercel environment variables
- [ ] MongoDB Atlas Network Access has `0.0.0.0/0` whitelisted
- [ ] MongoDB cluster is running (not paused)
- [ ] Database user `nadnandagiri_db_user` exists
- [ ] User password matches in Vercel (`mgVt9t9eahqLRHUF`)
- [ ] User has read/write permissions
- [ ] Connection string format is correct (no spaces, correct format)
- [ ] Vercel environment variables are enabled for all environments
- [ ] Vercel deployment completed successfully
- [ ] Checked Vercel logs for specific error message

---

## 🎯 Most Likely Fix

**90% chance it's Network Access!**

1. Go to: https://cloud.mongodb.com/
2. Click: **Network Access**
3. Add: `0.0.0.0/0` (Allow Access from Anywhere)
4. Wait 2-3 minutes
5. Test again

---

## 📊 What the Logs Will Tell You

After the fixes, check Vercel logs. You'll see:

**If Network Access is wrong**:
```
❌ MongoDB connection failed:
   Error: getaddrinfo ENOTFOUND...
   💡 Check: MongoDB Atlas Network Access - whitelist 0.0.0.0/0
```

**If Password is wrong**:
```
❌ MongoDB connection failed:
   Error: authentication failed
   💡 Check: MongoDB username/password in MONGODB_URI
```

**If Connection works**:
```
🔄 Attempting MongoDB connection...
✅ MongoDB Connected: dynamicqrgen.76sxpyb.mongodb.net
   Database: dynamicqrgen
```

---

**Check MongoDB Atlas Network Access FIRST - that's almost certainly the issue!**


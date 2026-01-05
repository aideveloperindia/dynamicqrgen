# MongoDB Diagnostic - Network Access is Set ✅

Since MongoDB Atlas Network Access is already set to `0.0.0.0/0`, let's check other issues:

## 🔍 Check These Issues:

### 1. **MongoDB URI in Vercel Environment Variables**
**Most Common Issue After Network Access**

**Check:**
1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for: `MONGODB_URI`
3. Verify the value is EXACTLY:
   ```
   mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority
   ```
4. Check it's enabled for: **Production**, **Preview**, **Development**
5. **Important**: After adding/updating, you MUST redeploy!

**Common Mistakes:**
- ❌ Extra spaces before/after
- ❌ Line breaks in the value
- ❌ Missing `?retryWrites=true&w=majority` at the end
- ❌ Wrong password
- ❌ Not enabled for all environments

---

### 2. **MongoDB Cluster Status**
**Check if cluster is running:**

1. Go to: https://cloud.mongodb.com/
2. Click: **Clusters** (left sidebar)
3. Check your cluster: `dynamicqrgen`
4. Status should be: **Green/Running**
5. If it shows **Paused** → Click **Resume** and wait 2-3 minutes

---

### 3. **MongoDB User Password**
**Verify password matches:**

1. Go to: MongoDB Atlas → **Database Access**
2. Find user: `nadnandagiri_db_user`
3. Check the password (you may need to reset it to see it)
4. Compare with password in Vercel `MONGODB_URI`
5. Password should be: `mgVt9t9eahqLRHUF`

**If password doesn't match:**
- Option 1: Update password in MongoDB Atlas, then update Vercel
- Option 2: Reset password in MongoDB Atlas, copy new password, update Vercel

---

### 4. **MongoDB User Permissions**
**Check user has correct permissions:**

1. Go to: MongoDB Atlas → **Database Access**
2. Find user: `nadnandagiri_db_user`
3. Check **Database User Privileges**:
   - Should have: **Read and write to any database**
   - OR: **Atlas admin** role
   - OR: Custom role with read/write to `dynamicqrgen` database

**If wrong permissions:**
- Click **Edit** on the user
- Change privileges to **Read and write to any database**
- Click **Update User**

---

### 5. **Vercel Environment Variables Not Loaded**
**After setting env vars, you MUST redeploy:**

1. Go to: Vercel Dashboard → Your Project
2. Click: **Deployments** tab
3. Click: **Redeploy** (three dots menu on latest deployment)
4. Or: Make a small code change and push to trigger redeploy

**Environment variables are only loaded on deployment!**

---

### 6. **Connection String Format Issues**
**Check for encoding/special characters:**

Your connection string should be:
```
mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority
```

**Common Issues:**
- Password has special characters that need URL encoding
- Extra spaces or line breaks
- Missing `mongodb+srv://` prefix
- Wrong cluster hostname

**If password has special characters:**
- Use URL encoding (e.g., `@` becomes `%40`, `#` becomes `%23`)
- Or change password to only use alphanumeric characters

---

### 7. **Check Vercel Logs for Specific Error**
**This will tell you exactly what's wrong:**

1. Go to: Vercel Dashboard → Your Project
2. Click: **Functions** tab
3. Click: **View Function Logs**
4. Look for MongoDB connection messages:
   - `🔄 Attempting MongoDB connection...`
   - `✅ MongoDB Connected: ...` (SUCCESS)
   - `❌ MongoDB connection failed:` (FAILURE - check error message)

**Error Messages Tell You:**
- `authentication failed` → Wrong password
- `timeout` or `ETIMEDOUT` → Network issue (but you said Network Access is set, so check cluster status)
- `ENOTFOUND` → Wrong hostname
- `MONGODB_URI not set` → Environment variable not loaded
- `IP not whitelisted` → Network Access issue (but you said it's set)

---

## 🧪 Test Connection Locally

Create a test file to verify your connection string works:

```javascript
// test-mongo-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 
  'mongodb+srv://nadnandagiri_db_user:mgVt9t9eahqLRHUF@dynamicqrgen.76sxpyb.mongodb.net/dynamicqrgen?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');
console.log('URI:', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ Connected successfully!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:');
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    process.exit(1);
  });
```

Run: `node test-mongo-connection.js`

If this works locally but not on Vercel → Environment variable issue
If this fails locally → Connection string or MongoDB config issue

---

## 📋 Complete Checklist:

Since Network Access is set, check:

- [ ] `MONGODB_URI` is set in Vercel environment variables
- [ ] `MONGODB_URI` value is correct (no typos, no spaces)
- [ ] `MONGODB_URI` is enabled for Production, Preview, Development
- [ ] Vercel deployment completed after setting env vars
- [ ] MongoDB cluster is running (not paused)
- [ ] MongoDB user password matches in Vercel
- [ ] MongoDB user has read/write permissions
- [ ] Checked Vercel logs for specific error message
- [ ] Tested connection locally (if possible)

---

## 🎯 Most Likely Issues (After Network Access):

1. **MongoDB URI not set in Vercel** (40% chance)
2. **Vercel not redeployed after setting env vars** (30% chance)
3. **Wrong password in connection string** (20% chance)
4. **Cluster is paused** (5% chance)
5. **User permissions wrong** (5% chance)

---

## 🔧 Quick Fix Steps:

1. **Verify MongoDB URI in Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Check `MONGODB_URI` exists and is correct
   - Enable for all environments

2. **Redeploy Vercel:**
   - Go to Deployments → Redeploy latest
   - Or push a small change to trigger redeploy

3. **Check Vercel Logs:**
   - Functions → View Function Logs
   - Look for MongoDB connection messages
   - The error message will tell you exactly what's wrong

4. **Verify MongoDB Atlas:**
   - Cluster is running
   - User password is correct
   - User has permissions

**Check Vercel logs first - they'll tell you exactly what's wrong!**


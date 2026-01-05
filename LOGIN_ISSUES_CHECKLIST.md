# Login & Dashboard Issues Checklist

## 🔍 Common Issues After Login

### Issue 1: Dashboard Not Loading
**Symptoms:**
- Blank page after login
- 500 error
- Redirects back to login

**Possible Causes:**
- MongoDB connection issue
- User data not found
- Session not saving properly

**Check:**
1. Vercel logs for errors
2. MongoDB connection status
3. User exists in database

---

### Issue 2: Missing User Data
**Symptoms:**
- Dashboard loads but shows "undefined" or empty fields
- Business name not showing
- Logo not displaying

**Possible Causes:**
- User object not properly passed to view
- Missing user data in database
- Template rendering issues

**Check:**
- User object in dashboard route
- Template variables (user.name, user.email, etc.)

---

### Issue 3: Links Not Showing
**Symptoms:**
- Links section empty
- "No links added" message when links exist

**Possible Causes:**
- Links query failing
- Links marked as inactive
- User ID mismatch

**Check:**
- Links query in dashboard route
- Link.isActive status
- userId matches req.user._id

---

### Issue 4: Subscription Status Wrong
**Symptoms:**
- Shows "Not subscribed" when subscribed
- Payment button not working
- QR code section not showing

**Possible Causes:**
- Subscription check logic
- Date comparison issues
- subscriptionActive flag not set

**Check:**
- subscriptionActive boolean
- subscriptionEndDate comparison
- Payment completion status

---

### Issue 5: Profile Update Not Working
**Symptoms:**
- Can't update business name
- Logo upload fails
- No error message shown

**Possible Causes:**
- File upload size limit
- Base64 conversion issue
- Database save failing

**Check:**
- Multer file size limit (2MB)
- Base64 conversion function
- User.save() success

---

### Issue 6: QR Code Not Generating
**Symptoms:**
- "Generate QR Code" button not working
- QR code not displaying after generation
- Error message unclear

**Possible Causes:**
- Subscription not active
- No links added
- QR generation failing

**Check:**
- Subscription status check
- Links count > 0
- QR code generation function

---

## 🧪 Testing Checklist

After logging in, verify:

- [ ] Dashboard loads without errors
- [ ] User name and email display correctly
- [ ] Business name field is editable
- [ ] Logo upload works
- [ ] Links section displays (even if empty)
- [ ] Can add new links
- [ ] Can edit existing links
- [ ] Can delete links
- [ ] Subscription status displays correctly
- [ ] Payment button works (if not subscribed)
- [ ] QR code section appears (if subscribed)
- [ ] Can generate QR code (if subscribed and has links)
- [ ] QR code displays after generation
- [ ] Public URL is shown correctly

---

## 🔧 Quick Fixes

### If Dashboard is Blank:
1. Check Vercel function logs
2. Verify MongoDB connection
3. Check if user exists: `User.findById(req.user._id)`

### If Data is Missing:
1. Check template variables: `user.name`, `user.email`, etc.
2. Verify user object is passed to render
3. Check for null/undefined checks in template

### If Links Don't Show:
1. Check query: `Link.find({ userId: req.user._id, isActive: true })`
2. Verify links exist in database
3. Check isActive flag

### If Subscription Wrong:
1. Check: `user.subscriptionActive && user.subscriptionEndDate > now`
2. Verify payment was completed
3. Check subscription dates

---

## 📋 Debug Steps

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Functions → Logs
   - Look for errors after login

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

3. **Check Database:**
   - Verify user exists
   - Check user data fields
   - Verify links exist

4. **Test Login Flow:**
   - Try Google OAuth login
   - Try email/password login
   - Check if both work

---

## 🚨 Most Common Issues

1. **Session Not Saving** - MongoDB session store issue
2. **User Data Missing** - User not found in database
3. **Links Query Failing** - Database connection issue
4. **Subscription Check Failing** - Date comparison issue
5. **Template Errors** - Undefined variables in EJS

---

**Please describe the specific issue you're experiencing so I can help fix it!**


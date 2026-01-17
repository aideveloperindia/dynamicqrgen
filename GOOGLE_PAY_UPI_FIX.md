# Google Pay "Invalid UPI" and "Could Not Load Banking Name" - Fix Guide

## Errors You're Seeing

1. ❌ **"Could not load banking name"**
2. ❌ **"UPI ID is invalid"**

## Possible Causes

### 1. UPI ID Format Issue ⚠️

**Your UPI ID:** `9912941214@okbizaxis`

**Issue:** The format `@okbizaxis` might not be recognized by Google Pay.

**Standard Axis Bank formats:**
- `@axisbank` - Standard Axis Bank UPI
- `@okaxis` - Axis Bank (alternative)
- `@okbizaxis` - **Business/merchant Axis Bank** (might not be recognized by all apps)

**Solution:**
- Verify with Axis Bank if `@okbizaxis` is the correct format
- Try using `@axisbank` or `@okaxis` if available
- Contact Axis Bank to confirm your business UPI ID format

### 2. Payee Name Mismatch ⚠️

**Your Payee Name:** `GENIPAPPA TECHNOLOGIES PRIVATE LIMITED`

**Issue:** Google Pay validates the payee name against bank's CBS (Core Banking System) records.

**Solution:**
- The payee name (`pn`) must **exactly match** the name registered in your bank account
- Check your bank account statement - use that exact name
- Remove any extra spaces, special characters
- If your bank account name is different, use that instead

### 3. UPI ID Not Verified/Active ⚠️

**Issue:** The UPI ID might not be fully activated or verified.

**Solution:**
- Contact Axis Bank to verify UPI ID is active
- Ensure UPI is enabled on your account
- Check if there are any pending verifications

---

## What We Fixed in Code

✅ **Parameter Ordering:** Google Pay prefers `pa, pn, cu, tn, tr, aid` order  
✅ **Unique Transaction Reference:** More unique `tr` with random suffix  
✅ **Payee Name Cleaning:** Removed trailing spaces and multiple spaces  
✅ **UPI ID Validation:** Validates format (must have @ symbol)  
✅ **Better Encoding:** Properly encodes all parameters  

---

## Action Items for You

### Step 1: Verify UPI ID Format
1. **Contact Axis Bank** customer care
2. **Ask:** "What is the correct UPI ID format for my business account?"
3. **Verify:** Is `@okbizaxis` correct, or should it be `@axisbank` or `@okaxis`?

### Step 2: Verify Payee Name
1. **Check your bank account statement**
2. **Find the exact account holder name** as registered
3. **Use that exact name** in the dashboard (case-sensitive, spaces matter)

### Step 3: Test with Different Formats

**Option A: Try with @axisbank**
```
upi://pay?pa=9912941214@axisbank&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

**Option B: Try with @okaxis**
```
upi://pay?pa=9912941214@okaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

**Option C: Keep @okbizaxis but verify with bank**
```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

### Step 4: Update Dashboard

1. **Go to Business Profile**
2. **Enter exact bank-registered name** in Payee Name field
3. **Verify UPI ID format** with bank
4. **Update and test**

---

## Testing Checklist

After updating:

- [ ] UPI ID format verified with bank
- [ ] Payee name matches bank account name exactly
- [ ] Test in Google Pay - should show bank name
- [ ] Test in PhonePe - should work
- [ ] Test in CRED - should work
- [ ] Test in BharatPe - should work

---

## Contact Axis Bank

**Axis Bank Customer Care:**
- **Phone:** 1800-419-5577
- **Ask:** 
  - "What is the correct UPI ID format for my business account?"
  - "Is @okbizaxis valid, or should I use @axisbank?"
  - "Verify my UPI ID: 9912941214@okbizaxis"
  - "What is my exact account holder name as registered?"

---

## Quick Fix to Try

**Update the link in dashboard with verified UPI ID format:**

If bank confirms it should be `@axisbank`:
```
upi://pay?pa=9912941214@axisbank&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

If bank confirms it should be `@okaxis`:
```
upi://pay?pa=9912941214@okaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

**Important:** Use the exact account holder name from your bank statement in `pn` parameter.

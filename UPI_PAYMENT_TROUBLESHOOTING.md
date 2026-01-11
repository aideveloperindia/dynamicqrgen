# UPI Payment Troubleshooting Guide

## Issue: Google Pay Opens But Payment Fails

### Symptoms:
- ✅ Google Pay app opens correctly
- ✅ Client name is displayed correctly
- ❌ Payment fails with "exceeded bank limit" even for ₹1

### Root Cause Analysis:

Since the app opens and name shows, **the URL format is CORRECT**. The issue is NOT with URL corruption.

### Possible Causes:

1. **Invalid `aid` Parameter (Most Likely)**
   - If the link has an `aid` parameter but it's wrong/invalid
   - Google Pay treats it as merchant payment
   - But validation fails because `aid` doesn't match a valid merchant account
   - **Solution**: Remove the `aid` parameter to use P2P payment (₹2000 limit)

2. **Account Restrictions**
   - The recipient's bank account has restrictions
   - Account might be frozen or have transaction limits
   - **Solution**: Contact the bank to check account status

3. **Mismatch Between UPI ID and Merchant Account**
   - The `aid` belongs to a different UPI ID
   - The `aid` is from someone else's merchant account
   - **Solution**: Use the correct `aid` for this UPI ID, or remove it

4. **Payee Name Mismatch**
   - The `pn` parameter doesn't match the actual account holder name
   - Some banks validate this strictly
   - **Solution**: Use the exact account holder name in `pn`

### How to Fix:

#### Option 1: Remove `aid` Parameter (Quick Fix)
If the link has `aid`, remove it to use P2P payment:

**Before (with aid - might fail):**
```
upi://pay?pa=username@paytm&pn=Name&aid=INVALID_AID&cu=INR
```

**After (without aid - P2P, ₹2000 limit):**
```
upi://pay?pa=username@paytm&pn=Name&cu=INR
```

#### Option 2: Use Correct `aid` Parameter
If you have a valid merchant account:
- Get the correct `aid` from your bank/payment gateway
- Ensure it matches your UPI ID
- Use it in the link

#### Option 3: Check Account Status
- Contact your bank
- Verify account is active
- Check for any restrictions
- Verify UPI is enabled

### Testing:

1. **Test with P2P Link (no `aid`):**
   ```
   upi://pay?pa=abhirammachamalla1289@oksbi&pn=Abhiram%20Machamalla&cu=INR
   ```
   - Should work with ₹2000 limit
   - If this works, the issue is with the `aid` parameter

2. **Test with Merchant Link (with `aid`):**
   ```
   upi://pay?pa=abhirammachamalla1289@oksbi&pn=Abhiram%20Machamalla&aid=VALID_AID&cu=INR
   ```
   - Should work without limit
   - If this fails, the `aid` is invalid

### Debugging:

Check server logs when payment link is clicked. You'll see:
```
=== UPI URL DEBUG ===
Original from DB: [URL]
Final URL: [URL]
Parameters: { pa: "...", pn: "...", aid: "..." }
Has aid: true/false
```

If `aid` is present and payments fail, **remove the `aid` parameter** from the saved link.

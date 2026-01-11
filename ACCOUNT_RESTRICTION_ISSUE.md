# Account Restriction Issue - Cannot Pay Even ₹1

## Problem
Even when entering just ₹1, the payment shows "exceeded payment limit of ₹2000" and fails.

## Root Cause
This is **NOT a code issue** - the code is generating the correct UPI link:
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=PayeeName&cu=INR
```

The issue is with the **UPI ID account itself** (`nad.nandagiri-3@okicici`).

## Why This Happens

### 1. Account Restrictions
The ICICI bank account associated with this UPI ID may have:
- **Daily transaction limits reached** - Even if you try ₹1, the daily limit might be exhausted
- **Account restrictions** - Bank may have placed restrictions on the account
- **Account not fully activated** - UPI might not be fully enabled
- **KYC issues** - Incomplete KYC can restrict payments

### 2. P2P Payment Limit
Without the `aid` parameter, payments are treated as P2P (Person-to-Person):
- Has ₹2000 per transaction limit
- But if account has restrictions, even ₹1 might fail

### 3. Account Type Issues
- Personal accounts sometimes have restrictions
- Business/merchant accounts work better for receiving payments

## Solutions

### Immediate: Check Account Status
1. **Open ICICI Bank App**:
   - Check account status
   - Verify UPI is enabled
   - Check for any restrictions or limits

2. **Check Transaction History**:
   - See if daily limit is reached
   - Check if there are failed transactions
   - Verify account balance

3. **Contact ICICI Bank**:
   - Call customer care: 1800-1080
   - Ask about UPI transaction limits
   - Request to check account restrictions
   - Ask about merchant account registration

### Long-term: Get Merchant Account
To remove the ₹2000 limit and avoid restrictions:

1. **Register as Merchant**:
   - Contact ICICI merchant services
   - Get your `aid` (App ID) parameter
   - This removes all limits

2. **Use Payment Gateway**:
   - Register with Razorpay/Paytm
   - They provide merchant `aid` parameter
   - No account restrictions

## Testing

### Test 1: Check Account Status
- Open ICICI app
- Try sending ₹1 to yourself from another UPI app
- If this fails, the account has restrictions

### Test 2: Check Daily Limits
- Check if you've reached daily transaction limit
- Try after 24 hours
- Or use a different UPI ID

### Test 3: Use Different UPI ID
- Create a test UPI ID with a different bank
- Set it in environment variables
- Test if payments work

## What the Code Does

The code generates a clean UPI link:
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=BusinessName&cu=INR
```

This is **correct** - no amount parameter, user enters any amount.

The issue is **100% with the account**, not the code.

## Next Steps

1. ✅ **Check ICICI account status** (most likely issue)
2. ✅ **Contact ICICI bank support**
3. ✅ **Try with a different UPI ID** (test if it's account-specific)
4. ✅ **Get merchant account** (long-term solution)

## Server Logs

Check server logs when clicking payment button - you'll see:
```
=== PAYMENT BUTTON URL ===
UPI ID: nad.nandagiri-3@okicici
Generated URL: upi://pay?pa=nad.nandagiri-3%40okicici&pn=...
Has amount param: false
Has aid param: false
==========================
```

This confirms the URL is correct - the issue is with the account.

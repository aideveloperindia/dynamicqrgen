# Payment Limit Issue - Troubleshooting Guide

## Issue
Payment button opens Google Pay correctly, but payment fails with "limit exceeded" even for ₹1.

## Root Cause Analysis

### Why This Happens:
1. **No `aid` Parameter**: The payment link is generated without the `aid` (App ID) parameter
   - Without `aid`, it's treated as **P2P (Person-to-Person) payment**
   - P2P payments have a ₹2000 limit per transaction
   - But if the account has restrictions, even ₹1 might fail

2. **Account Restrictions**: The UPI ID account (`nad.nandagiri-3@okicici`) might have:
   - Daily transaction limits reached
   - Account restrictions from the bank
   - Account not fully activated
   - KYC issues

3. **Bank-Specific Issues**: Some banks have restrictions on:
   - New accounts
   - Accounts with pending KYC
   - Accounts with transaction history issues

## Solutions

### Solution 1: Check Account Status (Most Likely)
1. **Check UPI ID Account**:
   - Open your bank's UPI app (ICICI in this case)
   - Check if there are any restrictions or limits
   - Verify account is fully activated

2. **Check Bank Account**:
   - Contact ICICI bank support
   - Ask about UPI transaction limits
   - Verify account status

3. **Test with Different UPI App**:
   - Try PhonePe or Paytm instead of Google Pay
   - Sometimes different apps handle restrictions differently

### Solution 2: Use Merchant Account with `aid` Parameter
If you have a merchant account:
1. Get your `aid` (App ID) from your payment gateway or bank
2. In dashboard, set UPI ID as: `nad.nandagiri-3@okicici&aid=YOUR_APP_ID`
   - Or paste the full merchant UPI URL
3. The system will automatically extract and use the `aid` parameter

### Solution 3: Test with Different UPI ID
1. Create a test UPI ID with a different bank
2. Set it in the dashboard
3. Test if payments work

## How to Debug

### Check Server Logs
When you click the payment button, check server logs for:
```
=== PAYMENT BUTTON DEBUG ===
UPI Configuration: {
  finalUpiId: 'nad.nandagiri-3@okicici',
  hasAid: false,
  aidValue: 'NONE'
}
Generated UPI URL: upi://pay?pa=nad.nandagiri-3@okicici&pn=...
```

### Check Generated URL
The diagnostic info is in the HTML source. View page source to see:
- What UPI ID is being used
- Whether `aid` parameter is present
- The exact URL being generated

## Next Steps

1. **Immediate**: Check your ICICI bank account status and UPI limits
2. **Short-term**: Test with a different UPI ID or bank
3. **Long-term**: Set up a merchant account with `aid` parameter for unlimited payments

## Testing Checklist

- [ ] Check ICICI bank account status
- [ ] Verify UPI is fully activated
- [ ] Check daily transaction limits
- [ ] Test with PhonePe/Paytm apps
- [ ] Try with a different UPI ID
- [ ] Check server logs for generated URL
- [ ] Contact bank support if needed

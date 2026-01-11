# Payment Limit Fix - App ID (aid) Support

## Problem
Users were unable to pay even ₹1, receiving "payment limit exceeded" errors. This happens because UPI links without the `aid` (App ID) parameter are treated as **P2P (Person-to-Person) payments**, which have restrictions.

## Solution Implemented
Added full support for the `aid` parameter in the payment system:

### 1. **User Model** (`models/User.js`)
- Added `upiAid` field to store the App ID parameter
- This allows each client to have their own merchant `aid`

### 2. **Dashboard Route** (`routes/dashboard.js`)
- Automatically extracts `aid` from full UPI URLs if pasted
- Accepts `aid` as a separate field
- Preserves `aid` when saving profile

### 3. **Payment Button Route** (`routes/public.js`)
- Includes `aid` parameter in generated UPI links if available
- Logs whether `aid` is present for debugging
- Generates merchant payment links (no limit) when `aid` is present

### 4. **Dashboard UI** (`views/dashboard.ejs`)
- Added `aid` input field with clear instructions
- Shows status indicator (green if `aid` is set, orange if not)
- Explains how to get `aid` from bank/payment gateway

## How It Works

### Without `aid` (P2P Payment - Has Limits):
```
upi://pay?pa=your.id@bank&pn=YourName&cu=INR
```
- Treated as personal payment
- May have ₹2000 limit or other restrictions
- Payments may fail even for small amounts

### With `aid` (Merchant Payment - No Limits):
```
upi://pay?pa=your.id@bank&pn=YourName&aid=YOUR_APP_ID&cu=INR
```
- Treated as merchant/business payment
- No transaction limits
- Users can pay any amount

## What Clients Need to Do

### Option 1: Get `aid` from Bank/Payment Gateway
1. **Contact your bank's UPI merchant services**
   - Ask for UPI merchant registration
   - They will provide your App ID (`aid`)

2. **If using Razorpay/Paytm**
   - Register as a merchant
   - They provide the `aid` parameter

3. **Register with NPCI**
   - Register as a UPI merchant
   - You'll receive your App ID (`aid`)

### Option 2: Paste Full UPI URL
1. If you have a full UPI URL with `aid`, paste it in the UPI ID field:
   ```
   upi://pay?pa=your.id@bank&pn=YourName&aid=YOUR_APP_ID&cu=INR
   ```
2. The system will automatically extract:
   - UPI ID (`pa` parameter)
   - App ID (`aid` parameter)

### Option 3: Enter Separately
1. Enter your UPI ID in the "Your UPI ID" field
2. Enter your `aid` in the "App ID (aid)" field
3. Save profile

## Testing

### Check Current Status
1. Go to dashboard
2. Look at the UPI ID field - it shows:
   - ✅ Green box: `aid` is configured (no limits)
   - ⚠️ Orange box: No `aid` (₹2000 limit applies)

### Test Payment
1. Click "Pay Now" button on public page
2. Check server logs for:
   ```
   === PAYMENT BUTTON URL ===
   AID Parameter: YOUR_AID or NONE (P2P - ₹2000 limit)
   Payment Type: MERCHANT (No limit) or P2P (₹2000 limit)
   ```

## Important Notes

1. **`aid` is Bank-Specific**: Each bank provides its own `aid` for merchant accounts
2. **`aid` is UPI ID-Specific**: The `aid` must match the UPI ID (can't use someone else's `aid`)
3. **Merchant Registration Required**: To get `aid`, you typically need to register as a merchant
4. **Without `aid`**: Payments may work but with limits (varies by bank)

## Next Steps

1. **For Clients with Payment Issues**:
   - Get your `aid` from your bank or payment gateway
   - Add it in the dashboard
   - Test payments again

2. **For Testing**:
   - Use a test UPI ID with a valid `aid`
   - Verify payments work without limits
   - Check server logs to confirm `aid` is included

## Environment Variables

You can also set default `aid` in environment variables:
- `UPI_AID`: Default App ID for clients who don't set their own

## Technical Details

### UPI Link Generation Priority
1. User's `upiAid` field (if set)
2. Environment variable `UPI_AID` (if set)
3. No `aid` (P2P payment with limits)

### URL Format
- **P2P**: `upi://pay?pa=UPI_ID&pn=PAYEE_NAME&cu=INR`
- **Merchant**: `upi://pay?pa=UPI_ID&pn=PAYEE_NAME&aid=APP_ID&cu=INR`

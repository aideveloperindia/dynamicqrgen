# UPI Merchant Payment Solution - Remove ₹2000 Limit

## Problem
When clients add UPI payment links, users face a ₹2000 transaction limit. This happens because UPI links without the `aid` (App ID) parameter are treated as **Peer-to-Peer (P2P) payments**, which have a ₹2000 limit.

## Solution Implemented

### 1. Automatic UPI Link Formatting
- **Location**: `routes/dashboard.js` - `formatUPILinkAsMerchant()` function
- **What it does**: Automatically detects UPI links and formats them properly
- **Key feature**: **Preserves the `aid` parameter** if it's already in the link
- **Result**: All UPI parameters are preserved, ensuring merchant payments work correctly

### 2. Real-Time UI Guidance
- **Location**: `views/dashboard.ejs` - UPI Info Box
- **What it does**: Shows helpful information when users enter UPI links
- **Features**:
  - Detects UPI links automatically
  - Shows warning if `aid` is missing (₹2000 limit applies)
  - Shows success message if `aid` is present (no limit)
  - Provides instructions on how to get the `aid` parameter
  - Shows example merchant UPI link format

### 3. How It Works

#### When Client Adds UPI Link:
1. Client enters UPI link in dashboard
2. System detects it's a UPI link
3. Info box appears with guidance
4. System automatically formats the link to preserve all parameters
5. If `aid` is present, it's preserved
6. Link is saved with proper formatting

#### Example Links:

**Without `aid` (₹2000 limit):**
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=YourName&cu=INR
```

**With `aid` (No limit - Merchant payment):**
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=YourName&aid=YOUR_APP_ID&cu=INR
```

## How to Get the `aid` Parameter

The `aid` (App ID) is required for merchant payments. Clients can get it from:

1. **Bank's UPI Merchant Services**
   - Contact your bank (ICICI, SBI, HDFC, etc.)
   - Request UPI merchant registration
   - They will provide your App ID

2. **Payment Gateway Providers**
   - **Razorpay**: Provides `aid` when you register as a merchant
   - **Paytm**: Provides merchant UPI credentials
   - **PhonePe**: Merchant onboarding provides App ID

3. **NPCI Direct Registration**
   - Register as a merchant with NPCI
   - Get your official App ID for UPI merchant payments

## Current Status

✅ **System automatically preserves `aid` parameter** if present in links
✅ **UI guidance helps clients understand the requirement**
✅ **Real-time feedback shows if link has `aid` or not**
✅ **All UPI parameters are preserved** (pa, pn, am, cu, aid, tn, tr)

## Next Steps for Clients

1. **Get your `aid` parameter** from your bank or payment gateway
2. **Add it to your UPI link** when creating payment links
3. **Format**: `upi://pay?pa=YOUR_UPI_ID&pn=YourName&aid=YOUR_APP_ID&cu=INR`
4. **Test**: Users should be able to pay any amount without ₹2000 limit

## Testing

1. Add a UPI link **without** `aid`:
   - Info box shows warning about ₹2000 limit
   - Link is saved but will have limit

2. Add a UPI link **with** `aid`:
   - Info box shows success message
   - Link is saved with `aid` preserved
   - Users can pay any amount

3. Edit existing UPI link:
   - Info box appears automatically
   - Shows current status (has `aid` or not)

## Technical Details

### Code Changes:
- `routes/dashboard.js`: Added `formatUPILinkAsMerchant()` function
- `views/dashboard.ejs`: Added UPI info box and `checkUPILink()` JavaScript function
- Automatic parameter preservation ensures merchant payments work correctly

### UPI Parameters Preserved:
- `pa` - Payee Address (UPI ID) - Required
- `pn` - Payee Name - Required
- `am` - Amount (optional)
- `cu` - Currency (default: INR)
- `aid` - **App ID (critical for merchant payments)**
- `tn` - Transaction note (optional)
- `tr` - Transaction reference (optional)

## Result

✅ **System is ready** to handle merchant UPI payments
✅ **Clients get guidance** on how to set up unlimited payments
✅ **Existing links with `aid` are preserved** correctly
✅ **New links can be added** with proper merchant formatting

The only remaining step is for clients to **obtain their `aid` parameter** from their bank or payment gateway provider.

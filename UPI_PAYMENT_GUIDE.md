# UPI Payment Link Guide

## Understanding UPI Payment Links

### The ₹2000 Limit Issue

When a UPI payment link shows a ₹2000 limit, it's because the link is being treated as a **Peer-to-Peer (P2P) payment** instead of a **Merchant payment**.

### Key Difference Between P2P and Merchant Payments

**P2P Payment (₹2000 limit):**
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=YourName&cu=INR
```
- Missing `aid` parameter
- Treated as personal payment
- Has ₹2000 transaction limit
- User must enter amount manually

**Merchant Payment (No limit):**
```
upi://pay?pa=abhirammachamalla1289@oksbi&pn=Abhiram%20Machamalla&aid=uGICAgID13IaAGA
```
- Has `aid` (App ID) parameter
- Treated as merchant/business payment
- No transaction limit
- User can enter any amount

## UPI Link Parameters

### Required Parameters:
- `pa` - Payee Address (UPI ID) - **REQUIRED**
- `pn` - Payee Name (display name) - **REQUIRED**

### Optional Parameters:
- `am` - Amount in rupees (pre-fills amount)
- `cu` - Currency (default: INR)
- `aid` - **App ID (for merchant payments - removes ₹2000 limit)** ⚠️ **CRITICAL**
- `tn` - Transaction note/description
- `tr` - Transaction reference ID

## How to Get the `aid` Parameter

The `aid` (App ID) parameter is specific to each merchant and must be obtained from:

1. **Your Bank**: Contact your bank's UPI merchant services
2. **Payment Gateway**: If using Razorpay, Paytm, etc., they provide the `aid`
3. **UPI Merchant Registration**: Register as a merchant with NPCI to get your App ID

### Example Complete Merchant UPI Link:
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=Your%20Business%20Name&am=999&cu=INR&aid=YOUR_APP_ID_HERE
```

## Testing Your UPI Links

### Test Link 1 (P2P - Has ₹2000 limit):
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=YourName&cu=INR
```

### Test Link 2 (Merchant - No limit):
```
upi://pay?pa=nad.nandagiri-3@okicici&pn=YourName&am=999&cu=INR&aid=YOUR_APP_ID
```

## How to Add UPI Links in Client Dashboard

1. Go to client dashboard
2. Click "Add New Link"
3. Select "Custom" category
4. Enter display name (e.g., "Pay Now")
5. Paste your complete UPI link (with `aid` parameter if available)
6. Save the link

## App Selector Behavior

When a user clicks a UPI payment link:
- **On Mobile**: Should show UPI app selector (Google Pay, PhonePe, Paytm, CRED, etc.)
- **On Desktop**: May open in browser or show QR code
- The system now uses multiple methods to ensure the app selector appears

## Troubleshooting

### Issue: Only one app opens (e.g., only CRED)
**Solution**: The code has been updated to use multiple methods to trigger the app selector. If it still doesn't work, ensure:
- The link is in correct `upi://` format
- All parameters are properly URL-encoded
- The device has multiple UPI apps installed

### Issue: ₹2000 limit appears
**Solution**: Add the `aid` parameter to your UPI link. Contact your bank or payment gateway to obtain your App ID.

### Issue: App selector doesn't show
**Solution**: 
- Ensure the link uses `upi://` protocol (not `https://`)
- Check that all parameters are properly encoded
- Try the manual fallback link shown on the page

## Best Practices

1. **Always include `aid` parameter** for merchant payments (removes ₹2000 limit)
2. **Use proper URL encoding** for special characters in names
3. **Test on multiple devices** to ensure compatibility
4. **Provide manual fallback** link for users who can't open apps automatically
5. **Include transaction note (`tn`)** for better payment tracking

## Current Implementation

The system now:
- ✅ Preserves ALL UPI parameters including `aid`
- ✅ Uses multiple methods to open UPI apps
- ✅ Shows app selector on mobile devices
- ✅ Provides fallback options if automatic opening fails
- ✅ Properly encodes all URL parameters

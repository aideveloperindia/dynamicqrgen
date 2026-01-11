# Payment Button Feature

## Overview
Instead of clients entering complex UPI payment links, we now have a simple **Payment Button** that generates UPI links on-demand. This eliminates URL corruption issues and simplifies the user experience.

## How It Works

### For Clients (Dashboard)
1. **Optional UPI ID Setup**: Clients can optionally set their UPI ID in the dashboard profile section
   - If not set, uses the default UPI ID from environment variables
   - If set, uses the client's custom UPI ID
   - Can paste a full UPI URL (we'll extract the UPI ID and `aid` parameter if present)

2. **Optional Payee Name**: Clients can set a custom payee name for UPI payments
   - If not set, uses business name
   - This is the name shown when users pay

### For End Users (Public Page)
1. **Payment Button**: A prominent "Pay Now" button is always visible on the client's public page
2. **Click to Pay**: When clicked, it opens the user's UPI app (Google Pay, PhonePe, Paytm, etc.)
3. **Enter Amount**: User can enter any amount they want to pay
4. **No URL Corruption**: Since the link is generated on-demand, there's no URL corruption

## Benefits

✅ **Simplified Client Experience**: No need to enter complex UPI links
✅ **No URL Corruption**: Links are generated fresh each time
✅ **Works Reliably**: No issues with URL encoding/decoding
✅ **Flexible**: Clients can use default UPI ID or set their own
✅ **Merchant Payments**: If client has `aid` parameter, it's automatically included

## Technical Details

### Routes
- **`GET /p/:slug/pay`**: Generates UPI link on-demand and opens payment app

### User Model Fields
- `upiId` (optional): Client's custom UPI ID
- `upiPayeeName` (optional): Custom payee name for UPI payments

### UPI Link Generation Priority
1. User's custom `upiId` (if set)
2. Environment variable `UPI_ID` (if set)
3. Default: `nad.nandagiri-3@okicici`

### Payee Name Priority
1. User's custom `upiPayeeName` (if set)
2. User's `businessName` (if set)
3. Environment variable `UPI_PAYEE_NAME` (if set)
4. User's `name` (fallback)
5. Default: `Merchant`

## Payment Link Format

Generated UPI link format:
```
upi://pay?pa=UPI_ID&pn=PAYEE_NAME&cu=INR
```

If client's UPI ID contains an `aid` parameter (for merchant payments):
```
upi://pay?pa=UPI_ID&pn=PAYEE_NAME&cu=INR&aid=APP_ID
```

## Migration Notes

- **Old Payment Links**: Existing payment links in the database are still supported but hidden on the public page
- **Backward Compatible**: The old redirect route (`/p/:slug/redirect/:linkId`) still works for existing links
- **No Breaking Changes**: Clients can still add payment links if they want, but the button is the primary method

## Testing

1. **Test with Default UPI ID**: Don't set a custom UPI ID, verify it uses the default
2. **Test with Custom UPI ID**: Set a custom UPI ID, verify it uses that
3. **Test with Full UPI URL**: Paste a full UPI URL with `aid`, verify it extracts correctly
4. **Test Payment Flow**: Click payment button, verify UPI app opens, verify payment works

## Future Enhancements

- Add option to pre-fill amount (if needed)
- Add transaction notes support
- Add payment analytics (track payment button clicks)

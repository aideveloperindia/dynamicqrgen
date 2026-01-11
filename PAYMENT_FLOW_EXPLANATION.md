# Payment Flow Explanation

## Two Different Payment Flows

### 1. **Subscription Payment** (Client → Our Company)
- **Purpose**: Client pays ₹999/year subscription to us
- **Route**: `/payment/pay` or `/payment/create-order`
- **Method**: Razorpay Payment Links (or manual payment)
- **Who pays**: Client
- **Who receives**: Our company

### 2. **Client Payment** (Client's Customer → Client)
- **Purpose**: Client's customers pay the client directly
- **Route**: `/p/:slug/pay`
- **Method**: Direct UPI link (like shop QR codes)
- **Who pays**: Client's customer
- **Who receives**: Client (to their UPI ID)

## Current Implementation

### Subscription Payment (₹999)
- Uses Razorpay Payment Links API
- Professional payment page
- Multiple payment methods (UPI, cards, etc.)
- No limits

### Client Payment (Direct UPI)
- Uses direct `upi://pay` links
- Opens UPI app directly (like shop QR codes)
- User enters amount
- Works with all UPI apps
- **Issue**: Without `aid` parameter, treated as P2P (₹2000 limit)

## The Problem

When client's customer clicks "Pay Now" button:
- ❌ **Without `aid`**: Treated as P2P → ₹2000 limit → Payment failures
- ✅ **With `aid`**: Treated as merchant payment → No limits → Works perfectly

## The Solution

### For Clients:
1. **Enter UPI ID** in dashboard (e.g., `yourname@paytm`)
2. **Enter App ID (aid)** in dashboard (e.g., `uGICAgID13IaAGA`)
   - Get `aid` from bank or payment gateway
   - This makes payments merchant payments (no limits)

### For Client's Customers:
1. Click "Pay Now" button
2. UPI app opens directly (like shop QR codes)
3. Enter amount and pay
4. Payment goes directly to client's UPI ID
5. No limits if client has `aid` configured

## How to Get `aid` Parameter

Clients need to get their App ID (`aid`) from:
1. **Bank's UPI Merchant Services**
   - Contact bank (ICICI, HDFC, SBI, etc.)
   - Register as merchant
   - Get App ID

2. **Payment Gateway** (Razorpay, Paytm, etc.)
   - Register as merchant
   - They provide App ID

3. **NPCI**
   - Register as UPI merchant
   - Get official App ID

## Flow Diagram

```
Client's Customer
    │
    ├─> Scans QR Code
    │   └─> Opens: /p/:slug
    │
    └─> Clicks "Pay Now" Button
        └─> Opens: /p/:slug/pay
            └─> Generates: upi://pay?pa=CLIENT_UPI_ID&pn=CLIENT_NAME&aid=CLIENT_AID&cu=INR
                └─> Opens UPI App Directly
                    └─> Customer enters amount
                        └─> Pays to Client's UPI ID
```

## Key Points

1. **Razorpay Payment Links** = Only for subscription payments (₹999)
2. **Direct UPI Links** = For client's customer payments (like shop QR codes)
3. **`aid` Parameter** = Required to remove ₹2000 limit
4. **Without `aid`** = P2P payment (has limits)
5. **With `aid`** = Merchant payment (no limits)

## Testing

### Test Without `aid`:
- Payment link: `upi://pay?pa=client@bank&pn=ClientName&cu=INR`
- Result: P2P payment, ₹2000 limit, may fail

### Test With `aid`:
- Payment link: `upi://pay?pa=client@bank&pn=ClientName&aid=APP_ID&cu=INR`
- Result: Merchant payment, no limits, works perfectly

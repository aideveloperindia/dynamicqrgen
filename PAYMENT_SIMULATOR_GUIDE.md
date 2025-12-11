# Payment Simulator - Demo Mode Guide

## 🎭 What is Payment Simulator?

Instead of opening real payment apps (Google Pay/PhonePe/Paytm), the QR code can show a **custom payment simulator** that:
- ✅ Looks like the real payment app
- ✅ Lets investor enter any amount (e.g., ₹1000)
- ✅ Shows fake "Payment Successful" confirmation
- ✅ **No real money is sent** (it's all simulated)

## 🚀 How to Enable Demo Mode

### Option 1: Generate QR with Demo Mode

```bash
DEMO_MODE=true BASE_URL=https://your-ngrok-url.ngrok.io npm run generate-qr
```

This generates a QR code that automatically uses the payment simulator.

### Option 2: Add Query Parameter to URL

If you already have a QR code, you can add `?demo=true` to the URL:
```
https://your-ngrok-url.ngrok.io/p/SHARED1?demo=true
```

### Option 3: Enable Globally (Environment Variable)

Start server with:
```bash
DEMO_MODE=true npm start
```

Then all QR scans will use the simulator.

## 📱 How It Works

### Normal Mode (Real Payment Apps)
1. Investor scans QR with Google Pay
2. Real Google Pay app opens
3. UPI ID is prefilled
4. Investor can enter amount
5. **But**: We can't show fake confirmations in real apps

### Demo Mode (Payment Simulator)
1. Investor scans QR with Google Pay
2. **Custom payment page opens** (looks like Google Pay)
3. Shows merchant name and UPI ID
4. Investor enters amount (e.g., ₹1000)
5. Clicks "Pay Now"
6. **Shows fake "Payment Successful" screen** ✅
7. Shows transaction ID, time, amount, etc.
8. **No real money is sent** (it's all simulated)

## 🎬 Investor Demo Flow with Simulator

1. **"Let me scan with Google Pay"**
   - Investor scans QR
   - Custom payment page opens (looks like Google Pay)
   - Shows: "Merchant A - Coffee Shop"
   - Shows: "nad.nandagiri-3@okicici"
   - Investor enters: ₹1000
   - Clicks "Pay Now"
   - **Shows: "Payment Successful! ₹1,000"**
   - Shows transaction ID, time, etc.
   - **Say:** "Notice how it shows a complete payment flow, but this is a demo - no real money is sent"

2. **"Now with PhonePe"**
   - Same flow, but page looks like PhonePe
   - Investor enters ₹500
   - Shows success screen
   - **Say:** "Same QR, different app styling, same demo experience"

3. **"With Paytm"**
   - Same flow, Paytm styling
   - Investor enters ₹2000
   - Shows success screen

## ✨ Features of Payment Simulator

- **App-Specific Styling**: Looks like Google Pay/PhonePe/Paytm
- **Amount Input**: Investor can enter any amount
- **Quick Amount Buttons**: ₹100, ₹500, ₹1000
- **Fake Success Screen**: Shows transaction ID, time, merchant details
- **Demo Badge**: Clearly shows "DEMO MODE - No Real Payment"
- **Reset Button**: Can make multiple "payments" for demo

## 🔒 Safety

- ✅ **No real payments** - Everything is simulated
- ✅ **No API calls** - All client-side
- ✅ **No money movement** - Pure UI demo
- ✅ **Clear labeling** - "DEMO MODE" badge visible

## 📋 Comparison

| Feature | Real Payment Apps | Payment Simulator |
|---------|------------------|-------------------|
| Opens real app | ✅ | ❌ |
| Shows UPI ID | ✅ | ✅ |
| Enter amount | ✅ | ✅ |
| Show success | ❌ (can't control) | ✅ (fake) |
| Real money | ⚠️ (if amount > 0) | ✅ (never) |
| Demo safe | ⚠️ (amount=0 only) | ✅ (always) |

## 🎯 Recommendation

**For Investor Demo:** Use **Payment Simulator** (Demo Mode)
- ✅ Shows complete payment flow
- ✅ Investor can enter any amount
- ✅ Shows fake success confirmation
- ✅ 100% safe (no real payments possible)
- ✅ More impressive demo

**For Real Testing:** Use **Normal Mode**
- ✅ Tests actual payment app integration
- ✅ Shows real UPI intents work
- ⚠️ But can't show fake confirmations

## 🚀 Quick Start

```bash
# 1. Start server
npm start

# 2. Start ngrok
ngrok http 4000

# 3. Generate QR with demo mode
DEMO_MODE=true BASE_URL=https://your-ngrok-url.ngrok.io npm run generate-qr

# 4. Scan QR with payment app
# Will show payment simulator instead of real app!
```

## 💡 Pro Tip

You can have **both**:
- Generate one QR with demo mode for investor demo
- Generate one QR without demo mode for real testing

Just use different filenames (the script adds `_demo` suffix automatically).

---

**Ready to demo?** Enable demo mode and show the investor a complete, fake payment flow! 🎭




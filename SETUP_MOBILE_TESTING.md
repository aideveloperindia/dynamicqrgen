# Mobile Testing Setup - Quick Guide

## ⚠️ Why Localhost Doesn't Work on Phone

The QR code currently points to `http://localhost:4000/p/SHARED1`

**Problem:** When you scan from your phone:
- Phone tries to access `localhost:4000`
- But `localhost` on your phone = your phone, not your computer
- So it fails or opens a browser error

**Solution:** Use ngrok to create a public URL that your phone can access

## 🚀 Quick Setup (3 Steps)

### Step 1: Start ngrok

Open a **new terminal** and run:
```bash
ngrok http 4000
```

You'll see something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:4000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### Step 2: Generate QR with ngrok URL

In your project terminal, run:
```bash
BASE_URL=https://abc123.ngrok.io npm run generate-qr
```

Replace `abc123.ngrok.io` with your actual ngrok URL.

### Step 3: Scan from Phone

Now when you scan the QR code from your phone:
1. Phone accesses the ngrok URL
2. Your server detects which app scanned (Google Pay/PhonePe/etc.)
3. Server redirects to UPI intent
4. Google Pay opens with your UPI ID prefilled! ✅

## 📱 How It Works

```
Phone scans QR
  ↓
QR contains: https://abc123.ngrok.io/p/SHARED1
  ↓
Phone requests that URL
  ↓
ngrok forwards to your localhost:4000
  ↓
Your server detects: "This is Google Pay!"
  ↓
Server redirects to: upi://pay?pa=nad.nandagiri-3@okicici&am=0
  ↓
Google Pay app opens with UPI prefilled! 🎉
```

## 🔧 Alternative: Use ngrok's Web Interface

If ngrok is running, you can also:
1. Go to `http://127.0.0.1:4040` (ngrok web interface)
2. Copy the forwarding URL
3. Use that URL to generate QR

## ✅ Checklist

- [ ] Server running (`npm start`)
- [ ] ngrok running (`ngrok http 4000`)
- [ ] Copied ngrok HTTPS URL
- [ ] Generated QR with ngrok URL
- [ ] Scanned QR from phone with Google Pay
- [ ] Google Pay opens with UPI prefilled!

## 🎯 Quick Command Summary

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Start ngrok
ngrok http 4000

# Terminal 1: Generate QR (after copying ngrok URL)
BASE_URL=https://your-ngrok-url.ngrok.io npm run generate-qr

# Scan QR from phone - Google Pay should open!
```

---

**Remember:** The QR code must point to a public URL (ngrok) for mobile testing. Localhost only works on your computer!




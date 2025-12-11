# Quick Start Guide

Get the QR Multiplex demo running in 3 steps!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Server

```bash
npm start
```

Server will run on `http://localhost:4000`

## Step 3: Test It

### Option A: Test in Browser
Open: `http://localhost:4000/p/SHARED1`

### Option B: Test with Mobile (ngrok)

1. **Start ngrok** (in a new terminal):
   ```bash
   ngrok http 4000
   ```

2. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

3. **Generate QR code**:
   ```bash
   BASE_URL=https://abc123.ngrok.io npm run generate-qr
   ```

4. **Scan the QR** with your phone:
   - Open `public/qr/SHARED1.png` on your computer
   - Scan with Google Pay, PhonePe, Paytm, Google Lens, or Camera

## What to Expect

- **Google Pay/PhonePe/Paytm**: Opens payment app with merchant UPI prefilled (amount = 0)
- **Google Lens**: Opens Google Review page
- **Camera**: Shows landing page with Wi-Fi, reviews, menu, coupons, and payment options

## Admin Panel

Access at: `http://localhost:4000/admin`

Edit merchant data, UPI intents, Wi-Fi credentials, and more.

## Need Help?

- See `README.md` for full documentation
- See `TESTING.md` for curl commands and testing scenarios
- See `DEMO_SCRIPT.md` for investor presentation guide

## Troubleshooting

**Port already in use?**
```bash
PORT=4001 npm start
```

**QR code not scanning?**
- Make sure you're using the ngrok HTTPS URL (not localhost)
- QR code must point to a publicly accessible URL for mobile testing

**App not detected?**
- Check server logs for `[DETECTION]` messages
- Verify headers are being sent correctly
- See `TESTING.md` for curl commands to test detection

---

**That's it! You're ready to demo.** 🚀






# Investor Demo Setup - Quick Guide

## ✅ What Works WITHOUT Real Data

- ✅ **Google Lens** → Opens Google Review page (works with placeholders)
- ✅ **Camera** → Shows Wi-Fi password (works with demo data)

## ⚠️ What Needs Real UPI ID

- ⚠️ **Google Pay/PhonePe/Paytm** → Need **real UPI ID** to open payment apps

**Why?** Payment apps won't recognize placeholder UPI IDs like `merchant_a@upi`. They need a real, registered UPI ID to open.

## 🚀 Quick Setup (2 Minutes)

### Step 1: Get Your UPI ID

**Option A: From Google Pay**
1. Open Google Pay app
2. Tap profile picture (top right)
3. Your UPI ID is shown (e.g., `yourname@okaxis`)

**Option B: From PhonePe**
1. Open PhonePe app
2. Profile → Payment Settings
3. Your UPI ID is shown

**Option C: From Paytm**
1. Open Paytm app
2. Profile → Payment Settings
3. Your UPI ID is shown

### Step 2: Add UPI ID to All Merchants

**Easy Way (Recommended):**
```bash
npm run setup-upi YOUR_UPI_ID
```

**Example:**
```bash
npm run setup-upi demo@paytm
```

This automatically updates all 5 merchants with your UPI ID!

**Manual Way:**
1. Go to `http://localhost:4000/admin`
2. Edit each merchant's UPI intents
3. Replace `merchant_x@upi` with your UPI ID
4. Save

### Step 3: Test It

1. **Start server:**
   ```bash
   npm start
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 4000
   ```

3. **Generate QR:**
   ```bash
   BASE_URL=https://your-ngrok-url.ngrok.io npm run generate-qr
   ```

4. **Test on phone:**
   - Scan with Google Pay → Should open with your UPI ID
   - Scan with PhonePe → Should open with your UPI ID
   - Scan with Paytm → Should open with your UPI ID
   - Scan with Google Lens → Opens Google Review
   - Scan with Camera → Shows Wi-Fi password

## 🎬 Investor Demo Flow

1. **Show QR code** on screen/print

2. **"Let me scan with Google Pay"**
   - Investor scans with Google Pay
   - Google Pay opens
   - Your UPI ID is prefilled
   - Amount shows ₹0
   - **Say:** "Notice the payment app opened automatically with the merchant's UPI ID. Amount is ₹0 for demo safety."

3. **"Now with PhonePe"**
   - Investor scans with PhonePe
   - PhonePe opens with UPI ID
   - Amount ₹0
   - **Say:** "Same QR, different app, different routing"

4. **"With Google Lens"**
   - Investor scans with Google Lens
   - Browser opens Google Review page
   - **Say:** "For reviews, it routes to Google Reviews"

5. **"With regular camera"**
   - Investor scans with phone camera
   - Landing page loads
   - Shows Wi-Fi password
   - **Say:** "For regular scans, users get the full experience - Wi-Fi, reviews, menu, coupons"

## 🔒 Safety Guarantees

- ✅ **Amount = ₹0** (`am=0` in all UPI intents)
- ✅ **No money can be sent** (zero amount)
- ✅ **Investor can only see** the payment screen
- ✅ **Completely safe** for demo

## ❓ FAQ

**Q: Can I use my personal UPI ID?**
A: Yes! It's safe because amount=0. No money can be sent.

**Q: What if I don't have a UPI ID?**
A: Create one in any payment app (Google Pay/PhonePe/Paytm) - it takes 2 minutes.

**Q: Can I use different UPI IDs for different merchants?**
A: Yes! Edit `data/merchants.json` or use admin panel to set different UPI IDs.

**Q: Will the investor's money be at risk?**
A: No! Amount is always ₹0. They can only see the payment screen, not send money.

## 📋 Pre-Demo Checklist

- [ ] UPI ID added to all merchants (`npm run setup-upi YOUR_UPI_ID`)
- [ ] Server running (`npm start`)
- [ ] ngrok running (for mobile testing)
- [ ] QR code generated with ngrok URL
- [ ] Tested Google Pay scan (opens payment app)
- [ ] Tested PhonePe scan (opens payment app)
- [ ] Tested Paytm scan (opens payment app)
- [ ] Tested Google Lens scan (opens review)
- [ ] Tested Camera scan (shows Wi-Fi)

## 🎯 Summary

**For investor demo, you need:**
1. ✅ One real UPI ID (yours is fine!)
2. ✅ Run: `npm run setup-upi YOUR_UPI_ID`
3. ✅ That's it!

**Everything else works with placeholders:**
- Google Review (placeholders work)
- Wi-Fi (demo data works)
- Menu/Coupon URLs (demo URLs work)

---

**Ready?** Just get your UPI ID and run the setup command! 🚀




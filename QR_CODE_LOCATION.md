# QR Code Location and Generation

## 📍 Where is the QR Code?

**Location:** 
```
/Users/nandagiriaditya/Documents/QR/public/qr/SHARED1.png
```

**Full path:**
```
public/qr/SHARED1.png
```

## 🎯 The QR Code

This is the **SINGLE QR code** that:
- Routes to all 5 merchants
- Detects which app scanned it (Google Pay, PhonePe, Paytm, Google Lens, Camera)
- Points to: `https://oneqrcode.vercel.app/p/SHARED1`

## 🔄 How to Generate/Regenerate QR Code

### Method 1: Using Default (Deployment URL)

```bash
npm run generate-qr
```

This generates QR code pointing to: `https://oneqrcode.vercel.app/p/SHARED1`

### Method 2: Using Custom URL

```bash
BASE_URL=https://your-custom-url.com npm run generate-qr
```

## 📁 Output Location

The QR code is always saved to:
```
public/qr/SHARED1.png
```

## ✅ Verify QR Code

To check what URL the QR code contains:

1. **Scan it with any QR scanner app**
2. **Or use online QR decoder**
3. **It should show:** `https://oneqrcode.vercel.app/p/SHARED1`

## 🎬 For Investor Demo

1. **Generate QR code:**
   ```bash
   npm run generate-qr
   ```

2. **Open the QR code:**
   ```bash
   open public/qr/SHARED1.png
   ```
   Or manually open: `public/qr/SHARED1.png`

3. **Display on screen or print**

4. **Investor scans** - It will work from any device!

## 📱 What the QR Code Does

When scanned:
- **Google Pay** → Opens Google Pay with UPI prefilled
- **PhonePe** → Opens PhonePe with UPI prefilled
- **Paytm** → Opens Paytm with UPI prefilled
- **Google Lens** → Opens Google Review page
- **Camera** → Shows landing page with Wi-Fi and options

---

**The QR code is at: `public/qr/SHARED1.png`**

**To generate it: `npm run generate-qr`**




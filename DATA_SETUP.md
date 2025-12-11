# Data Setup Guide

## 🎯 For Demo: No Real Data Needed!

**Good news:** The demo works perfectly with placeholder data. You don't need:
- ❌ Real UPI IDs
- ❌ Real Google Place IDs  
- ❌ API keys
- ❌ MongoDB or any database
- ❌ Any registrations

The current setup uses **placeholder data** that demonstrates the routing behavior perfectly.

## 📝 Current Placeholder Data

All 5 merchants currently use:

1. **UPI IDs**: `merchant_a@upi`, `merchant_b@upi`, etc. (placeholder)
2. **Google Place IDs**: Random Place IDs (placeholder)
3. **Wi-Fi**: Demo SSIDs and passwords
4. **URLs**: `example.com` placeholder URLs

## 🔄 If You Want to Use Real Data (Optional)

If you want to replace placeholders with real data for a more realistic demo, here's how:

### 1. Real UPI IDs

**Format:**
```
upi://pay?pa=YOUR_UPI_ID@paytm&pn=Merchant%20Name&am=0&cu=INR&tn=Payment
```

**Where to get:**
- Your UPI ID is your registered payment address (e.g., `yourname@paytm`, `yourname@ybl`, etc.)
- You can get it from your payment app settings

**Example:**
```json
"gpay_intent": "upi://pay?pa=coffeeshop@paytm&pn=Coffee%20Shop&am=0&cu=INR&tn=Demo%20Payment"
```

**Important:** Keep `am=0` (amount=0) for demo safety!

### 2. Real Google Place IDs

**How to find a Google Place ID:**
1. Go to https://www.google.com/maps
2. Search for your business location
3. Click on the location marker
4. In the URL, you'll see something like: `.../place/ChIJ3-SR6mGUrjsRqE4-MqX-TMQ/...`
5. The `ChIJ...` part is your Place ID

**Or use this tool:** https://developers.google.com/maps/documentation/places/web-service/place-id

**Example:**
```json
"google_place_id": "ChIJ3-SR6mGUrjsRqE4-MqX-TMQ"
```

### 3. Real Wi-Fi Credentials

Just replace with actual SSID and password:
```json
"wifi": {
  "ssid": "YourActualWiFiName",
  "password": "YourActualPassword"
}
```

### 4. Real Menu/Coupon URLs

Replace `example.com` URLs with your actual URLs:
```json
"menu_url": "https://yourwebsite.com/menu",
"coupon_url": "https://yourwebsite.com/coupon"
```

## 🛠️ How to Update Data

### Option 1: Edit JSON File Directly

Edit `data/merchants.json` and replace placeholder values.

### Option 2: Use Admin Panel

1. Start server: `npm start`
2. Go to: `http://localhost:4000/admin`
3. Edit merchant data in the form
4. Click "Save All Changes"

## 📊 What Each Field Does

| Field | Purpose | Required? | Example |
|-------|---------|-----------|---------|
| `upi.gpay_intent` | Opens Google Pay with UPI prefilled | No | `upi://pay?pa=merchant@upi&am=0` |
| `upi.phonepe_intent` | Opens PhonePe with UPI prefilled | No | `phonepe://pay?pa=merchant@upi&am=0` |
| `upi.paytm_intent` | Opens Paytm with UPI prefilled | No | `paytmmp://pay?pa=merchant@upi&am=0` |
| `google_place_id` | Redirects to Google Review page | No | `ChIJ3-SR6mGUrjsRqE4-MqX-TMQ` |
| `wifi.ssid` | Wi-Fi network name | No | `CoffeeShop_WiFi` |
| `wifi.password` | Wi-Fi password | No | `Coffee123!` |
| `menu_url` | Link to menu/ordering page | No | `https://example.com/menu` |
| `coupon_url` | Link to coupon/loyalty page | No | `https://example.com/coupon` |
| `location.lat` | Latitude for geolocation | **Yes** | `12.9716` |
| `location.lng` | Longitude for geolocation | **Yes** | `77.5946` |

## 🔐 Security Notes

1. **UPI Intents**: Always use `am=0` (amount=0) for demo. Real payments require proper UPI registration.
2. **Wi-Fi Passwords**: These are stored in plain text in JSON. For production, encrypt sensitive data.
3. **No API Keys Needed**: The demo doesn't use any external APIs that require keys.

## 🗄️ Database (Not Needed for Demo)

**Current Setup:** JSON file (`data/merchants.json`)

**For Production:** You could use:
- MongoDB
- PostgreSQL  
- MySQL
- Any database

But for the demo, JSON is perfect and requires zero setup!

## ✅ Quick Checklist

**For Demo (Current):**
- [x] Placeholder UPI IDs work fine
- [x] Placeholder Place IDs work fine
- [x] Demo Wi-Fi credentials work fine
- [x] No API keys needed
- [x] No database needed
- [x] Ready to demo!

**If Using Real Data:**
- [ ] Replace UPI IDs in `merchants.json`
- [ ] Replace Google Place IDs
- [ ] Update Wi-Fi credentials (if needed)
- [ ] Update menu/coupon URLs (if needed)
- [ ] Update merchant locations (lat/lng) to real locations

## 🎬 Demo Recommendation

**For investor demo:** Keep placeholders! They demonstrate the concept perfectly without needing real merchant accounts.

**For client demo:** Replace with real data if you have it, but placeholders still work great.

---

**Bottom Line:** The demo works perfectly as-is with placeholder data. No setup, no registrations, no API keys needed! 🚀




# Testing Guide

This document provides curl commands and testing scenarios for the QR Multiplex demo.

## Prerequisites

1. Start the server: `npm start`
2. Server should be running on `http://localhost:4000`

## Curl Test Commands

### 1. Test Google Pay Detection

```bash
curl -v -H "User-Agent: GPay/1.0 Android" \
     -H "X-Requested-With: com.google.android.apps.nbu.paisa.user" \
     http://localhost:4000/p/SHARED1
```

**Expected Result:** `302 Redirect` to Google Pay UPI intent URL

### 2. Test PhonePe Detection

```bash
curl -v -H "User-Agent: PhonePe/1.0 Android" \
     -H "X-Requested-With: com.phonepe.app" \
     http://localhost:4000/p/SHARED1
```

**Expected Result:** `302 Redirect` to PhonePe UPI intent URL

### 3. Test Paytm Detection

```bash
curl -v -H "User-Agent: Paytm/1.0 Android" \
     -H "X-Requested-With: net.one97.paytm" \
     http://localhost:4000/p/SHARED1
```

**Expected Result:** `302 Redirect` to Paytm UPI intent URL

### 4. Test Google Lens Detection

```bash
curl -v -H "User-Agent: Mozilla/5.0 (compatible; GoogleLens/1.0)" \
     http://localhost:4000/p/SHARED1
```

**Expected Result:** `302 Redirect` to Google Review page

### 5. Test Camera/Browser (Landing Page)

```bash
curl -v -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15" \
     http://localhost:4000/p/SHARED1
```

**Expected Result:** `200 OK` with HTML landing page

### 6. Test with Geolocation Query Parameters

```bash
curl -v "http://localhost:4000/p/SHARED1?lat=12.9716&lng=77.5946"
```

**Expected Result:** Should resolve to nearest merchant based on coordinates

### 7. Test /choose Endpoint (POST Geolocation)

```bash
curl -v -X POST \
     -H "Content-Type: application/json" \
     -d '{"code":"SHARED1","lat":12.9716,"lng":77.5946}' \
     http://localhost:4000/choose
```

**Expected Result:** JSON response with merchant data

### 8. Test Admin Panel

```bash
curl -v http://localhost:4000/admin
```

**Expected Result:** `200 OK` with HTML admin panel

### 9. Test Health Check

```bash
curl -v http://localhost:4000/health
```

**Expected Result:** `200 OK` with JSON: `{"status":"ok","timestamp":"..."}`

## Mobile Testing Checklist

### Google Pay
- [ ] Open Google Pay app
- [ ] Scan QR code
- [ ] Verify Google Pay opens with merchant UPI prefilled (amount = 0)
- [ ] Verify no actual payment is processed

### PhonePe
- [ ] Open PhonePe app
- [ ] Scan QR code
- [ ] Verify PhonePe opens with merchant UPI prefilled
- [ ] Verify no actual payment is processed

### Paytm
- [ ] Open Paytm app
- [ ] Scan QR code
- [ ] Verify Paytm opens with merchant UPI prefilled
- [ ] Verify no actual payment is processed

### Google Lens
- [ ] Open Google Lens
- [ ] Scan QR code
- [ ] Verify browser opens Google Review page for merchant
- [ ] Verify correct Place ID is used

### Camera (iPhone)
- [ ] Open iPhone Camera app
- [ ] Scan QR code
- [ ] Verify Safari opens landing page
- [ ] Grant location permission when prompted
- [ ] Verify Wi-Fi credentials are displayed
- [ ] Verify all action buttons are visible
- [ ] Test each button (Review, Menu, Coupon, Payment)

### Camera (Android)
- [ ] Open Android Camera app
- [ ] Scan QR code
- [ ] Verify Chrome opens landing page
- [ ] Grant location permission when prompted
- [ ] Verify Wi-Fi credentials are displayed
- [ ] Verify all action buttons are visible
- [ ] Test each button (Review, Menu, Coupon, Payment)

## ngrok Testing

1. Start server: `npm start`
2. Start ngrok: `ngrok http 4000`
3. Copy HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Generate QR with ngrok URL:
   ```bash
   BASE_URL=https://abc123.ngrok.io npm run generate-qr
   ```
5. Test all mobile scenarios above using the ngrok URL

## Expected Behavior Summary

| App | Detection Method | Action |
|-----|-----------------|--------|
| Google Pay | X-Requested-With header | Redirect to GPay UPI intent |
| PhonePe | X-Requested-With header | Redirect to PhonePe UPI intent |
| Paytm | X-Requested-With header | Redirect to Paytm UPI intent |
| Google Lens | User-Agent pattern | Redirect to Google Review |
| Camera/Browser | Default fallback | Show landing page with geolocation |

## Debugging

Check server logs for:
- `[REQUEST]` - Full request details
- `[DETECTION]` - App detection result
- `[RESOLUTION]` - Selected merchant
- `[GEO]` - Geolocation resolution
- `[CHOOSE]` - POST /choose endpoint calls
- `[ERROR]` - Any errors

All requests are logged with User-Agent, X-Requested-With, IP, and query parameters.






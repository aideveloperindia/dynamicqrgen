# Fix: Direct Redirect from Payment Apps

## 🎯 The Problem

When scanning QR code from Google Pay/PhonePe/Paytm, it's showing the landing page instead of directly opening the payment app with UPI prefilled.

## ✅ The Solution

The issue is that payment apps might open URLs in a webview/browser, not sending the `X-Requested-With` header. We need to:

1. **Improve detection** - Better User-Agent parsing
2. **Add query parameter support** - Allow `?app=gpay` for direct redirects
3. **Enhanced logging** - See what headers are actually received

## 🔧 Changes Made

1. **Enhanced app detection** - More patterns for Google Pay/PhonePe/Paytm
2. **Query parameter fallback** - Can use `?app=gpay` if headers don't work
3. **Better logging** - See exactly what headers are received

## 📱 How to Test

### Option 1: Test with Query Parameter

Generate QR code with app parameter:
```
https://oneqrcode.vercel.app/p/SHARED1?app=gpay
```

When scanned, it will directly redirect to Google Pay UPI intent.

### Option 2: Check Server Logs

When you scan, check the server logs (Vercel logs) to see:
- What User-Agent is received
- What X-Requested-With header is received
- What app type is detected

## 🚀 Next Steps

1. **Test scanning from Google Pay** - Check what headers are sent
2. **Update QR code** - If needed, add `?app=gpay` parameter
3. **Verify redirect** - Should go directly to UPI intent, not landing page

## 🔍 Debugging

Check Vercel function logs to see:
```
[DETECTION] Code: SHARED1, App: google_pay
[HEADERS] User-Agent: ...
[HEADERS] X-Requested-With: ...
```

If app is detected as `browser` instead of `google_pay`, we need to adjust detection or use query parameter.

---

**The code is updated - need to test and see what headers Google Pay actually sends!**




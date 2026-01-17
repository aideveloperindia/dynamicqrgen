# Clean UPI Link to Save in Dashboard

## ✅ Recommended Link to Save

**Category:** Payment

**Display Name:**
```
Payment
```

**URL to Save:**
```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

---

## What This Link Contains

- ✅ `pa=9912941214@okbizaxis` - Your UPI ID
- ✅ `pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED` - Payee Name (properly encoded, no trailing space)
- ✅ `aid=uGICAgMDYtL2rWQ` - App ID (removes ₹2000 limit)

**What System Adds Automatically:**
- ✅ `cu=INR` - Currency
- ✅ `tn=Payment` - Transaction note
- ✅ `tr=TXN[timestamp]` - Unique transaction reference (generated for each payment)

---

## Changes from Original

**Removed:**
- ❌ `mc=7392` - Merchant category (optional, not needed)
- ❌ `tr=BCR2DN4T4CPJ7BLC` - Old transaction reference (we generate new ones)

**Fixed:**
- ✅ Removed trailing space from `pn` parameter
- ✅ Properly encoded payee name
- ✅ Clean, minimal link

---

## How to Update

1. **Go to Dashboard** → **Links**
2. **Find your Payment link** → Click **Edit**
3. **Replace URL** with:
   ```
   upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
   ```
4. **Click Save**

**OR**

1. **Delete the old payment link**
2. **Add new link** → Select **Payment** category
3. **Paste the URL above**
4. **Display Name:** `Payment`
5. **Click Save**

---

## Expected Result

After saving, when users click the payment icon:
- ✅ Opens Google Pay, PhonePe, CRED, BharatPe
- ✅ Shows: "GENIPAPPA TECHNOLOGIES PRIVATE LIMITED"
- ✅ No ₹2000 limit (because `aid` is included)
- ✅ Users can enter any amount
- ✅ Works smoothly in all apps

---

## Alternative: Use Profile Fields

If you prefer, you can also:

1. **Go to Business Profile**
2. **Enter:**
   - UPI ID: `9912941214@okbizaxis`
   - App ID: `uGICAgMDYtL2rWQ`
   - Payee Name: `GENIPAPPA TECHNOLOGIES PRIVATE LIMITED`
3. **Click Update**
4. **Then add payment link** → Click "Generate from Profile"

Both methods work - choose whichever is easier for you!

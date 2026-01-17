# Client Dashboard Setup - Complete Details

## UPI Link to Save in Dashboard

### When Adding Payment Link:

**Category:** Payment (select the Cred logo icon)

**Display Name:** 
```
Payment
```
or
```
Pay Now
```

**URL to Paste:**
```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

**OR (Simpler - System will enhance it):**
```
upi://pay?pa=9912941214@okbizaxis&aid=uGICAgMDYtL2rWQ
```

**Note:** 
- System automatically adds `pn` (payee name) if missing
- System automatically adds `cu=INR` (currency)
- System automatically generates `tr` (transaction reference) for each payment
- System automatically adds `tn=Payment` (transaction note)

---

## Business Profile Details (Optional but Recommended)

### If Adding to Business Profile:

**Business Name:**
```
GENIPAPPA TECHNOLOGIES PRIVATE LIMITED
```

**UPI ID:**
```
9912941214@okbizaxis
```

**App ID (aid):**
```
uGICAgMDYtL2rWQ
```

**Payee Name (Optional):**
```
GENIPAPPA TECHNOLOGIES PRIVATE LIMITED
```

**Phone Number:**
```
[Your phone number]
```

**Address:**
```
[Your business address]
```

---

## Step-by-Step Instructions

### Method 1: Direct Link Entry (Quickest)

1. **Go to Dashboard** → **Links Section**
2. **Click "Add" button**
3. **Select "Payment" category** (Cred logo icon)
4. **Display Name:** Enter `Payment` or `Pay Now`
5. **URL:** Paste this:
   ```
   upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
   ```
6. **Click "Save"**

**Done!** The payment link is now active.

---

### Method 2: Using Business Profile (Better for Multiple Links)

1. **Go to Dashboard** → **Business Profile**
2. **Fill in:**
   - **Business Name:** `GENIPAPPA TECHNOLOGIES PRIVATE LIMITED`
   - **UPI ID:** `9912941214@okbizaxis`
   - **App ID (aid):** `uGICAgMDYtL2rWQ`
   - **Payee Name:** `GENIPAPPA TECHNOLOGIES PRIVATE LIMITED`
3. **Click "Update"**

4. **Then go to Links** → **Add Link**
5. **Select "Payment" category**
6. **Click "Generate Link from Profile" button**
7. **Display Name:** `Payment`
8. **Click "Save"**

**Done!** Link auto-generated from profile.

---

## What Gets Saved vs What Gets Enhanced

### What You Save:
```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

### What System Adds When Link is Clicked:
```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ&cu=INR&tn=Payment&tr=TXN1704123456789
```

**System automatically adds:**
- ✅ `cu=INR` (currency)
- ✅ `tn=Payment` (transaction note)
- ✅ `tr=TXN[timestamp]` (unique transaction reference for each payment)

**System preserves:**
- ✅ `pa` (UPI ID)
- ✅ `pn` (payee name)
- ✅ `aid` (App ID - removes ₹2000 limit)

---

## Complete Form Fields Summary

### When Adding Payment Link:

| Field | Value |
|-------|-------|
| **Category** | Payment (Cred logo) |
| **Display Name** | `Payment` or `Pay Now` |
| **URL** | `upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ` |

### Business Profile (Optional):

| Field | Value |
|-------|-------|
| **Business Name** | `GENIPAPPA TECHNOLOGIES PRIVATE LIMITED` |
| **UPI ID** | `9912941214@okbizaxis` |
| **App ID (aid)** | `uGICAgMDYtL2rWQ` |
| **Payee Name** | `GENIPAPPA TECHNOLOGIES PRIVATE LIMITED` |

---

## Verification Checklist

After saving, verify:

- ✅ Payment link appears in Links list
- ✅ Shows Cred logo (2x bigger than other icons)
- ✅ Clicking it opens UPI app (Google Pay/PhonePe)
- ✅ Shows business name: "GENIPAPPA TECHNOLOGIES PRIVATE LIMITED"
- ✅ No ₹2000 limit (because `aid` is included)
- ✅ Users can enter any amount

---

## Quick Copy-Paste Ready

### For Link URL Field:
```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ
```

### For Display Name:
```
Payment
```

---

## Notes

1. **Transaction Reference (`tr`)**: Don't include it - system generates unique one for each payment
2. **Merchant Category (`mc`)**: Optional, not needed - system works without it
3. **Amount (`am`)**: Not included - users can enter any amount (no limits)
4. **App ID (`aid`)**: ✅ **Critical** - This removes ₹2000 limit, must be included

---

## Result

After setup:
- ✅ Payment link works with all UPI apps
- ✅ No amount restrictions
- ✅ Professional merchant payments
- ✅ Shows business name correctly
- ✅ Cred logo displayed prominently

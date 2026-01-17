# UPI Link Example - Complete Merchant Link

## Your UPI Link Breakdown

```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED%20&mc=7392&aid=uGICAgMDYtL2rWQ&tr=BCR2DN4T4CPJ7BLC
```

## Parameters Explained

| Parameter | Value | Decoded | Description |
|-----------|-------|---------|-------------|
| `pa` | `9912941214@okbizaxis` | UPI ID | Your merchant UPI ID (Axis Bank) |
| `pn` | `GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED%20` | GENIPAPPA TECHNOLOGIES PRIVATE LIMITED | Payee/Business Name |
| `mc` | `7392` | Merchant Category Code | Business category code |
| `aid` | `uGICAgMDYtL2rWQ` | **App ID** | ✅ **This removes ₹2000 limit!** |
| `tr` | `BCR2DN4T4CPJ7BLC` | Transaction Reference | Unique transaction ID |

## Key Information Extracted

### ✅ App ID (aid)
```
uGICAgMDYtL2rWQ
```
**This is your App ID!** This removes the ₹2000 transaction limit.

### ✅ UPI ID
```
9912941214@okbizaxis
```
- Bank: **Axis Bank** (`@okbizaxis`)
- This is a business UPI ID (indicated by `okbizaxis`)

### ✅ Business Name
```
GENIPAPPA TECHNOLOGIES PRIVATE LIMITED
```

---

## How to Add This to Dashboard

### Method 1: Paste Full URL (Easiest)
1. Go to **Dashboard** → **Links** → **Add Link**
2. Select **Payment** category
3. Paste the entire URL in the URL field:
   ```
   upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED%20&mc=7392&aid=uGICAgMDYtL2rWQ&tr=BCR2DN4T4CPJ7BLC
   ```
4. Display Name: "Payment" or "Pay Now"
5. Click **Save**

**Note**: The system will automatically:
- Extract UPI ID and App ID
- Remove the `tr` parameter (we generate new ones for each payment)
- Keep the `aid` parameter (removes ₹2000 limit)

### Method 2: Add to Business Profile
1. Go to **Dashboard** → **Business Profile**
2. **UPI ID**: `9912941214@okbizaxis`
3. **App ID (aid)**: `uGICAgMDYtL2rWQ`
4. **Payee Name**: `GENIPAPPA TECHNOLOGIES PRIVATE LIMITED`
5. Click **Update**

Then when adding payment link, click "Generate Link from Profile" - it will auto-create the link with App ID.

---

## Important Notes

### ✅ This Link Has App ID
- ✅ **No ₹2000 limit** - users can pay any amount
- ✅ Works with Google Pay, PhonePe, and all UPI apps
- ✅ Merchant payment (not personal)

### ⚠️ Transaction Reference (tr)
- The `tr=BCR2DN4T4CPJ7BLC` in your link is a specific transaction reference
- **We automatically generate new `tr` for each payment** to ensure uniqueness
- Don't worry - the system handles this

### ⚠️ Merchant Category Code (mc)
- `mc=7392` is optional
- We don't need to include it - the link works without it
- System will preserve it if present

---

## Simplified Link (What System Will Use)

The system will enhance your link to:
```
upi://pay?pa=9912941214@okbizaxis&pn=GENIPAPPA%20TECHNOLOGIES%20PRIVATE%20LIMITED&aid=uGICAgMDYtL2rWQ&cu=INR&tn=Payment&tr=TXN1704123456789
```

**Changes made:**
- ✅ Kept: `pa`, `pn`, `aid` (critical parameters)
- ✅ Added: `cu=INR` (currency)
- ✅ Added: `tn=Payment` (transaction note)
- ✅ Replaced: `tr` with new unique reference (for each payment)
- ⚠️ Removed: `mc` (optional, not needed)
- ⚠️ Removed: `am` (no amount - users enter any amount)

---

## Testing

1. **Add the link** to dashboard (Method 1 or 2 above)
2. **Visit your public page**: `/p/your-slug`
3. **Click the payment icon** (Cred logo)
4. **Test payment**:
   - Should open Google Pay/PhonePe
   - Should show business name: "GENIPAPPA TECHNOLOGIES PRIVATE LIMITED"
   - Should allow any amount (no ₹2000 limit)
   - Should work smoothly

---

## Summary

✅ **You have a complete merchant UPI link with App ID!**

**To use it:**
1. Paste the full URL when adding payment link, OR
2. Extract App ID (`uGICAgMDYtL2rWQ`) and add to Business Profile

**Result:**
- ✅ No amount limits
- ✅ Works with all UPI apps
- ✅ Professional merchant payments

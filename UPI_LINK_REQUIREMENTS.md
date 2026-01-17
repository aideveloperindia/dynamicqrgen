# UPI Link Requirements & Fields Guide

## Required Fields for UPI Links to Work with ALL Apps

### ✅ **MANDATORY Fields** (Required by Google Pay, PhonePe, and most apps)

1. **UPI ID (`pa`)** - REQUIRED
   - Format: `yourname@bank` (e.g., `9553267043-7@ybl`)
   - Must be valid and registered
   - **Current field**: `user.upiId`

2. **Payee Name (`pn`)** - REQUIRED by Google Pay/PhonePe
   - The name shown in the UPI app when payment is initiated
   - Should match business/merchant name
   - **Current field**: `user.upiPayeeName` (falls back to `businessName` or `name`)

3. **Currency (`cu`)** - REQUIRED
   - Always `INR` for Indian payments
   - **Auto-added**: We automatically add this

### ✅ **RECOMMENDED Fields** (Improves compatibility)

4. **Transaction Reference (`tr`)** - Recommended
   - Unique identifier for each transaction
   - **We generate this automatically**: `TXN` + timestamp (e.g., `TXN1704123456789`)
   - **You DON'T need to collect this** - we create it dynamically
   - **Answer**: We can create it ourselves, doesn't need to come from GPay/PhonePe
   - Purpose: Helps with tracking and prevents duplicate transactions

5. **Transaction Note (`tn`)** - Optional but recommended
   - Message shown in payment app (e.g., "Payment for services")
   - **Current**: We use default "Payment"
   - **Could add**: Custom field `user.upiTransactionNote` for clients to customize

### ⚠️ **OPTIONAL Fields** (For special cases)

6. **Amount (`am`)** - Optional
   - Pre-fills amount in payment app
   - If omitted, user enters amount manually
   - **Current**: Not collected (users enter amount manually)
   - **Could add**: Optional default amount field

7. **App ID (`aid`)** - Optional (for merchant accounts)
   - Removes ₹2000 payment limit
   - Required for merchant/business UPI accounts
   - **Current field**: `user.upiAid`

---

## What We Currently Collect from Clients

### ✅ Already Collected:
- ✅ **Business Name** → Used for `pn` (payee name) if `upiPayeeName` not set
- ✅ **UPI ID** → Used for `pa` parameter
- ✅ **Payee Name** (optional) → Used for `pn` parameter
- ✅ **App ID** (optional) → Used for `aid` parameter (merchant payments)

### ❌ Not Currently Collected (but could be useful):
- ❌ **Custom Transaction Note** - Currently defaults to "Payment"
- ❌ **Default Amount** - Currently users enter amount manually

---

## Transaction Reference (`tr`) - Can We Create It?

### ✅ **YES, we can and should create it ourselves!**

**Why:**
- `tr` is just a unique identifier for tracking
- It doesn't need to come from GPay/PhonePe
- We generate it dynamically: `TXN` + current timestamp
- Example: `TXN1704123456789`

**Current Implementation:**
```javascript
// We automatically generate it:
params.set('tr', `TXN${Date.now()}`);
```

**Benefits:**
- Each payment link gets a unique reference
- Helps prevent duplicate transactions
- Useful for tracking/logging
- No need to collect from client

**Note:** Some payment gateways may generate their own transaction IDs, but for UPI deep links, we can create our own.

---

## Recommended Fields to Collect from Clients

### **Minimum Required:**
1. ✅ **UPI ID** (`pa`) - REQUIRED
2. ✅ **Business Name** - Used for `pn` if not specified separately

### **Recommended:**
3. ✅ **Payee Name** (`pn`) - Optional, but recommended for better display
   - If not provided, uses Business Name
4. ✅ **App ID** (`aid`) - Optional, only if client has merchant account
   - Removes ₹2000 limit

### **Optional Enhancements:**
5. ⚠️ **Custom Transaction Note** (`tn`) - Optional
   - Currently defaults to "Payment"
   - Could add field: `user.upiTransactionNote`
   - Allows clients to customize message (e.g., "Payment for Order #123")

6. ⚠️ **Default Amount** (`am`) - Optional
   - Currently users enter amount manually
   - Could add field: `user.defaultPaymentAmount`
   - Pre-fills amount in payment app

---

## Current UPI Link Generation

### What We Auto-Add:
- ✅ `pn` (payee name) - From `upiPayeeName`, `businessName`, or `name`
- ✅ `cu` (currency) - Always "INR"
- ✅ `tn` (transaction note) - Defaults to "Payment"
- ✅ `tr` (transaction reference) - Auto-generated: `TXN` + timestamp

### What Client Provides:
- ✅ `pa` (UPI ID) - From `user.upiId`
- ✅ `aid` (App ID) - From `user.upiAid` (if merchant account)

---

## Summary

### ✅ **What's Working:**
- We collect all **required** fields (UPI ID, Business Name)
- We automatically add missing parameters (`pn`, `cu`, `tn`, `tr`)
- Transaction reference is auto-generated (no need to collect)

### 💡 **Potential Improvements:**
1. Add optional **Custom Transaction Note** field
   - Allows clients to personalize payment message
   - Example: "Payment for Order #123" instead of default "Payment"

2. Add optional **Default Amount** field
   - Pre-fills amount in payment app
   - Users can still change it

3. Better validation/guidance
   - Show example UPI ID format
   - Explain what App ID is and when needed

---

## Answer to Your Questions

### Q: What fields should we take from client?
**A: Minimum:**
- UPI ID (required)
- Business Name (required, used for payee name)

**Recommended:**
- Payee Name (optional, better display)
- App ID (optional, for merchant accounts)

**Optional:**
- Custom Transaction Note (optional, personalization)
- Default Amount (optional, convenience)

### Q: Transaction number - can we create it or should GPay/PhonePe create it?
**A: We can and should create it ourselves!**
- `tr` is just a unique identifier for tracking
- We generate: `TXN` + timestamp (e.g., `TXN1704123456789`)
- No need to collect from client or wait for GPay/PhonePe
- Each payment link gets a unique reference automatically

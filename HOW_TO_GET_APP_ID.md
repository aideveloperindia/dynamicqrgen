# How to Get App ID (aid) - Complete Guide

## What is App ID (aid)?

**App ID** (also called `aid` parameter) is a **merchant identifier** that:
- ✅ Removes the ₹2000 transaction limit
- ✅ Enables unlimited payment amounts
- ✅ Identifies your account as a merchant/business (not personal)
- ✅ Required for commercial UPI payments

**Without App ID:**
- ❌ Payments treated as personal (P2P)
- ❌ ₹2000 limit per transaction
- ❌ May fail for larger amounts

**With App ID:**
- ✅ Payments treated as merchant transactions
- ✅ No amount limits
- ✅ Works like scanning QR code at any shop

---

## Who Provides App ID?

### Option 1: Your Bank (Recommended)
**Your bank provides App ID when you register as a UPI merchant.**

#### For ICICI Bank:
1. **Call Customer Care**: 1860-120-7777
2. **Request**: "UPI Merchant Registration" or "UPI Merchant Services"
3. **Process**:
   - They'll guide you through merchant registration
   - Complete KYC (Know Your Customer) documents
   - Provide business registration documents (if applicable)
   - You'll receive your App ID after approval

#### For Other Banks:
- **HDFC Bank**: Call 1800-202-6161, ask for "UPI Merchant Services"
- **SBI**: Visit branch or call 1800-425-3800
- **Axis Bank**: Call 1800-419-5577
- **Kotak Bank**: Call 1860-266-0811
- **Any Bank**: Contact your bank's customer care and ask for "UPI Merchant Registration"

---

### Option 2: Payment Gateways (Easier & Faster)

#### Razorpay (Most Popular)
1. **Visit**: [razorpay.com](https://razorpay.com)
2. **Sign Up**: Create merchant account
3. **Complete KYC**: Submit business documents
4. **Get Credentials**: 
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - You'll find your App ID / Merchant ID
   - Also provides UPI merchant credentials

**Benefits:**
- ✅ Faster approval (1-2 days)
- ✅ Easy dashboard to manage
- ✅ Multiple payment methods
- ✅ Clear documentation

#### Paytm for Business
1. **Visit**: [paytm.com/business](https://paytm.com/business)
2. **Register**: Sign up as merchant
3. **Complete Onboarding**: Submit documents
4. **Get App ID**: Available in merchant dashboard

#### PhonePe for Business
1. **Visit**: [phonepe.com/business](https://phonepe.com/business)
2. **Register**: Create business account
3. **Complete KYC**: Submit required documents
4. **Get Credentials**: App ID provided in merchant portal

#### Other Payment Gateways:
- **Instamojo**: [instamojo.com](https://instamojo.com)
- **Cashfree**: [cashfree.com](https://cashfree.com)
- **PayU**: [payu.in](https://payu.in)

---

### Option 3: NPCI Direct (Advanced)
1. **Visit**: [npci.org.in](https://npci.org.in)
2. **Register**: As UPI merchant
3. **Complete Process**: Follow NPCI guidelines
4. **Get App ID**: Official App ID from NPCI

**Note**: This is more complex and usually for large businesses.

---

## Where to Find App ID After Getting It?

### In Payment Gateway Dashboard:
1. Login to your merchant dashboard (Razorpay/Paytm/etc.)
2. Go to **Settings** or **API Keys** section
3. Look for:
   - "App ID"
   - "Merchant ID"
   - "UPI Merchant ID"
   - "aid parameter"
   - "Application ID"

### In Bank Documents:
- Check email from bank after merchant registration
- Check physical documents sent by bank
- Login to bank's merchant portal (if available)

### In UPI URL:
If you already have a merchant UPI link, the App ID is in the URL:
```
upi://pay?pa=your.id@bank&pn=YourName&aid=YOUR_APP_ID_HERE&cu=INR
                                                      ^^^^^^^^^^^^^^^^
                                                      This is your App ID
```

---

## How to Add App ID in Dashboard?

### Method 1: Add in Business Profile
1. Go to **Dashboard** → **Business Profile**
2. Find **"App ID (aid)"** field (if available)
3. Enter your App ID
4. Click **Update**

### Method 2: Paste Full UPI URL
1. If you have a full UPI merchant URL with `aid`, paste it in **UPI ID** field:
   ```
   upi://pay?pa=your.id@bank&pn=YourName&aid=YOUR_APP_ID&cu=INR
   ```
2. System automatically extracts:
   - UPI ID (`pa` parameter)
   - App ID (`aid` parameter)

### Method 3: Add When Creating Payment Link
1. When adding a payment link, if you have App ID
2. Include it in the URL when generating the link
3. System will automatically use it

---

## Quick Comparison

| Method | Time to Get | Difficulty | Cost | Best For |
|--------|-------------|------------|------|----------|
| **Your Bank** | 3-7 days | ⭐⭐ Moderate | Usually free | Most users (Google Pay/PhonePe users) |
| **PhonePe for Business** | 2-5 days | ⭐⭐ Moderate | Free | Businesses using PhonePe |
| **NPCI Direct** | 7-14 days | ⭐⭐⭐ Complex | Varies | Large businesses only |

**Recommendation**: 
- **For Google Pay/PhonePe users**: Get App ID from **your bank** (the bank that issued your UPI ID)
- **For businesses**: Consider **PhonePe for Business** if you use PhonePe

---

## What Documents Are Needed?

### For Payment Gateways (Razorpay/Paytm):
- ✅ PAN Card
- ✅ Aadhaar Card
- ✅ Bank Account Details
- ✅ Business Registration (if applicable)
- ✅ Address Proof

### For Bank Registration:
- ✅ PAN Card
- ✅ Aadhaar Card
- ✅ Business Registration Certificate (if business)
- ✅ Bank Account Statement
- ✅ Address Proof

---

## Important Notes

1. **App ID is Bank-Specific**: 
   - Each bank provides its own App ID
   - App ID from one bank won't work with another bank's UPI ID

2. **App ID is UPI ID-Specific**:
   - The App ID must match your UPI ID
   - Can't use someone else's App ID with your UPI ID

3. **Merchant Registration Required**:
   - App ID is only given to registered merchants
   - Personal UPI accounts don't have App ID

4. **Without App ID**:
   - Payments still work but with ₹2000 limit
   - May fail for larger amounts
   - Treated as personal payments

---

## Step-by-Step: Getting Started (For Google Pay/PhonePe Users)

### Step 1: Identify Your Bank
- Check your UPI ID: `yourname@bankcode`
- Example: `9553267043-7@ybl` → Bank is **Yes Bank** (`@ybl`)
- Example: `yourname@okicici` → Bank is **ICICI Bank**

### Step 2: Contact Your Bank
- Call your bank's customer care (see numbers above)
- Say: "I need UPI Merchant Registration" or "I need App ID for merchant UPI payments"
- They'll explain the process

### Step 3: Complete Registration
- Submit required documents (PAN, Aadhaar, business docs if applicable)
- Complete KYC process
- Wait for approval (usually 3-7 days)

### Step 4: Get App ID
- Bank will send App ID via email/SMS
- Or check bank's merchant portal (if available)
- Note down your App ID

### Step 5: Add to Dashboard
- Go to Business Profile in dashboard
- Enter App ID in "App ID (aid)" field
- Or paste full UPI URL with `aid` parameter
- Save

### Step 6: Test
- Create a payment link
- Test with small amount first
- Verify no ₹2000 limit
- Works with Google Pay, PhonePe, and all UPI apps

---

## Troubleshooting

### "I can't find App ID in dashboard"
- Check Settings → API Keys section
- Contact payment gateway support
- Check email from bank/gateway

### "My bank says they don't provide App ID"
- Try a payment gateway instead (Razorpay/Paytm)
- Some banks call it "Merchant ID" or "Application ID"
- Ask specifically for "UPI merchant App ID"

### "App ID not working"
- Verify App ID matches your UPI ID
- Check if App ID is from same bank as UPI ID
- Ensure merchant registration is complete

---

## Support Contacts

- **Razorpay Support**: support@razorpay.com or [razorpay.com/support](https://razorpay.com/support)
- **Paytm Business**: [paytm.com/business/support](https://paytm.com/business/support)
- **PhonePe Business**: [phonepe.com/business/support](https://phonepe.com/business/support)
- **ICICI Bank**: 1860-120-7777
- **NPCI**: [npci.org.in/contact](https://npci.org.in/contact)

---

## Summary

**App ID (aid) is provided by:**
1. ✅ **Your Bank** (primary method for Google Pay/PhonePe users)
   - The bank that issued your UPI ID
   - Example: If UPI ID is `@ybl`, get App ID from Yes Bank
2. ✅ **PhonePe for Business** (if using PhonePe as merchant)
3. ✅ **NPCI** (for large businesses only)

**Important Clarification:**
- ❌ **Google Pay/PhonePe apps** don't provide App ID directly
- ✅ **Your Bank** provides App ID when you register as merchant
- ✅ Google Pay/PhonePe are just apps you use - they work with App ID from your bank

**How to get it (for Google Pay/PhonePe users):**
1. Identify your bank from UPI ID (check the `@bankcode` part)
2. Call your bank's customer care
3. Request "UPI Merchant Registration"
4. Complete KYC and registration (3-7 days)
5. Get App ID from bank

**Once you have it:**
- Add it in Business Profile → App ID field
- Or paste full UPI URL with `aid` parameter
- System automatically uses it for all payment links

**Result:**
- ✅ No ₹2000 limit
- ✅ Unlimited payment amounts
- ✅ Works with Google Pay, PhonePe, and all UPI apps
- ✅ Just like scanning QR code at any shop

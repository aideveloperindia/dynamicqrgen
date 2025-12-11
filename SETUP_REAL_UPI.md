# Setting Up Real UPI IDs for Investor Demo

## ⚠️ Important: Payment Apps Need Real UPI IDs

For the investor demo to work properly when they scan with Google Pay/PhonePe/Paytm, you need **real UPI IDs**. Placeholder UPI IDs won't open the payment apps.

## 🎯 What You Need

You need **at least one real UPI ID** that you can use for the demo. This can be:
- Your personal UPI ID (from your Google Pay/PhonePe/Paytm account)
- A test/demo UPI ID you create
- A client's UPI ID (if you have permission)

## 📱 How to Find Your UPI ID

### Google Pay:
1. Open Google Pay app
2. Tap your profile picture
3. Your UPI ID is shown (format: `yourname@okaxis` or `yourname@paytm`)

### PhonePe:
1. Open PhonePe app
2. Go to Profile → Payment Settings
3. Your UPI ID is shown

### Paytm:
1. Open Paytm app
2. Go to Profile → Payment Settings
3. Your UPI ID is shown

## 🔧 Quick Setup (3 Options)

### Option 1: Use Same UPI ID for All Merchants (Easiest)

If you have one UPI ID, we can use it for all 5 merchants. This is perfect for demo.

**Example:** If your UPI ID is `demo@paytm`, all merchants will use it.

### Option 2: Use Different UPI IDs

If you have multiple UPI IDs (or client UPI IDs), we can use different ones for each merchant.

### Option 3: Use Your Personal UPI ID

Use your own UPI ID - it's safe because `am=0` (amount=0) means no money can be sent.

## 🚀 Quick Setup Steps

1. **Get your UPI ID** (from any payment app)

2. **Update merchants.json** - Replace all `merchant_x@upi` with your real UPI ID

   OR

3. **Use Admin Panel** - Go to `http://localhost:4000/admin` and update UPI IDs there

## 📝 Example

**Before (placeholder - won't work):**
```json
"gpay_intent": "upi://pay?pa=merchant_a@upi&pn=Coffee%20Shop&am=0&cu=INR&tn=Demo%20Payment"
```

**After (real UPI ID - will work):**
```json
"gpay_intent": "upi://pay?pa=yourname@paytm&pn=Coffee%20Shop&am=0&cu=INR&tn=Demo%20Payment"
```

## ✅ What Happens in Demo

1. **Investor scans QR with Google Pay:**
   - Google Pay app opens
   - Your UPI ID is prefilled
   - Amount shows ₹0 (demo mode)
   - Investor can see the payment screen
   - **No money is sent** (amount=0)

2. **Investor scans QR with PhonePe:**
   - PhonePe app opens
   - Your UPI ID is prefilled
   - Amount shows ₹0
   - **No money is sent**

3. **Investor scans QR with Paytm:**
   - Paytm app opens
   - Your UPI ID is prefilled
   - Amount shows ₹0
   - **No money is sent**

## 🔒 Safety

- `am=0` means amount = ₹0 (zero)
- No money can be sent
- Investor can only see the payment screen
- Completely safe for demo

## 🎬 Demo Flow

1. Investor scans QR with Google Pay
2. Google Pay opens → Shows your UPI ID prefilled → Amount ₹0
3. Investor sees: "This is a demo, no payment will be processed"
4. Investor tries PhonePe → Same thing
5. Investor tries Paytm → Same thing
6. Investor scans with Google Lens → Opens Google Review
7. Investor scans with camera → Shows Wi-Fi password

## 💡 Recommendation

**For investor demo:** Use your own UPI ID for all merchants. It's:
- Safe (amount=0)
- Simple (one UPI ID)
- Effective (shows the concept perfectly)

---

**Ready to set it up?** Just provide your UPI ID and I'll update all the merchants for you!




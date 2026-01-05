# Deployment Testing Checklist

## ✅ Deployment Complete!

**Production URL:** https://dynamicqrgen.vercel.app

---

## 🧪 Testing Checklist

### 1. Basic Site Access
- [ ] Visit https://dynamicqrgen.vercel.app
- [ ] Should see login page (not error page)
- [ ] Page loads without 500 errors

### 2. Google OAuth Login
- [ ] Click "Continue with Google" button
- [ ] Should redirect to Google login
- [ ] After login, should redirect back to dashboard
- [ ] Should see dashboard (not error)

### 3. Dashboard Functionality
- [ ] Dashboard loads successfully
- [ ] Can see user profile section
- [ ] Can add business name
- [ ] Can upload business logo
- [ ] Can add links (Instagram, WhatsApp, etc.)
- [ ] Can create custom categories with logo upload

### 4. Payment Integration
- [ ] Click "Pay ₹100" button
- [ ] Razorpay checkout opens
- [ ] Can complete test payment
- [ ] Payment verification works
- [ ] After payment, QR code generation becomes available

### 5. QR Code Generation
- [ ] After payment, click "Generate QR Code"
- [ ] QR code generates successfully
- [ ] Can download QR code
- [ ] QR code URL is correct: `https://dynamicqrgen.vercel.app/p/[username]`

### 6. Public Page (QR Code Landing)
- [ ] Visit your public page: `https://dynamicqrgen.vercel.app/p/[your-username]`
- [ ] Page loads with your business logo
- [ ] All your links/icons are displayed
- [ ] Clicking icons redirects to correct URLs
- [ ] Page is mobile responsive

### 7. Database Connection
- [ ] User data saves correctly
- [ ] Links save correctly
- [ ] Payment status updates correctly
- [ ] No MongoDB connection errors in logs

---

## 🔍 Troubleshooting

### If you see 500 errors:
1. Check Vercel logs: Dashboard → Deployments → Click on deployment → View Function Logs
2. Verify all environment variables are set correctly
3. Check MongoDB connection string
4. Verify Google OAuth callback URL matches exactly

### If Google login doesn't work:
1. Verify callback URL in Google Console matches: `https://dynamicqrgen.vercel.app/auth/google/callback`
2. Check that both localhost and production URLs are in Google Console
3. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel

### If payment doesn't work:
1. Verify Razorpay keys are correct in Vercel
2. Check Razorpay dashboard for any errors
3. Verify payment amount is correct (₹100 = 10000 paise)

### If QR code doesn't generate:
1. Verify `BASE_URL` is set to `https://dynamicqrgen.vercel.app`
2. Check that payment is completed
3. Verify MongoDB connection is working

---

## 📋 Quick Links

- **Production Site:** https://dynamicqrgen.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Razorpay Dashboard:** https://dashboard.razorpay.com/

---

## ✅ Next Steps

1. Test all functionality above
2. Create a test account
3. Complete a test payment
4. Generate and test QR code
5. Share with beta users for feedback

---

**Status:** 🚀 Ready for Testing!





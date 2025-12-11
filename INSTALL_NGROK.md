# Install ngrok for Mobile Testing

## Why You Need ngrok

Your QR code points to `localhost:4000`, which only works on your computer. When you scan from your phone, the phone can't access your computer's localhost.

**Solution:** ngrok creates a public URL that tunnels to your local server.

## 🚀 Installation Options

### Option 1: Install via Homebrew (Recommended)

```bash
brew install ngrok/ngrok/ngrok
```

### Option 2: Download from Website

1. Go to: https://ngrok.com/download
2. Download for macOS
3. Unzip the file
4. Move to a location in your PATH:
   ```bash
   sudo mv ngrok /usr/local/bin/
   ```

### Option 3: Use ngrok Desktop App

1. Go to: https://ngrok.com/download
2. Download ngrok Desktop for macOS
3. Install and run the app
4. Use the web interface at http://127.0.0.1:4040

## ✅ After Installation

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Start ngrok (in new terminal):**
   ```bash
   ngrok http 4000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Generate QR with ngrok URL:**
   ```bash
   BASE_URL=https://abc123.ngrok.io npm run generate-qr
   ```

5. **Scan from phone** - Now Google Pay will open! 🎉

## 🔍 Verify Installation

After installing, test with:
```bash
ngrok version
```

If it shows a version number, you're good to go!

## 📱 What Happens After Setup

When you scan the QR code from your phone with Google Pay:

1. Phone accesses: `https://abc123.ngrok.io/p/SHARED1`
2. ngrok forwards to: `http://localhost:4000/p/SHARED1`
3. Your server detects: "This is Google Pay!"
4. Server redirects to: `upi://pay?pa=nad.nandagiri-3@okicici&am=0`
5. **Google Pay opens with your UPI ID prefilled!** ✅

---

**Once ngrok is installed, mobile testing will work perfectly!**




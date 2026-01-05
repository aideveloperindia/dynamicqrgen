# Client URL Structure

## How Client URLs Are Created

Each client gets a **unique URL** when they sign up. Here's how it works:

### URL Format
```
https://yourdomain.com/p/{uniqueSlug}
```

### Example URLs
- `https://dynamicqrgen.vercel.app/p/john`
- `https://dynamicqrgen.vercel.app/p/sarah123`
- `https://dynamicqrgen.vercel.app/p/businessname`

### How Unique Slug is Generated

1. **From Email (Google OAuth or Registration)**
   - Email: `john.doe@example.com`
   - Base slug: `johndoe` (removes special characters, converts to lowercase)
   - If `johndoe` is taken, tries `johndoe1`, `johndoe2`, etc.

2. **From Email (Password Registration)**
   - Email: `sarah.smith@gmail.com`
   - Base slug: `sarahsmith`
   - If taken, becomes `sarahsmith1`, `sarahsmith2`, etc.

### Code Location
- **Slug Generation**: `config/passport.js` (lines 38-46) and `routes/auth.js` (registration)
- **Public Route**: `routes/public.js` (line 19)
- **URL Display**: Dashboard shows the URL to the user

### Features
- ✅ **Unique**: No two clients can have the same slug
- ✅ **Automatic**: Generated automatically on signup
- ✅ **Persistent**: Never changes once created
- ✅ **SEO Friendly**: Clean, readable URLs

### Accessing Client Pages
When someone scans the QR code, they visit:
```
https://yourdomain.com/p/{uniqueSlug}
```

This displays:
- Business logo (if uploaded)
- Business name
- All active links (Instagram, WhatsApp, Payment, etc.)
- Clicking any link redirects to the configured URL

### Example Flow
1. Client signs up with email: `restaurant@example.com`
2. System generates slug: `restaurant`
3. Client's URL: `https://dynamicqrgen.vercel.app/p/restaurant`
4. QR code links to this URL
5. Customers scan → See restaurant's page → Click links → Redirected to social media/payment/etc.



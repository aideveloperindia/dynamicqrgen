# Complete Technical Flow Documentation
## Dynamic QR Code Generator - Full System Architecture

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Client/User Flow](#clientuser-flow)
3. [Admin Flow](#admin-flow)
4. [Public Flow](#public-flow)
5. [Authentication System](#authentication-system)
6. [Database Models & Relationships](#database-models--relationships)
7. [Payment System](#payment-system)
8. [QR Code Generation](#qr-code-generation)
9. [Route Architecture](#route-architecture)
10. [File Structure](#file-structure)

---

## 🏗️ System Overview

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: Passport.js (Google OAuth + Local Strategy)
- **Session Management**: express-session + connect-mongo
- **Payment**: Razorpay (simplified for testing)
- **QR Generation**: qrcode library
- **Templating**: EJS
- **Deployment**: Vercel (Serverless Functions)
- **File Storage**: Base64 in MongoDB (for serverless compatibility)

### Architecture Type
- **Serverless Architecture** (Vercel)
- **Multi-tenant SaaS** (each client gets unique URL)
- **Session-based Authentication** (MongoDB-backed sessions)

---

## 👤 Client/User Flow

### Step 1: Landing Page (`/`)
**File**: `views/landing.ejs`  
**Route**: `server.js` → `app.get('/', ...)`

**Flow**:
1. User visits `https://dynamicqrgen.vercel.app/`
2. Server checks if user is authenticated:
   - ✅ **Authenticated**: Redirect to `/dashboard`
   - ❌ **Not Authenticated**: Render landing page
3. Landing page displays:
   - Hero section with service description
   - Features section
   - How it works section
   - Pricing (₹999/year)
   - "Sign Up" button in navbar

**Technical Details**:
```javascript
// server.js line 152-167
app.get('/', async (req, res) => {
  if (process.env.VERCEL) await connectDB(); // Lazy DB connection
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('landing');
});
```

---

### Step 2: Sign Up / Login (`/login`)
**File**: `views/login.ejs`  
**Route**: `server.js` → `app.get('/login', ...)`

**Flow**:
1. User clicks "Sign Up" or visits `/login`
2. Server renders login page with two options:
   - **Email/Password Registration**
   - **Google OAuth Login**

#### Option A: Email/Password Registration

**Frontend Flow** (`login.ejs`):
1. User fills form: Name, Email, Password (min 6 chars)
2. JavaScript sends POST to `/auth/register`
3. Shows loading state

**Backend Flow** (`routes/auth.js` → `router.post('/register', ...)`):
1. **Validation**:
   - Check all fields present
   - Validate email format
   - Check password length (≥6 chars)
   - Check name length (≥2 chars)
2. **Check Existing User**:
   - Query MongoDB: `User.findOne({ email })`
   - If exists → Return error "Email already registered"
3. **Generate Unique Slug**:
   - Extract username from email: `email.split('@')[0]`
   - Clean: lowercase, remove special chars
   - Check uniqueness: `User.findOne({ uniqueSlug })`
   - If taken, append counter: `username1`, `username2`, etc.
4. **Create User**:
   - Hash password with bcrypt (10 rounds)
   - Create new User document:
     ```javascript
     {
       email: email.toLowerCase().trim(),
       password: hashedPassword,
       name: name.trim(),
       uniqueSlug: uniqueSlug,
       lastLogin: new Date(),
       subscriptionActive: false,
       // ... other defaults
     }
     ```
5. **Auto Login**:
   - `req.login(user, ...)` - Passport login
   - `req.session.save(...)` - Save session to MongoDB
   - Return JSON: `{ success: true, message: 'Registration successful' }`
6. **Frontend Response**:
   - Show success message
   - Redirect to `/dashboard` after 1 second

#### Option B: Google OAuth Login

**Frontend Flow**:
1. User clicks "Continue with Google"
2. Browser redirects to `/auth/google`

**Backend Flow** (`routes/auth.js` → `router.get('/google', ...)`):
1. Passport authenticates with Google:
   ```javascript
   passport.authenticate('google', { 
     scope: ['profile', 'email'],
     prompt: 'select_account'
   })
   ```
2. User redirected to Google login page
3. User selects account and grants permissions
4. Google redirects to: `/auth/google/callback?code=...`

**Callback Flow** (`routes/auth.js` → `router.get('/google/callback', ...)`):
1. **Passport Strategy** (`config/passport.js`):
   - Exchange code for access token
   - Fetch user profile from Google
   - Check if user exists: `User.findOne({ googleId: profile.id })`
   - If exists → Update `lastLogin`, return user
   - If not exists:
     - Check email: `User.findOne({ email: profile.emails[0].value })`
     - If email exists → Link Google account to existing user
     - If new → Create user with Google data
2. **Login User**:
   - `req.login(user, ...)` - Create session
   - `req.session.save(...)` - Persist to MongoDB
3. **Redirect**: `/dashboard`

---

### Step 3: Dashboard (`/dashboard`)
**File**: `views/dashboard.ejs`  
**Route**: `routes/dashboard.js` → `router.get('/', auth, ...)`

**Authentication Check** (`middleware/auth.js`):
1. Check `req.isAuthenticated()`
2. If not authenticated:
   - API request → Return 403 JSON
   - Page request → Redirect to `/login`
3. Ensure MongoDB connection (for serverless)

**Dashboard Load Flow**:
1. **Fetch User Data**:
   ```javascript
   const user = await User.findById(req.user._id);
   ```
   - Gets: name, email, businessName, logo, subscription status, QR code
2. **Fetch Links**:
   ```javascript
   const links = await Link.find({ 
     userId: req.user._id, 
     isActive: true 
   }).sort({ order: 1 });
   ```
3. **Render Dashboard** with:
   - User profile section
   - Business name & logo upload
   - Links management section
   - Payment/subscription status
   - QR code section (if subscribed)

**Dashboard Features**:

#### A. Update Profile (`POST /dashboard/update-profile`)
**Flow**:
1. User enters business name and/or uploads logo
2. Frontend sends FormData to `/dashboard/update-profile`
3. **Backend** (`routes/dashboard.js`):
   - Multer processes image (memory storage for Vercel)
   - Convert image to base64: `data:image/png;base64,...`
   - Update user document:
     ```javascript
     user.businessName = businessName;
     user.logo = base64DataUrl; // Store in MongoDB
     await user.save();
     ```
4. Return success JSON
5. Frontend updates UI

#### B. Add/Edit Links (`POST /dashboard/link`)
**Flow**:
1. User selects category (Instagram, WhatsApp, etc.) or creates custom
2. Enters URL and display name
3. For custom category: uploads icon image
4. **Backend**:
   - If custom icon → Convert to base64
   - Create/Update Link document:
     ```javascript
     {
       userId: req.user._id,
       category: 'instagram' | 'custom',
       categoryType: 'default' | 'custom',
       url: 'https://...',
       displayName: 'Instagram',
       icon: 'fab fa-instagram' | base64DataUrl,
       order: 0,
       isActive: true
     }
     ```
5. Save to MongoDB
6. Return updated link data
7. Frontend refreshes links list

#### C. Delete Link (`DELETE /dashboard/link/:id`)
**Flow**:
1. User clicks delete on a link
2. Frontend sends DELETE request
3. **Backend**:
   ```javascript
   await Link.findByIdAndDelete(linkId);
   ```
4. Return success
5. Frontend removes from UI

---

### Step 4: Payment (`POST /payment/pay`)
**File**: `routes/payment.js`  
**Route**: `router.post('/pay', auth, ...)`

**Flow**:
1. User clicks "Pay ₹999" button on dashboard
2. **Backend Checks**:
   - User authenticated
   - No active subscription (or expired)
3. **Process Payment** (Currently Simplified):
   ```javascript
   // Mark as paid (for testing)
   user.paymentCompleted = true;
   user.subscriptionActive = true;
   user.subscriptionStartDate = new Date();
   user.subscriptionEndDate = new Date() + 1 year;
   user.subscriptionAmount = 999;
   user.paymentId = `manual_${Date.now()}`;
   await user.save();
   
   // Save payment record (optional)
   const payment = new Payment({ ... });
   await payment.save();
   ```
4. Return success JSON
5. Frontend updates UI:
   - Shows "Subscription Active"
   - Enables QR code generation button

**Future Razorpay Integration**:
- Create order: `POST /payment/create-order`
- Verify payment: `POST /payment/verify`
- Webhook: `POST /payment/webhook` (for production)

---

### Step 5: Generate QR Code (`GET /qr/generate`)
**File**: `routes/qr.js`  
**Route**: `router.get('/generate', auth, ...)`

**Flow**:
1. User clicks "Generate QR Code" button
2. **Backend Checks**:
   - User authenticated
   - Subscription active: `user.subscriptionActive && user.subscriptionEndDate > now`
   - At least one active link exists
3. **Generate QR Code**:
   ```javascript
   const baseUrl = process.env.BASE_URL;
   const pageUrl = `${baseUrl}/p/${user.uniqueSlug}`;
   
   // Generate QR as base64 data URL
   const qrDataUrl = await QRCode.toDataURL(pageUrl, {
     width: 500,
     margin: 2,
     color: { dark: '#000000', light: '#FFFFFF' }
   });
   
   // Store in user document
   user.qrCode = qrDataUrl;
   await user.save();
   ```
4. Return JSON:
   ```json
   {
     "success": true,
     "qrUrl": "data:image/png;base64,...",
     "pageUrl": "https://dynamicqrgen.vercel.app/p/username"
   }
   ```
5. Frontend displays QR code image
6. User can download QR code

**QR Code Points To**: `/p/{uniqueSlug}` (public page)

---

### Step 6: Public Page (`/p/:slug`)
**File**: `views/public-page.ejs`  
**Route**: `routes/public.js` → `router.get('/:slug', ...)`

**Flow**:
1. Customer scans QR code
2. Browser opens: `https://dynamicqrgen.vercel.app/p/username`
3. **Backend**:
   ```javascript
   // Find user by unique slug
   const user = await User.findOne({ uniqueSlug: req.params.slug });
   if (!user) return res.status(404).send('Page not found');
   
   // Get active links
   const links = await Link.find({ 
     userId: user._id, 
     isActive: true 
   }).sort({ order: 1 });
   
   // Render public page
   res.render('public-page', { user, links });
   ```
4. **Public Page Displays**:
   - Business logo (if uploaded)
   - Business name
   - List of active links (Instagram, WhatsApp, etc.)
   - Each link is clickable

**Link Click Flow** (`/p/:slug/redirect/:linkId`):
1. Customer clicks a link (e.g., Instagram)
2. Browser goes to: `/p/username/redirect/linkId123`
3. **Backend**:
   ```javascript
   const link = await Link.findById(linkId);
   res.redirect(link.url); // Redirect to actual URL
   ```
4. Customer redirected to Instagram/WhatsApp/etc.

---

## 🔐 Admin Flow

### Step 1: Admin Login (`/admin/login`)
**File**: `views/admin-login.ejs`  
**Route**: `routes/admin.js` → `router.get('/login', ...)`

**Flow**:
1. Admin visits `/admin/login` (or clicks "Admin" link in footer)
2. Simple login form (email + password)
3. **Backend** (`routes/admin.js`):
   ```javascript
   // Find admin by email
   const admin = await Admin.findOne({ email });
   if (!admin) return error;
   
   // Verify password
   const isMatch = await bcrypt.compare(password, admin.password);
   if (!isMatch) return error;
   
   // Login admin
   req.login(admin, ...);
   req.session.save(...);
   ```
4. Redirect to `/admin` (dashboard)

**Note**: Currently accepts any password for testing (auto-login)

---

### Step 2: Admin Dashboard (`/admin`)
**File**: `views/admin-dashboard.ejs`  
**Route**: `routes/admin.js` → `router.get('/', adminAuth, ...)`

**Authentication** (`routes/admin.js` → `adminAuth` middleware):
1. Check `req.isAuthenticated()`
2. Check if user is Admin (not regular User)
3. If not → Redirect to `/admin/login`

**Dashboard Load**:
1. **Fetch Statistics**:
   ```javascript
   const totalClients = await User.countDocuments();
   const activeSubscriptions = await User.countDocuments({ 
     subscriptionActive: true 
   });
   const totalLinks = await Link.countDocuments({ isActive: true });
   const qrCodesGenerated = await User.countDocuments({ 
     qrCode: { $exists: true, $ne: '' } 
   });
   ```
2. **Calculate Revenue**:
   ```javascript
   const revenue = await User.aggregate([
     { $match: { subscriptionActive: true } },
     { $group: { _id: null, total: { $sum: '$subscriptionAmount' } } }
   ]);
   ```
3. **Recent Clients**:
   ```javascript
   const recentClients = await User.find()
     .sort({ createdAt: -1 })
     .limit(10)
     .select('name email createdAt subscriptionActive');
   ```
4. Render dashboard with all stats

**Admin Features**:
- View all clients
- View client details
- View statistics
- Export data (future)

---

## 🔄 Authentication System

### Session Management

**Configuration** (`server.js`):
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'qr.sid'
}));
```

**Why MongoDB Store?**
- Vercel is serverless (stateless functions)
- In-memory sessions don't persist between requests
- MongoDB store persists sessions across function invocations

### Passport Serialization

**Serialize** (`config/passport.js`):
```javascript
passport.serializeUser((user, done) => {
  done(null, user._id.toString()); // Store user ID in session
});
```

**Deserialize** (`config/passport.js`):
```javascript
passport.deserializeUser(async (id, done) => {
  await connectDB(); // Ensure DB connection
  let user = await User.findById(id);
  if (!user) {
    const admin = await Admin.findById(id);
    return done(null, admin || false);
  }
  done(null, user);
});
```

**Flow**:
1. User logs in → Passport serializes user ID to session
2. Each request → Passport deserializes ID → Fetches user from DB
3. `req.user` available in all routes

---

## 🗄️ Database Models & Relationships

### User Model (`models/User.js`)

```javascript
{
  googleId: String (optional, unique),
  email: String (required, unique),
  password: String (hashed, select: false),
  name: String (required),
  picture: String (Google profile picture),
  uniqueSlug: String (unique, for public URL),
  businessName: String,
  logo: String (base64 data URL),
  qrCode: String (base64 data URL),
  paymentCompleted: Boolean,
  paymentId: String,
  subscriptionActive: Boolean,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  subscriptionAmount: Number (default: 999),
  createdAt: Date,
  lastLogin: Date
}
```

**Indexes**:
- `email` (unique)
- `uniqueSlug` (unique)
- `subscriptionActive`
- `createdAt` (descending)

### Link Model (`models/Link.js`)

```javascript
{
  userId: ObjectId (ref: 'User', required),
  category: String (required), // 'instagram', 'whatsapp', 'custom', etc.
  categoryType: String (enum: ['default', 'custom']),
  url: String (required),
  icon: String (required), // FontAwesome class or base64
  displayName: String (required),
  order: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date
}
```

**Relationship**: One User → Many Links

### Payment Model (`models/Payment.js`)

```javascript
{
  userId: ObjectId (ref: 'User', required),
  razorpayOrderId: String (required),
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number (required), // in paise
  currency: String (default: 'INR'),
  status: String (enum: ['pending', 'completed', 'failed']),
  createdAt: Date
}
```

**Relationship**: One User → Many Payments

### Admin Model (`models/Admin.js`)

```javascript
{
  email: String (required, unique),
  password: String (hashed, required),
  name: String (required),
  lastLogin: Date
}
```

---

## 💳 Payment System

### Current Implementation (Simplified)

**Flow**:
1. User clicks "Pay ₹999"
2. `POST /payment/pay`
3. Backend marks payment as completed (no actual payment gateway)
4. Activates subscription for 1 year
5. Enables QR code generation

### Future Razorpay Integration

**Step 1: Create Order** (`POST /payment/create-order`):
```javascript
const razorpay = getRazorpay();
const order = await razorpay.orders.create({
  amount: 99900, // ₹999 in paise
  currency: 'INR',
  receipt: `order_${userId}_${Date.now()}`
});
// Return order ID to frontend
```

**Step 2: Frontend Payment**:
- Load Razorpay checkout
- User enters payment details
- Razorpay processes payment

**Step 3: Verify Payment** (`POST /payment/verify`):
```javascript
const { orderId, paymentId, signature } = req.body;
const text = orderId + '|' + paymentId;
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(text)
  .digest('hex');

if (generatedSignature === signature) {
  // Payment verified
  // Activate subscription
}
```

**Step 4: Webhook** (`POST /payment/webhook`):
- Razorpay sends webhook on payment events
- Verify webhook signature
- Update payment status

---

## 📱 QR Code Generation

### Technical Details

**Library**: `qrcode` (npm package)

**Generation** (`routes/qr.js`):
```javascript
const QRCode = require('qrcode');

// Generate as base64 data URL
const qrDataUrl = await QRCode.toDataURL(pageUrl, {
  width: 500,        // Image size
  margin: 2,         // Border margin
  color: {
    dark: '#000000',  // QR code color
    light: '#FFFFFF'  // Background color
  }
});

// Store in MongoDB (base64 string)
user.qrCode = qrDataUrl;
await user.save();
```

**Why Base64?**
- Vercel has read-only filesystem
- Can't save files to disk
- Base64 stored in MongoDB
- Frontend displays: `<img src="${qrDataUrl}">`

**QR Code Content**:
- Points to: `https://dynamicqrgen.vercel.app/p/{uniqueSlug}`
- When scanned → Opens public page

---

## 🛣️ Route Architecture

### Route Structure

```
/                           → Landing page (or redirect to /dashboard)
/login                      → Login/Sign up page
/auth/google                → Google OAuth initiation
/auth/google/callback       → Google OAuth callback
/auth/register              → Email/password registration
/auth/login                 → Email/password login
/auth/logout                → Logout

/dashboard                  → Client dashboard (protected)
/dashboard/update-profile   → Update business name/logo
/dashboard/link             → Add/Edit link
/dashboard/link/:id         → Delete link

/payment/pay                → Process payment (simplified)
/payment/create-order       → Create Razorpay order (future)
/payment/verify             → Verify Razorpay payment (future)

/qr/generate                → Generate QR code (protected)
/qr/get                     → Get existing QR code (protected)

/p/:slug                    → Public page (anyone can access)
/p/:slug/redirect/:linkId   → Redirect to actual link URL

/admin/login                → Admin login
/admin                      → Admin dashboard (protected)
/admin/stats                → Admin statistics API
/admin/clients               → Admin clients list API
```

### Middleware Chain

**Request Flow**:
```
Request → Express Middleware
  → Body Parser (JSON, URL-encoded)
  → Session Middleware (MongoDB store)
  → Passport Initialize
  → Passport Session
  → CSP Headers
  → Static Files
  → Routes
  → Error Handler (if error)
  → 404 Handler (if no route)
```

### Authentication Middleware

**Regular Routes** (`middleware/auth.js`):
```javascript
if (!req.isAuthenticated()) {
  if (API request) return 403 JSON;
  else return redirect('/login');
}
```

**Admin Routes** (`routes/admin.js` → `adminAuth`):
```javascript
if (!req.isAuthenticated() || !req.user.isAdmin) {
  return redirect('/admin/login');
}
```

---

## 📁 File Structure

```
dynamicqrgen/
├── config/
│   ├── database.js          # MongoDB connection (lazy for serverless)
│   └── passport.js          # Passport.js configuration (Google OAuth + Local)
│
├── models/
│   ├── User.js              # User/Client model
│   ├── Link.js               # Link model (Instagram, WhatsApp, etc.)
│   ├── Payment.js            # Payment record model
│   └── Admin.js              # Admin user model
│
├── routes/
│   ├── auth.js               # Authentication routes (login, register, OAuth)
│   ├── dashboard.js          # Client dashboard routes
│   ├── payment.js            # Payment processing routes
│   ├── qr.js                 # QR code generation routes
│   ├── public.js             # Public page routes (/p/:slug)
│   └── admin.js              # Admin panel routes
│
├── middleware/
│   └── auth.js               # Authentication middleware
│
├── views/
│   ├── landing.ejs           # Landing page
│   ├── login.ejs             # Login/Sign up page
│   ├── dashboard.ejs         # Client dashboard
│   ├── public-page.ejs       # Public QR code page
│   ├── admin-login.ejs       # Admin login
│   ├── admin-dashboard.ejs    # Admin dashboard
│   └── error.ejs             # Error page
│
├── public/
│   └── images/
│       ├── qrconnect logo.png
│       └── A-logo-transparent.png
│
├── scripts/
│   ├── create-admin.js       # Script to create admin user
│   └── cleanup-inactive-accounts.js  # Cleanup script
│
├── server.js                 # Main Express app
├── vercel.json               # Vercel deployment config
└── package.json              # Dependencies
```

---

## 🔄 Complete User Journey Example

### Scenario: New Business Owner Signs Up

1. **Landing Page** (`/`)
   - Sees service description
   - Clicks "Sign Up"

2. **Registration** (`/login`)
   - Chooses "Sign up" tab
   - Enters: Name, Email, Password
   - Clicks "Create Account"
   - Backend creates user with `uniqueSlug: "johndoe"`
   - Auto-login → Redirect to `/dashboard`

3. **Dashboard** (`/dashboard`)
   - Sees empty dashboard
   - Updates profile:
     - Business Name: "John's Restaurant"
     - Uploads logo
   - Adds links:
     - Instagram: `https://instagram.com/johnsrestaurant`
     - WhatsApp: `https://wa.me/1234567890`
     - Menu: `https://menu.com/johnsrestaurant`

4. **Payment** (`POST /payment/pay`)
   - Clicks "Pay ₹999"
   - Backend activates subscription
   - Subscription active for 1 year

5. **Generate QR** (`GET /qr/generate`)
   - Clicks "Generate QR Code"
   - Backend generates QR pointing to `/p/johndoe`
   - QR code displayed on dashboard
   - Downloads QR code

6. **Customer Scans QR**
   - Opens: `https://dynamicqrgen.vercel.app/p/johndoe`
   - Sees: Business logo, name, and links
   - Clicks Instagram → Redirected to Instagram
   - Clicks WhatsApp → Opens WhatsApp chat

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt (10 rounds)
2. **Session Security**: 
   - HttpOnly cookies
   - Secure flag in production
   - SameSite protection
3. **Input Validation**: All user inputs validated
4. **Authentication**: Protected routes require auth
5. **CSP Headers**: Content Security Policy for XSS protection
6. **Environment Variables**: Secrets in Vercel env vars

---

## 🚀 Deployment Flow (Vercel)

1. **Code Push** → GitHub
2. **Vercel Auto-Deploy**:
   - Detects changes
   - Builds serverless functions
   - Deploys to edge network
3. **Cold Start**:
   - First request initializes function
   - Connects to MongoDB (lazy)
   - Subsequent requests reuse connection
4. **Session Persistence**:
   - Sessions stored in MongoDB
   - Survives function invocations
   - Works across edge locations

---

## 📊 Data Flow Diagrams

### Registration Flow
```
User → /login → Fill Form → POST /auth/register
  → Validate → Check Existing → Generate Slug
  → Hash Password → Create User → Save to MongoDB
  → req.login() → Save Session → Return Success
  → Frontend Redirect → /dashboard
```

### Google OAuth Flow
```
User → Click "Continue with Google" → /auth/google
  → Redirect to Google → User Selects Account
  → Google → /auth/google/callback?code=...
  → Exchange Code → Get Profile → Check/Create User
  → req.login() → Save Session → Redirect /dashboard
```

### QR Generation Flow
```
User → /dashboard → Click "Generate QR"
  → GET /qr/generate → Check Subscription → Check Links
  → Generate QR (base64) → Save to User.qrCode
  → Return JSON → Frontend Display QR
```

### Public Page Flow
```
Customer → Scan QR → /p/username
  → Find User by slug → Get Links
  → Render public-page.ejs
  → Customer Clicks Link → /p/username/redirect/linkId
  → Find Link → Redirect to link.url
```

---

## 🎯 Key Technical Decisions

1. **Base64 Storage**: Files stored as base64 in MongoDB (Vercel read-only filesystem)
2. **Lazy DB Connection**: Connect on-demand for serverless
3. **MongoDB Session Store**: Persist sessions across function invocations
4. **Unique Slugs**: Auto-generated from email for SEO-friendly URLs
5. **Serverless Architecture**: All routes are serverless functions
6. **Multi-tenant**: Each user gets unique public URL

---

## 📝 Environment Variables Required

```env
# Database
MONGODB_URI=mongodb+srv://...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://dynamicqrgen.vercel.app/auth/google/callback

# Session
SESSION_SECRET=...

# Razorpay (optional)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Base URL
BASE_URL=https://dynamicqrgen.vercel.app
```

---

This documentation covers the complete technical flow of the entire system. Each module, route, and feature is explained with code examples and flow diagrams.


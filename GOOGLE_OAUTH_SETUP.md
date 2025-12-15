# Google OAuth Setup - Local Development

## Server Configuration
- **Port**: 4000
- **Base URL**: http://localhost:4000

## Google Cloud Console Configuration

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### Step 2: Create OAuth 2.0 Client ID

1. Click "Create Credentials" → "OAuth 2.0 Client ID"
2. If prompted, configure the OAuth consent screen first

### Step 3: Configure OAuth Consent Screen (if not done)
- User Type: External
- App name: Dynamic QR Generator
- User support email: Your email
- Developer contact: Your email
- Save and Continue

### Step 4: Configure OAuth Client

**Application type**: Web application

**Name**: Dynamic QR Generator (Local)

**Authorized JavaScript origins** (For use with requests from a browser):
```
http://localhost:4000
```

**Authorized redirect URIs** (For use with requests from a web server):
```
http://localhost:4000/auth/google/callback
```

### Step 5: Copy Credentials

After creating, you'll get:
- **Client ID**: Copy this to `.env` as `GOOGLE_CLIENT_ID`
- **Client Secret**: Copy this to `.env` as `GOOGLE_CLIENT_SECRET`

### Step 6: Update .env File

```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

## Testing

1. Start the server: `npm start`
2. Visit: http://localhost:4000
3. Click "Continue with Google"
4. You should be redirected to Google login

## Production Setup (After Deployment)

When you deploy to production, add these additional URLs:

**Authorized JavaScript origins**:
```
http://localhost:4000
https://your-production-domain.com
```

**Authorized redirect URIs**:
```
http://localhost:4000/auth/google/callback
https://your-production-domain.com/auth/google/callback
```

Then update `.env` in production:
```env
GOOGLE_CALLBACK_URL=https://your-production-domain.com/auth/google/callback
BASE_URL=https://your-production-domain.com
```


# Admin Panel Features

## Access
- **URL**: `/admin` or `/admin/login`
- **Auto-Login**: No password required - automatically logs in when you visit
- **Footer Link**: Small "Admin" link in footer (bottom right)

## Features

### 1. Dashboard Statistics
View real-time statistics:
- **Total Clients**: All registered users
- **Active Subscriptions**: Users with active paid subscriptions
- **Total Links**: All active links created by clients
- **QR Codes Generated**: Number of QR codes created
- **Total Revenue**: Sum of all subscription payments (₹999 × active subscriptions)
- **New Clients (30d)**: Clients registered in last 30 days

### 2. Client Management
- **View All Clients**: Paginated list of all registered clients
- **Client Details**: 
  - Name, Email, Business Name
  - Subscription Status (Active/Inactive with expiry date)
  - Join Date
  - View individual client details and their links

### 3. Client Information Displayed
For each client, you can see:
- Full name
- Email address
- Business name (if set)
- Subscription status
- Subscription end date
- Date joined
- All their active links

### 4. Analytics & Insights
- Track business growth
- Monitor subscription renewals
- See client engagement
- Revenue tracking

## How to Access

1. **From Footer**: Click the small "Admin" link at the bottom of any page
2. **Direct URL**: Visit `/admin` or `/admin/login`
3. **Auto-Login**: No password needed - automatically authenticates

## Technical Details

- **Auto-Login**: Creates/uses default admin account (`admin@qrconnect.com`)
- **Session Management**: Uses same session system as regular users
- **Real-time Data**: All stats are fetched from MongoDB in real-time
- **Pagination**: Client list is paginated (20 per page)

## Security Note

Currently, admin panel uses auto-login for convenience. For production, consider:
- Adding IP whitelist
- Adding password protection
- Adding 2FA
- Restricting access to specific emails



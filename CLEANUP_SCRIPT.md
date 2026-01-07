# Inactive Accounts Cleanup Script

## Overview
This script automatically removes inactive user accounts to keep the database clean and reduce storage costs.

## What Gets Deleted

The script removes accounts that meet **any** of these criteria:

1. **Inactive Accounts**: Haven't logged in for 180+ days
2. **Never Logged In**: Created 90+ days ago but never logged in
3. **Incomplete Accounts**: Created 30+ days ago with:
   - No active subscription
   - No business name
   - No links
   - No QR code

## Usage

### Dry Run (Preview Only)
See what would be deleted without actually deleting:
```bash
npm run cleanup:dry-run
```

### Actual Cleanup
Delete inactive accounts:
```bash
npm run cleanup
```

## What Gets Deleted

When an account is deleted:
- ✅ User account is removed
- ✅ All associated links are removed
- ✅ User data (business name, logo, QR code) is removed

**Note**: This action cannot be undone. Always run with `--dry-run` first!

## Configuration

You can modify the thresholds in `scripts/cleanup-inactive-accounts.js`:
- `DAYS_INACTIVE`: Default 180 days
- `DAYS_NEVER_LOGGED_IN`: Default 90 days
- `DAYS_INCOMPLETE`: Default 30 days

## Recommended Schedule

Run cleanup monthly or quarterly:
- **Monthly**: For active platforms with many signups
- **Quarterly**: For stable platforms

## Safety Features

- ✅ Dry-run mode to preview deletions
- ✅ Detailed logging of what will be deleted
- ✅ Summary statistics before and after cleanup
- ✅ Only deletes accounts matching strict criteria




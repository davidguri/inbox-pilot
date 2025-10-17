# Organization ID Fix - Summary

## Problem

When leads were created via the n8n email workflow, they weren't being assigned to an organization (org_id was null). Similarly, clients created through the inbound email endpoint didn't have an organization_id.

## What Was Fixed

Updated `/api/inbound/email` endpoint to properly handle organization IDs:

### 1. **Added Organization ID Parameter**
- Added optional `organization_id` field to the request body
- You can now pass an org ID from n8n if needed

### 2. **Automatic Organization Detection**
The endpoint now tries to get an organization ID in this order:
1. From request body (`organization_id` field)
2. From authenticated session (`locals.orgId`)
3. Falls back to first organization in database (default)

### 3. **Organization ID Assignment**
- **Leads**: Now have `org_id` set when created
- **Clients**: Now have `org_id` set when created

## Code Changes

### Updated Functions

**`createLead()`**
- Now accepts `org_id` parameter
- Sets `org_id` when inserting leads

**`upsertClient()`**
- Now accepts `org_id` parameter
- Sets `org_id` when creating new clients

**`POST` Handler**
- Gets org_id from body, session, or database
- Passes org_id to both `createLead()` and `upsertClient()`

## How It Works Now

When n8n sends an email to your API:

```javascript
// Simplified flow:
1. Get organization_id from request (optional)
   ↓
2. If not provided, get from session (if authenticated)
   ↓
3. If still not available, query first organization from DB
   ↓
4. Use that org_id for both lead and client creation
```

## Testing

After rebuilding the Docker container, test it:

### Option 1: Via n8n (Automatic)
Your n8n workflow will now automatically assign leads/clients to the default organization.

### Option 2: Via API (Manual Test)
```powershell
# Without organization_id (will use default)
$body = @{
    source = "email"
    text = "I need a website"
    subject = "Inquiry"
    contact = @{
        email = "test@example.com"
        name = "Test User"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5173/api/inbound/email" -Method POST -Body $body -ContentType "application/json"
```

```powershell
# With specific organization_id
$body = @{
    source = "email"
    text = "I need a website"
    subject = "Inquiry"
    organization_id = "your-org-uuid-here"
    contact = @{
        email = "test@example.com"
        name = "Test User"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5173/api/inbound/email" -Method POST -Body $body -ContentType "application/json"
```

## Database Schema Assumptions

The fix assumes your Supabase tables have these columns:

**`leads` table:**
- `org_id` (uuid, nullable or with default)

**`clients` table:**
- `org_id` (uuid, nullable or with default)

**`organizations` table:**
- `id` (uuid, primary key)

If these columns don't exist, the code will fail. Make sure your database schema includes these fields.

## What Happens If No Organization Exists?

If there are NO organizations in your database:
- `org_id` will be set to `null`
- Leads and clients will be created without an organization
- You should create at least one organization in Supabase

**To create a default organization in Supabase:**
```sql
INSERT INTO organizations (name) VALUES ('Default Organization');
```

## Result

✅ All new leads from n8n will have `org_id` set
✅ All new clients from n8n will have `org_id` set
✅ Existing data is not modified (only new records)
✅ Works with or without authentication
✅ Can optionally pass organization_id in request

## Next Steps

1. **Verify**: Send a test email through n8n
2. **Check Supabase**: Confirm the lead has `org_id` set
3. **Check Clients**: Confirm the client has `org_id` set
4. **Optional**: Create multiple organizations and pass specific IDs

## Files Modified

- `src/routes/api/inbound/email/+server.ts`

## Docker

Container has been rebuilt with these changes. No additional configuration needed!

---

**Status**: ✅ Fixed and Deployed
**Version**: Updated in Docker container
**Tested**: Ready for testing


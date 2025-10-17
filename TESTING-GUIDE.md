# Testing Guide - Inbox Pilot + n8n Docker Setup

This guide will help you verify that your Dockerized setup is working correctly.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Docker Desktop installed and running
- [ ] Supabase project created with credentials
- [ ] `.env` file configured with Supabase credentials
- [ ] Email account credentials (for n8n IMAP integration)

## Phase 1: Docker Setup Verification

### 1.1 Start Services

```powershell
# Use the helper script
.\start-docker.ps1

# Or manually
docker-compose up -d
```

**Expected Output:**
```
✔ Container inbox-pilot-app  Started
✔ Container inbox-pilot-n8n  Started
```

### 1.2 Verify Services Are Running

```bash
docker-compose ps
```

**Expected Output:**
```
NAME                IMAGE              STATUS
inbox-pilot-app     inbox-pilot-app    Up (healthy)
inbox-pilot-n8n     n8nio/n8n:latest   Up (healthy)
```

✅ Both services should show "Up" status
✅ After ~30 seconds, they should show "Up (healthy)"

### 1.3 Check Logs

```bash
# View all logs
docker-compose logs -f
```

**What to look for:**
- ✅ No error messages in red
- ✅ Inbox Pilot should show: "Listening on http://0.0.0.0:3000"
- ✅ n8n should show: "Editor is now accessible via: http://localhost:5678/"

Press `Ctrl+C` to exit log view.

### 1.4 Test Service Accessibility

Open your browser and visit:

1. **Inbox Pilot**: http://localhost:3000
   - ✅ Should load the application UI
   - ✅ No console errors (check browser DevTools)

2. **n8n**: http://localhost:5678
   - ✅ Should load the n8n interface
   - ✅ No errors displayed

## Phase 2: n8n Configuration

### 2.1 Import Workflow

1. Open n8n: http://localhost:5678
2. Click "Workflows" in the left sidebar
3. Click "+ Add workflow"
4. Click the three dots (⋮) → "Import from File"
5. Select `n8n-email-workflow.json`

✅ Workflow should import successfully

### 2.2 Configure Email Credentials

1. Click on the "Email Trigger (IMAP)" node
2. Click "Create New Credential" under IMAP
3. Enter your email settings:
   ```
   User: your-email@domain.com
   Password: your-app-password
   Host: imap.gmail.com
   Port: 993
   SSL/TLS: ✓ (checked)
   ```
4. Click "Save"

✅ Credentials should save without errors

**For Gmail:**
- Enable IMAP in Gmail settings
- Generate an App Password (not your regular password)
- Go to: Google Account → Security → 2-Step Verification → App passwords

### 2.3 Verify Server URL Configuration

1. Click on the "Send to Server" or "HTTP Request" node
2. Check the URL field should show:
   ```
   {{ $env.SERVER_URL }}/api/inbound/email
   ```
   or
   ```
   http://inbox-pilot:3000/api/inbound/email
   ```

✅ URL should use `inbox-pilot:3000` (NOT `localhost:3000`)

### 2.4 Save and Activate Workflow

1. Click "Save" in the top right
2. Toggle "Active" switch to ON

✅ Workflow should activate without errors

## Phase 3: End-to-End Testing

### 3.1 Test API Endpoint Directly

From your host machine (Windows), test the API:

```powershell
# Test from host machine
$body = @{
    source = "email"
    text = "Hi, I need a website for my restaurant. Budget is $5000."
    subject = "Website Inquiry"
    external_id = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    contact = @{
        email = "test@example.com"
        name = "Test User"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/inbound/email" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "ok": true,
  "leadId": "uuid-here",
  "clientId": "uuid-here",
  "intent": "sales",
  "urgency": "medium",
  "urgency_score": 65,
  "urgency_reasons": ["Budget mentioned", ...],
  "sentiment": "positive",
  ...
}
```

✅ Should return `ok: true`
✅ Should include `leadId` and `clientId`
✅ Should show AI classification results

### 3.2 Verify in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Check the `leads` table

✅ Should see the test lead with:
- `raw_text`: Your test message
- `subject`: "Website Inquiry"
- `intent`: AI-classified intent
- `urgency`: Urgency level
- `sentiment`: Sentiment analysis

4. Check the `clients` table

✅ Should see a client record with email "test@example.com"

### 3.3 Test from n8n Container

This verifies that n8n can reach Inbox Pilot via the Docker network:

```bash
# Enter the n8n container
docker-compose exec n8n sh

# Test the API endpoint
wget -O- --post-data='{"source":"email","text":"Test from n8n container","subject":"Docker Test","external_id":"n8n-test-123","contact":{"email":"n8n-test@example.com","name":"N8N Test"}}' --header="Content-Type: application/json" http://inbox-pilot:3000/api/inbound/email

# Exit the container
exit
```

**Expected Output:**
```json
{"ok":true,"leadId":"uuid",...}
```

✅ Should return successful JSON response
✅ Should create another lead in Supabase

### 3.4 Test Email Workflow

1. Send a test email to your monitored inbox
2. Subject: "Docker Test - Website Inquiry"
3. Body: "Hello, I'm interested in building a website. Can you help?"

4. Wait for the poll cycle (default: 1 minute)

5. In n8n, click "Executions" in the left sidebar

✅ Should see a new execution
✅ Execution should be "Success" (green)
✅ All nodes should show green checkmarks

6. Click on the execution to view details

✅ Should see the email data in the trigger node
✅ Should see the API response in the HTTP Request node

7. Check Supabase

✅ Should see a new lead with your email content
✅ Lead should be linked to a client

## Phase 4: Integration Testing

### 4.1 Test AI Classification

Send an email with different intents:

**Test Case 1: Sales Lead**
```
Subject: Need a Website
Body: I need a professional website for my business. Budget ready.
Expected: intent="sales", urgency="medium/high"
```

**Test Case 2: Support Request**
```
Subject: Help with existing project
Body: I'm having an issue with the website you built last month.
Expected: intent="support", urgency="medium"
```

**Test Case 3: Spam**
```
Subject: Congratulations! You won!
Body: Click here to claim your prize money now!
Expected: intent="spam", urgency="low"
```

For each test:
1. Send the email
2. Wait for n8n to process it
3. Check the lead in Supabase
4. Verify AI classification matches expectations

### 4.2 Test Deduplication

1. Send the same email twice to your monitored inbox
2. Check Supabase

✅ Should only create ONE lead (deduplication by `external_id`)

### 4.3 Test Dashboard Display

1. Open Inbox Pilot: http://localhost:3000
2. Navigate to Dashboard or Leads page

✅ Should see all test leads displayed
✅ Should see correct intent labels
✅ Should see urgency indicators
✅ Should see client information

## Troubleshooting Tests

### If API Test Fails

**Check 1: Is Inbox Pilot running?**
```bash
docker-compose ps inbox-pilot
```

**Check 2: Check logs**
```bash
docker-compose logs inbox-pilot
```

**Check 3: Test basic connectivity**
```bash
curl http://localhost:3000/
```

### If n8n Can't Reach Inbox Pilot

**Check 1: Are services on same network?**
```bash
docker network inspect inbox-pilot_inbox-pilot-network
```
Should show both containers.

**Check 2: Test from n8n container**
```bash
docker-compose exec n8n wget -O- http://inbox-pilot:3000/
```

**Check 3: Verify URL in workflow**
Should be `http://inbox-pilot:3000` NOT `http://localhost:3000`

### If Email Not Triggering

**Check 1: IMAP credentials**
- Verify username/password in n8n
- For Gmail, ensure App Password is used

**Check 2: Poll frequency**
- Check n8n workflow settings
- Default is every 1 minute

**Check 3: Email in correct mailbox**
- Verify email arrived in INBOX
- Check spam folder

**Check 4: n8n execution log**
```bash
docker-compose logs n8n
```

### If Supabase Errors

**Check 1: Environment variables**
```bash
docker-compose exec inbox-pilot printenv | grep SUPABASE
```

Should show your Supabase URL and key.

**Check 2: Supabase permissions**
- Verify anon key has permissions
- Check Row Level Security (RLS) policies

## Success Checklist

After completing all tests, you should have:

- [x] Both services running and healthy
- [x] n8n workflow imported and active
- [x] Email credentials configured
- [x] API endpoint accessible from host
- [x] API endpoint accessible from n8n container
- [x] Test email processed successfully
- [x] Lead created in Supabase with AI classification
- [x] Client created in Supabase
- [x] Dashboard displaying leads correctly
- [x] All three intent types tested (sales, support, spam)
- [x] Deduplication working

## Performance Benchmarks

Expected response times:

| Test | Expected Time |
|------|--------------|
| API response (simple text) | < 2 seconds |
| API response (long text) | < 5 seconds |
| Email to Supabase (full flow) | < 1 minute (+ poll interval) |
| n8n workflow execution | < 10 seconds |

## Next Steps After Successful Testing

1. Configure production email account
2. Adjust n8n poll frequency as needed
3. Set up monitoring and alerts
4. Enable n8n basic authentication
5. Configure email auto-replies (optional)
6. Set up backup routine for n8n workflows

## Getting Help

If tests fail:

1. Check logs: `docker-compose logs -f`
2. Review error messages carefully
3. Verify environment variables
4. Check network connectivity
5. Refer to DOCKER-SETUP.md for troubleshooting
6. Check DOCKER-QUICK-REFERENCE.md for common issues

## Clean Up After Testing

To remove test data:

```sql
-- In Supabase SQL Editor
DELETE FROM leads WHERE external_id LIKE 'test-%';
DELETE FROM clients WHERE email LIKE '%test%';
```

To reset Docker environment:

```bash
docker-compose down -v
docker-compose up -d
```

---

**Ready for Production?** See DOCKER-SETUP.md section "Production Considerations" for deployment checklist.


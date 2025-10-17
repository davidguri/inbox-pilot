# n8n Testing Guide for Inbox Pilot

## Quick Test Checklist

- [ ] n8n is running at http://localhost:5678
- [ ] Inbox Pilot is running at http://localhost:5173
- [ ] Workflow imported successfully
- [ ] IMAP credentials configured
- [ ] Authentication set to "None" (for testing)
- [ ] Workflow activated
- [ ] Test email sent
- [ ] Lead appears in Supabase

## Step-by-Step Testing

### 1. Import Workflow

1. Open n8n: http://localhost:5678
2. Click **"Workflows"** → **"+ Add workflow"**
3. Click **menu (⋮)** → **"Import from File"**
4. Select `n8n-email-workflow.json`
5. Workflow loads successfully ✅

### 2. Configure IMAP Email Credentials

Click on the **"Email Trigger (IMAP)"** node:

#### For Gmail:
1. Click **"Create New Credential"** under IMAP
2. Fill in:
   ```
   User: your-email@gmail.com
   Password: your-app-password (NOT your regular password!)
   Host: imap.gmail.com
   Port: 993
   SSL/TLS: ✓ (checked)
   ```
3. Click **"Save"**

**Getting Gmail App Password:**
- Go to: https://myaccount.google.com/apppasswords
- Enable 2-Step Verification first (if not enabled)
- Create App Password for "Mail"
- Use that 16-character password (not your regular Gmail password)

#### For Microsoft 365/Outlook:
```
User: your-email@outlook.com
Password: your-password
Host: outlook.office365.com
Port: 993
SSL/TLS: ✓ (checked)
```

#### For Other Providers:
Check your email provider's IMAP settings documentation.

### 3. Configure HTTP Request Authentication

Click on the **"Send to Server"** node:

**Option A: No Authentication (Recommended for Testing)**
1. Under **Authentication**, select **"None"**
2. Click **"Save"** (bottom right)

**Option B: Add Authentication (Optional)**
1. Go to **Credentials** → **"+ Add Credential"** → **"Header Auth"**
2. Configure:
   ```
   Name: API Key
   Header Name: Authorization
   Header Value: Bearer my-secret-key-123
   ```
3. Return to workflow and select this credential

### 4. Verify Server URL

In the **"Send to Server"** node, verify the URL:
```
{{ $env.SERVER_URL }}/api/inbound/email
```

This should resolve to: `http://inbox-pilot:5173/api/inbound/email`

### 5. Save and Activate Workflow

1. Click **"Save"** button (top right)
2. Toggle **"Active"** switch to ON
3. Workflow is now listening for emails!

## 🧪 Test Methods

### Method 1: Manual Test (Without Email)

Test the API directly first:

```powershell
# Test from your machine
$body = @{
    source = "email"
    text = "Hi, I need a professional website for my restaurant business. We have a budget ready and need it done within 2 months. Can you help?"
    subject = "Website Development Inquiry"
    external_id = "test-manual-001"
    contact = @{
        email = "testcustomer@example.com"
        name = "Test Customer"
    }
    meta = @{
        receivedAt = (Get-Date).ToString("o")
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5173/api/inbound/email" -Method POST -Body $body -ContentType "application/json"
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
  "sentiment": "positive",
  ...
}
```

### Method 2: Test with Real Email

#### A. Send Test Email

Send an email to the email account you configured:

**To:** your-monitored-email@gmail.com
**Subject:** Website Inquiry - Test
**Body:**
```
Hello,

I'm interested in getting a new website built for my business. 
We need an e-commerce platform with payment integration.
Our budget is $5000 and we'd like to launch within 3 months.

Can you provide a quote?

Thanks!
John Doe
```

#### B. Wait for Processing

- Default poll interval: **Every 1 minute**
- Wait 1-2 minutes after sending the email
- Watch n8n for execution

#### C. Monitor Execution

In n8n:
1. Click **"Executions"** in the left sidebar
2. You should see a new execution appear
3. Click on it to see details
4. All nodes should show **green checkmarks** ✅

### Method 3: Test Using n8n's "Test Workflow" Feature

1. Open the workflow in n8n
2. Click **"Test Workflow"** button (top right)
3. Click the **"Email Trigger (IMAP)"** node
4. Click **"Fetch Test Event"**
5. n8n will fetch the most recent email
6. Click **"Execute Node"** to process it
7. Check each node's output

## 📊 Verification Steps

### 1. Check n8n Execution Logs

In n8n Executions tab:
- ✅ Status should be **"Success"** (green)
- ✅ All nodes completed successfully
- ✅ "Send to Server" node shows API response

### 2. Check Docker Logs

```powershell
# View Inbox Pilot logs
docker-compose logs -f inbox-pilot

# Look for:
# - Incoming POST to /api/inbound/email
# - AI classification results
# - Success response
```

### 3. Check Supabase Database

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor**
3. Open **`leads`** table
4. You should see a new record with:
   - ✅ `raw_text`: Your email content
   - ✅ `subject`: Email subject
   - ✅ `source`: "email"
   - ✅ `intent`: AI classification (sales/support/spam)
   - ✅ `urgency`: Urgency level (low/medium/high/critical)
   - ✅ `urgency_score`: Numeric score
   - ✅ `sentiment`: Sentiment analysis
   - ✅ `client_id`: UUID linking to client
   - ✅ `external_id`: Email message ID

4. Open **`clients`** table
5. You should see a client record with the sender's email

### 4. Check Inbox Pilot Dashboard

1. Open http://localhost:5173
2. Navigate to **Dashboard** or **Leads** page
3. Your test lead should appear with:
   - Intent badge (sales/support/spam)
   - Urgency indicator
   - Sentiment
   - Client information

## 🔍 Troubleshooting

### Issue: Workflow Not Triggering

**Check:**
```powershell
# Is n8n running?
docker-compose ps n8n

# Is workflow active?
# Check in n8n UI - toggle should be green/ON
```

**Solution:**
- Make sure workflow is saved and activated
- Check email arrived in monitored mailbox
- Check IMAP credentials are correct
- Wait for next poll cycle (1 minute)

### Issue: "Connection Refused" Error

**Problem:** n8n can't reach Inbox Pilot

**Check URL in "Send to Server" node:**
- ✅ Correct: `http://inbox-pilot:5173/api/inbound/email`
- ❌ Wrong: `http://localhost:5173/api/inbound/email`

**Verify both containers are running:**
```powershell
docker-compose ps
```

### Issue: Authentication Error (401)

**If you see HTTP 401:**
1. Set Authentication to **"None"** in "Send to Server" node
2. Your API doesn't require auth by default

### Issue: Empty Email Body

**If text is empty in database:**
- Some emails are HTML-only
- The workflow extracts text from HTML
- Check raw_text field in database

### Issue: Email Not Being Fetched

**Check IMAP credentials:**
```powershell
# View n8n logs
docker-compose logs -f n8n

# Look for IMAP connection errors
```

**Common fixes:**
- Use App Password (Gmail requires this)
- Enable IMAP in email settings
- Check firewall/antivirus isn't blocking

### Issue: Lead Created but No AI Classification

**Check environment variables:**
```powershell
# Check if HF token is set
docker-compose exec inbox-pilot printenv | grep HF
```

**If missing, update .env and restart:**
```powershell
# Edit .env file with real HF token
docker-compose down
docker-compose up -d
```

## 📈 Testing Different Scenarios

### Test Case 1: Sales Lead (High Urgency)
**Email:**
```
Subject: URGENT: Need Website ASAP
Body: We need a website built immediately. Budget is $10,000. 
Can you start this week?
```
**Expected:**
- Intent: sales
- Urgency: high/critical
- Sentiment: neutral/positive

### Test Case 2: Support Request
**Email:**
```
Subject: Issue with existing website
Body: The contact form on our website isn't working. 
Can you help fix it?
```
**Expected:**
- Intent: support
- Urgency: medium
- Sentiment: neutral

### Test Case 3: Spam
**Email:**
```
Subject: Congratulations! You won!
Body: Click here to claim your prize money now!!!
```
**Expected:**
- Intent: spam
- Urgency: low
- Sentiment: varies

### Test Case 4: Deduplication
**Action:**
1. Send the same email twice
2. Both should be processed by n8n
3. Only ONE lead should be created (dedup by external_id)

## ✅ Success Criteria

Your setup is working if:

- [x] n8n receives emails via IMAP
- [x] Workflow executions show as "Success"
- [x] API calls return `{"ok": true}`
- [x] Leads appear in Supabase `leads` table
- [x] Clients appear in Supabase `clients` table
- [x] AI classification is present (intent, urgency, sentiment)
- [x] Dashboard displays the leads correctly
- [x] Duplicate emails don't create duplicate leads

## 🎯 Next Steps After Testing

Once testing is successful:

1. **Configure Production Email**
   - Use your actual business email
   - Update IMAP credentials

2. **Adjust Poll Frequency**
   - Default: Every 1 minute
   - Adjust in "Email Trigger" node settings

3. **Add Email Filters** (Optional)
   - Only process emails from specific domains
   - Filter by subject line
   - Add conditions in workflow

4. **Set Up Notifications** (Optional)
   - Add Slack/Teams notification for high-urgency leads
   - Send auto-reply emails
   - Create alerts for certain intents

5. **Monitor Performance**
   - Check n8n execution history regularly
   - Review failed executions
   - Monitor API response times

## 📞 Quick Commands Reference

```powershell
# View all logs
docker-compose logs -f

# View n8n logs only
docker-compose logs -f n8n

# View Inbox Pilot logs only
docker-compose logs -f inbox-pilot

# Restart n8n
docker-compose restart n8n

# Restart Inbox Pilot
docker-compose restart inbox-pilot

# Stop everything
docker-compose down

# Start everything
docker-compose up -d

# Check status
docker-compose ps
```

## 🎉 You're Ready!

Follow these steps in order, and you'll have a fully working email-to-lead automation system. Good luck! 🚀


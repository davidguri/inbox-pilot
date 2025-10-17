# Quick Start Checklist

Use this checklist to get your Inbox Pilot + n8n Docker setup running.

## Pre-Flight Checklist

- [ ] Docker Desktop installed and running
- [ ] Supabase project created
- [ ] Supabase credentials available (URL and anon key)
- [ ] Email account for n8n (with IMAP access)
- [ ] Gmail: App Password generated (if using Gmail)

## Setup Steps

### Step 1: Environment Configuration
- [ ] Copy `env.example` to `.env`
  ```powershell
  Copy-Item env.example .env
  ```
- [ ] Edit `.env` file
- [ ] Add `PUBLIC_SUPABASE_URL`
- [ ] Add `PUBLIC_SUPABASE_KEY`
- [ ] Save `.env` file

### Step 2: Start Docker Services
- [ ] Open PowerShell in project directory
- [ ] Run start script:
  ```powershell
  .\start-docker.ps1
  ```
  OR manually:
  ```powershell
  docker-compose up -d
  ```
- [ ] Wait for containers to start (~30 seconds)
- [ ] Verify with: `docker-compose ps`
- [ ] Both services should show "Up" status

### Step 3: Access Services
- [ ] Open Inbox Pilot: http://localhost:3000
- [ ] Verify app loads without errors
- [ ] Open n8n: http://localhost:5678
- [ ] Verify n8n interface loads

### Step 4: Import n8n Workflow
- [ ] In n8n, click "Workflows" (left sidebar)
- [ ] Click "+ Add workflow"
- [ ] Click three dots (⋮) → "Import from File"
- [ ] Select `n8n-email-workflow.json`
- [ ] Workflow imports successfully

### Step 5: Configure Email in n8n
- [ ] Click "Email Trigger (IMAP)" node
- [ ] Click "Create New Credential"
- [ ] Enter email settings:
  - [ ] User: `your-email@domain.com`
  - [ ] Password: `your-app-password`
  - [ ] Host: `imap.gmail.com` (or your provider)
  - [ ] Port: `993`
  - [ ] SSL/TLS: ✓ (enabled)
- [ ] Click "Save"
- [ ] Credential saves without errors

### Step 6: Verify Workflow Configuration
- [ ] Click "Send to Server" or "HTTP Request" node
- [ ] Verify URL contains: `{{ $env.SERVER_URL }}/api/inbound/email`
  OR: `http://inbox-pilot:3000/api/inbound/email`
- [ ] **Important**: URL should NOT use `localhost:3000`

### Step 7: Activate Workflow
- [ ] Click "Save" button (top right)
- [ ] Toggle "Active" switch to ON
- [ ] Workflow shows as "Active"

## Testing Checklist

### Test 1: Direct API Test
- [ ] Open PowerShell
- [ ] Run test command:
  ```powershell
  $body = @{
      source = "email"
      text = "I need a website. Budget is $5000."
      subject = "Test Inquiry"
      external_id = "test-001"
      contact = @{
          email = "test@example.com"
          name = "Test User"
      }
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "http://localhost:3000/api/inbound/email" -Method POST -Body $body -ContentType "application/json"
  ```
- [ ] Response shows `ok: true`
- [ ] Response includes `leadId` and `clientId`
- [ ] Response includes AI classification

### Test 2: Verify in Supabase
- [ ] Open Supabase dashboard
- [ ] Go to Table Editor → `leads` table
- [ ] New lead appears with:
  - [ ] `raw_text`: Your test message
  - [ ] `subject`: "Test Inquiry"
  - [ ] `intent`: AI-classified intent (sales/support/spam)
  - [ ] `urgency`: Urgency level
  - [ ] `sentiment`: Sentiment analysis result
- [ ] Go to `clients` table
- [ ] Client "test@example.com" exists

### Test 3: Email Workflow Test
- [ ] Send test email to monitored inbox
- [ ] Subject: "Website Project Inquiry"
- [ ] Body: "Hi, I'm looking for a web developer. Can you help?"
- [ ] Wait 1-2 minutes (for n8n poll cycle)
- [ ] In n8n, click "Executions"
- [ ] New execution appears with "Success" status
- [ ] All nodes show green checkmarks
- [ ] Check Supabase for new lead
- [ ] Lead contains email content
- [ ] AI classification is present

### Test 4: Dashboard Display
- [ ] Open Inbox Pilot: http://localhost:3000
- [ ] Navigate to Dashboard or Leads page
- [ ] Test leads are visible
- [ ] Intent badges display correctly
- [ ] Urgency indicators show
- [ ] Client information displays

## Troubleshooting Quick Checks

### Services Won't Start
- [ ] Docker Desktop is running
- [ ] No port conflicts (3000, 5678 available)
- [ ] Check logs: `docker-compose logs -f`

### n8n Can't Reach API
- [ ] URL uses `inbox-pilot:3000` (not `localhost`)
- [ ] Both containers on same network
- [ ] Test from container: 
  ```bash
  docker-compose exec n8n wget -O- http://inbox-pilot:3000/
  ```

### Email Not Triggering
- [ ] Workflow is "Active" in n8n
- [ ] IMAP credentials correct
- [ ] Email in INBOX folder
- [ ] Poll time elapsed (default 1 minute)
- [ ] Check n8n logs: `docker-compose logs n8n`

### Supabase Errors
- [ ] `.env` file exists with correct values
- [ ] Environment variables loaded in container:
  ```bash
  docker-compose exec inbox-pilot printenv | grep SUPABASE
  ```
- [ ] Supabase credentials are correct
- [ ] Network can reach Supabase (external)

## Success Indicators

You're ready to use the system when:

- ✅ `docker-compose ps` shows both services "Up (healthy)"
- ✅ Inbox Pilot loads at http://localhost:3000
- ✅ n8n loads at http://localhost:5678
- ✅ Direct API test creates lead in Supabase
- ✅ Email test creates lead in Supabase
- ✅ AI classification works (intent, urgency, sentiment)
- ✅ Dashboard displays leads correctly
- ✅ No errors in `docker-compose logs`

## Common Commands Reference

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart after code changes
docker-compose up -d --build inbox-pilot

# Reset everything (⚠️ deletes n8n data)
docker-compose down -v
docker-compose up -d
```

## Next Steps After Setup

- [ ] Configure production email account
- [ ] Adjust n8n poll frequency if needed
- [ ] Enable n8n basic authentication (recommended)
- [ ] Test different email types (sales, support, spam)
- [ ] Monitor system for a few days
- [ ] Set up backup routine for n8n workflows
- [ ] Review production deployment considerations

## Need Help?

- **Detailed Setup**: See [DOCKER-SETUP.md](DOCKER-SETUP.md)
- **Testing Guide**: See [TESTING-GUIDE.md](TESTING-GUIDE.md)
- **Quick Reference**: See [DOCKER-QUICK-REFERENCE.md](DOCKER-QUICK-REFERENCE.md)
- **Implementation Details**: See [DOCKER-IMPLEMENTATION-SUMMARY.md](DOCKER-IMPLEMENTATION-SUMMARY.md)
- **n8n Configuration**: See [n8n-workflow-setup.md](n8n-workflow-setup.md)

---

**Estimated Setup Time**: 15-30 minutes  
**Difficulty**: Beginner-Intermediate  
**Prerequisites**: Docker, Supabase account, Email account


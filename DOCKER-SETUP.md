# Docker Setup Guide for Inbox Pilot + n8n

This guide will help you run Inbox Pilot and n8n together using Docker, allowing n8n workflows to communicate with your application via environment variables.

## Prerequisites

- Docker and Docker Compose installed
- Your Supabase project credentials
- (Optional) Email account credentials for n8n IMAP integration

## Quick Start

### 1. Create Environment File

Copy the example environment file and fill in your values:

```bash
# On Windows PowerShell
Copy-Item env.example .env

# Or manually create .env file
```

Edit `.env` and add your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_KEY=your-anon-public-key
```

### 2. Build and Start Services

```bash
docker-compose up -d
```

This will start:
- **Inbox Pilot** on `http://localhost:3000`
- **n8n** on `http://localhost:5678`

### 3. Verify Services

Check that both services are running:

```bash
docker-compose ps
```

You should see both `inbox-pilot-app` and `inbox-pilot-n8n` with status "Up".

### 4. Access Applications

- **Inbox Pilot**: http://localhost:3000
- **n8n**: http://localhost:5678

## Service Communication

The services are connected via a Docker network called `inbox-pilot-network`. This allows n8n to communicate with your Inbox Pilot application.

### Important URLs

When configuring n8n workflows:

- **From n8n to Inbox Pilot**: Use `http://inbox-pilot:3000`
- **Example API endpoint**: `http://inbox-pilot:3000/api/inbound/email`

The `SERVER_URL` environment variable in n8n is pre-configured in `docker-compose.yml` to point to `http://inbox-pilot:3000`.

## Import n8n Workflow

1. Open n8n at http://localhost:5678
2. Click "Workflows" → "Import from File"
3. Select either:
   - `n8n-email-workflow.json` (IMAP-based polling)
   - `n8n-email-webhook-workflow.json` (Webhook-based)

### Configure the Workflow

1. **Email Trigger (IMAP)**: Set up your email credentials
   - For Gmail: Use an App Password
   - Host: `imap.gmail.com`, Port: `993`, SSL: `true`

2. **HTTP Request Node**: The URL should be:
   ```
   {{ $env.SERVER_URL }}/api/inbound/email
   ```
   
   This uses the `SERVER_URL` environment variable which points to your Inbox Pilot service.

3. **Test the workflow**: Send a test email and verify it appears in your Supabase database.

## Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f inbox-pilot
docker-compose logs -f n8n
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart inbox-pilot
docker-compose restart n8n
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Will delete n8n data)

```bash
docker-compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build inbox-pilot
```

## Environment Variables Reference

### Inbox Pilot

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `PUBLIC_SUPABASE_KEY` | Yes | Your Supabase anon/public key |
| `ORIGIN` | No | Set to `http://localhost:3000` for local |

### n8n

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_URL` | `http://inbox-pilot:3000` | Internal URL for Inbox Pilot |
| `N8N_BASIC_AUTH_ACTIVE` | `false` | Enable basic auth for n8n UI |
| `N8N_BASIC_AUTH_USER` | - | Username for n8n login |
| `N8N_BASIC_AUTH_PASSWORD` | - | Password for n8n login |
| `GENERIC_TIMEZONE` | `America/New_York` | Timezone for n8n |

## Securing n8n (Recommended for Production)

Add these to your `.env` file:

```env
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password
```

Then update `docker-compose.yml` to uncomment the basic auth lines:

```yaml
- N8N_BASIC_AUTH_ACTIVE=true
- N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-admin}
- N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
```

## Troubleshooting

### n8n Can't Connect to Inbox Pilot

**Problem**: n8n workflow fails with connection error

**Solution**: 
- Ensure both services are on the same network
- Use `http://inbox-pilot:3000` (not `http://localhost:3000`) in n8n workflows
- Check logs: `docker-compose logs inbox-pilot`

### Port Already in Use

**Problem**: Error: port 3000 or 5678 is already allocated

**Solution**: 
- Stop the service using that port
- Or change the port mapping in `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000"  # Use port 3001 instead
  ```

### Environment Variables Not Working

**Problem**: Application can't connect to Supabase

**Solution**: 
- Verify `.env` file exists in the project root
- Check that variables are set correctly (no quotes needed)
- Restart services: `docker-compose down && docker-compose up -d`

### n8n Workflows Not Persisting

**Problem**: Workflows disappear after restart

**Solution**: 
- Check that the `n8n-data` volume is created: `docker volume ls`
- Don't use `docker-compose down -v` unless you want to delete data

### Application Build Fails

**Problem**: Docker build fails during npm install or build

**Solution**: 
- Check Node version compatibility
- Clear Docker cache: `docker-compose build --no-cache inbox-pilot`
- Check `package.json` for any syntax errors

## Development Workflow

### Local Development (Outside Docker)

For faster development, you might want to run the app locally:

```bash
# Run Inbox Pilot locally
npm run dev

# Keep n8n in Docker
docker-compose up n8n
```

Then in n8n workflows, use `http://host.docker.internal:5173` to reach your local dev server.

### Update After Code Changes

```bash
# Rebuild the Inbox Pilot service
docker-compose up -d --build inbox-pilot

# Or rebuild everything
docker-compose up -d --build
```

## Data Persistence

### n8n Data

n8n data (workflows, credentials, executions) is stored in a Docker volume called `n8n-data`. This persists even when containers are stopped.

**Location**: Docker volume (managed by Docker)

**Backup**:
```bash
docker run --rm -v inbox-pilot_n8n-data:/data -v $(pwd):/backup alpine tar czf /backup/n8n-backup.tar.gz -C /data .
```

**Restore**:
```bash
docker run --rm -v inbox-pilot_n8n-data:/data -v $(pwd):/backup alpine tar xzf /backup/n8n-backup.tar.gz -C /data
```

### Inbox Pilot Data

Application data is stored in Supabase (external database), so no local persistence is needed.

## Production Considerations

When deploying to production:

1. **Use HTTPS**: Set up a reverse proxy (Nginx, Caddy, Traefik)
2. **Secure n8n**: Enable basic authentication or use OAuth
3. **Environment Variables**: Use secrets management (Docker secrets, Vault)
4. **Database**: Consider using PostgreSQL for n8n instead of SQLite
5. **Monitoring**: Add health checks and logging aggregation
6. **Backups**: Regularly backup n8n workflows and credentials
7. **Resource Limits**: Set CPU and memory limits in docker-compose.yml

## Next Steps

1. ✅ Start services with `docker-compose up -d`
2. ✅ Import n8n workflow from JSON file
3. ✅ Configure email credentials in n8n
4. ✅ Test with a sample email
5. ✅ Monitor executions in n8n dashboard
6. Configure auto-reply workflows based on classification
7. Set up notifications for high-urgency leads

## Support

For issues:
- **Docker setup**: Check this guide and Docker logs
- **n8n workflows**: See `n8n-workflow-setup.md`
- **Application errors**: Check Inbox Pilot logs
- **Supabase**: Verify database schema and credentials

## Useful Links

- [n8n Documentation](https://docs.n8n.io/)
- [SvelteKit Docker Deployment](https://kit.svelte.dev/docs/adapter-node)
- [Docker Compose Documentation](https://docs.docker.com/compose/)


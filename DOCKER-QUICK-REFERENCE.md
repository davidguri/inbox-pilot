# Docker Quick Reference

## Start/Stop Commands

```bash
# Start all services
docker-compose up -d

# Or use the PowerShell helper script
.\start-docker.ps1

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes n8n data)
docker-compose down -v

# Restart a specific service
docker-compose restart inbox-pilot
docker-compose restart n8n

# View logs (follow mode)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f inbox-pilot
docker-compose logs -f n8n
```

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Inbox Pilot | http://localhost:3000 | Main application |
| n8n | http://localhost:5678 | Workflow automation |

## Important URLs for n8n Workflows

When configuring HTTP Request nodes in n8n:

### ✅ Correct (Docker network)
```
{{ $env.SERVER_URL }}/api/inbound/email
```
or
```
http://inbox-pilot:3000/api/inbound/email
```

### ❌ Incorrect (won't work from n8n container)
```
http://localhost:3000/api/inbound/email
```

> **Why?** `localhost` inside the n8n container refers to the n8n container itself, not your host machine. Use the service name `inbox-pilot` or the environment variable `SERVER_URL`.

## Environment Variables

### For Inbox Pilot
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_KEY` - Your Supabase anon key

### For n8n
- `SERVER_URL` - Pre-configured to `http://inbox-pilot:3000`
- Use in workflows: `{{ $env.SERVER_URL }}`

## Rebuild After Code Changes

```bash
# Rebuild only the changed service
docker-compose up -d --build inbox-pilot

# Rebuild everything
docker-compose up -d --build

# Force rebuild (no cache)
docker-compose build --no-cache inbox-pilot
```

## Troubleshooting

### Check if services are running
```bash
docker-compose ps
```

### Check container health
```bash
docker-compose ps
# Look for "Up (healthy)" status
```

### View detailed logs with timestamps
```bash
docker-compose logs -f --timestamps inbox-pilot
```

### Check network connectivity between services
```bash
# Enter the n8n container
docker-compose exec n8n sh

# Try to reach Inbox Pilot
wget -O- http://inbox-pilot:3000/
```

### Reset everything (⚠️ DESTRUCTIVE)
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Development Modes

### Mode 1: Both in Docker (Recommended for testing with n8n)
```bash
docker-compose up -d
```
- Inbox Pilot: http://localhost:3000
- n8n: http://localhost:5678
- n8n → Inbox Pilot: Use `http://inbox-pilot:3000`

### Mode 2: Inbox Pilot local, n8n in Docker
```bash
# Terminal 1: Run Inbox Pilot locally
npm run dev

# Terminal 2: Run only n8n
docker-compose up n8n
```
- Inbox Pilot: http://localhost:5173
- n8n: http://localhost:5678
- n8n → Inbox Pilot: Use `http://host.docker.internal:5173`

Update n8n workflow to use:
```
http://host.docker.internal:5173/api/inbound/email
```

## Data Persistence

### n8n Data Location
Docker volume: `inbox-pilot_n8n-data`

### Backup n8n Data
```powershell
# Windows PowerShell
docker run --rm -v inbox-pilot_n8n-data:/data -v ${PWD}:/backup alpine tar czf /backup/n8n-backup.tar.gz -C /data .
```

### Restore n8n Data
```powershell
# Windows PowerShell
docker run --rm -v inbox-pilot_n8n-data:/data -v ${PWD}:/backup alpine tar xzf /backup/n8n-backup.tar.gz -C /data
```

### List all volumes
```bash
docker volume ls
```

### Remove unused volumes
```bash
docker volume prune
```

## Port Conflicts

If ports 3000 or 5678 are already in use, edit `docker-compose.yml`:

```yaml
services:
  inbox-pilot:
    ports:
      - "3001:3000"  # Change 3000 to 3001
  
  n8n:
    ports:
      - "5679:5678"  # Change 5678 to 5679
```

Then access:
- Inbox Pilot: http://localhost:3001
- n8n: http://localhost:5679

## Resource Management

### View resource usage
```bash
docker stats
```

### Set resource limits (add to docker-compose.yml)
```yaml
services:
  inbox-pilot:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Common Issues

### Issue: "Cannot connect to Docker daemon"
**Solution**: Start Docker Desktop

### Issue: "port is already allocated"
**Solution**: Change port in `docker-compose.yml` or stop the conflicting service

### Issue: n8n can't reach Inbox Pilot
**Solution**: Use `http://inbox-pilot:3000` in n8n workflows, not `localhost`

### Issue: Changes not reflecting
**Solution**: Rebuild the service
```bash
docker-compose up -d --build inbox-pilot
```

### Issue: Environment variables not loading
**Solution**: 
1. Check `.env` file exists
2. Restart services: `docker-compose down && docker-compose up -d`

## Cheat Sheet

```bash
# Quick start
docker-compose up -d

# Quick stop
docker-compose down

# View all logs
docker-compose logs -f

# Restart everything
docker-compose restart

# Rebuild app after code change
docker-compose up -d --build inbox-pilot

# Check status
docker-compose ps

# Clean everything (⚠️ DESTRUCTIVE)
docker-compose down -v
docker system prune -a --volumes
```


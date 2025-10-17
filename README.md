# Inbox Pilot

AI-powered email lead management system built with SvelteKit, Supabase, and n8n.

## Features

- 📧 Automated email ingestion via n8n workflows
- 🤖 AI-powered intent classification (sales/support/spam)
- 🎯 Urgency scoring and sentiment analysis
- 👥 Client and lead management
- 📊 Real-time dashboard with analytics
- 🔄 Integration with n8n for workflow automation

## Quick Start with Docker (Recommended)

The easiest way to run Inbox Pilot with n8n is using Docker:

```sh
# 1. Create environment file
Copy-Item env.example .env
# Edit .env and add your Supabase credentials

# 2. Start services
docker-compose up -d

# 3. Access applications
# Inbox Pilot: http://localhost:3000
# n8n: http://localhost:5678
```

📖 **See [DOCKER-SETUP.md](DOCKER-SETUP.md) for detailed Docker setup instructions.**

## Local Development (Without Docker)

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account

### Setup

1. **Install dependencies**:
   ```sh
   npm install
   ```

2. **Configure environment**:
   ```sh
   Copy-Item env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server**:
   ```sh
   npm run dev
   ```

4. **Open browser**:
   ```
   http://localhost:5173
   ```

## Building

To create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## n8n Integration

Inbox Pilot integrates with n8n for automated email processing:

1. Set up Inbox Pilot (via Docker or locally)
2. Import n8n workflow: `n8n-email-workflow.json`
3. Configure email credentials in n8n
4. n8n will automatically send emails to `/api/inbound/email`

📖 **See [n8n-workflow-setup.md](n8n-workflow-setup.md) for detailed n8n setup.**

## Project Structure

```
inbox-pilot/
├── src/
│   ├── routes/           # SvelteKit routes
│   │   ├── (auth)/       # Auth pages (login, signup)
│   │   ├── (dashboard)/  # Dashboard pages
│   │   └── api/          # API endpoints
│   ├── lib/
│   │   ├── components/   # Svelte components
│   │   ├── db/           # Database utilities
│   │   ├── api/          # AI/API integrations
│   │   └── supabase/     # Supabase client
├── docker-compose.yml    # Docker setup
├── Dockerfile            # App container
└── n8n-*.json           # n8n workflows
```

## Environment Variables

Required variables (add to `.env`):

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_KEY=your-anon-public-key
```

## Technology Stack

- **Frontend**: SvelteKit 2, Tailwind CSS 4
- **Backend**: SvelteKit API routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Hugging Face API
- **Automation**: n8n
- **Deployment**: Docker, Node.js

## Documentation

- [DOCKER-SETUP.md](DOCKER-SETUP.md) - Docker deployment guide
- [n8n-workflow-setup.md](n8n-workflow-setup.md) - n8n integration guide
- [n8n-workflow-comparison.md](n8n-workflow-comparison.md) - Workflow options
- [n8n-quickstart.md](n8n-quickstart.md) - Quick n8n guide

## License

Private project

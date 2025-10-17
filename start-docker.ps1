# PowerShell script to start Inbox Pilot with Docker
# Usage: .\start-docker.ps1

Write-Host "🚀 Starting Inbox Pilot + n8n with Docker..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "📝 Creating .env from template..." -ForegroundColor Yellow
    
    if (Test-Path env.example) {
        Copy-Item env.example .env
        Write-Host "✅ Created .env file" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Edit .env and add your Supabase credentials before proceeding!" -ForegroundColor Yellow
        Write-Host "   - PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
        Write-Host "   - PUBLIC_SUPABASE_KEY" -ForegroundColor Yellow
        Write-Host ""
        $response = Read-Host "Have you configured .env? (y/n)"
        if ($response -ne 'y') {
            Write-Host "❌ Please configure .env and run this script again." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ env.example not found! Cannot create .env" -ForegroundColor Red
        exit 1
    }
}

# Check if Docker is running
Write-Host "🔍 Checking Docker..." -ForegroundColor Cyan
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose --version > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "docker-compose not found"
    }
} catch {
    Write-Host "❌ docker-compose not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Access your applications:" -ForegroundColor Cyan
    Write-Host "   🌐 Inbox Pilot: http://localhost:5173" -ForegroundColor White
    Write-Host "   🔧 n8n:         http://localhost:5678" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 View logs:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🛑 Stop services:" -ForegroundColor Cyan
    Write-Host "   docker-compose down" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📖 For more info, see DOCKER-SETUP.md" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Failed to start services. Check the logs above for errors." -ForegroundColor Red
    Write-Host "   Try: docker-compose logs" -ForegroundColor Gray
}


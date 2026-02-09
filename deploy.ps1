# PipeLogic POS Deployment Script
$ErrorActionPreference = "Stop"

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PipeLogic POS Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Railway Login
Write-Host "[1/6] Logging into Railway..." -ForegroundColor Yellow
railway login
if ($LASTEXITCODE -ne 0) {
    Write-Host "Railway login failed. Please try again." -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Railway login successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Create Railway Project and Deploy Backend
Write-Host "[2/6] Creating Railway project for backend..." -ForegroundColor Yellow
Set-Location "C:\Users\HDUser\ainur-pos-clone\backend"

# Link to GitHub repo
railway link --environment production 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating new Railway project..." -ForegroundColor Yellow
    railway init
}

# Set environment variables
Write-Host "[3/6] Setting environment variables..." -ForegroundColor Yellow
railway variables set DATABASE_URL="postgresql://postgres:olegister14041992@autorack.proxy.rlwy.net:28902/railway"
railway variables set PORT="3001"
railway variables set NODE_ENV="production"

# Deploy backend
Write-Host "[4/6] Deploying backend to Railway..." -ForegroundColor Yellow
railway up --detach

# Get Railway domain
Write-Host "Generating Railway domain..." -ForegroundColor Yellow
railway domain
$railwayUrl = railway domain 2>&1 | Select-String -Pattern "https://" | ForEach-Object { $_.ToString().Trim() }
Write-Host "Backend URL: $railwayUrl" -ForegroundColor Green
Write-Host ""

# Step 3: Vercel Login
Write-Host "[5/6] Logging into Vercel..." -ForegroundColor Yellow
Set-Location "C:\Users\HDUser\ainur-pos-clone\frontend"
vercel login
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel login failed. Please try again." -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Vercel login successful!" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy Frontend to Vercel
Write-Host "[6/6] Deploying frontend to Vercel..." -ForegroundColor Yellow

# Create .env file with Railway URL
Write-Host "Please enter your Railway backend URL (e.g., https://xxx.up.railway.app):" -ForegroundColor Cyan
$backendUrl = Read-Host "Backend URL"

# Deploy to Vercel with environment variables
vercel --prod --yes -e VITE_API_URL=$backendUrl -e VITE_SOCKET_URL=$backendUrl

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now deployed!" -ForegroundColor Green
Write-Host "Backend: $backendUrl" -ForegroundColor Cyan
Write-Host "Frontend: Check Vercel dashboard for URL" -ForegroundColor Cyan
Write-Host ""
pause

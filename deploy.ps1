# SnapAdda Platform - Elite PowerShell Deployment Suite (Production v2)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SNAPADDA PLATFORM - ELITE DEPLOYMENT SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$PROD_API_URL = "https://api-efbbevhoca-uc.a.run.app/api"
$LOCAL_API_URL = "http://localhost:5000/api"

# Function to Swap API URL in .env
function Set-EnvApi($path, $url) {
    if (Test-Path $path) {
        $content = Get-Content $path
        $newContent = $content -replace 'VITE_API_URL=.*', "VITE_API_URL=`"$url`""
        $newContent | Set-Content $path
        Write-Host "[i] Updated $path to $url" -ForegroundColor Gray
    }
}

try {
    # 1. Prepare for Production Build
    Write-Host "[1/6] Injecting Production API URL..." -ForegroundColor Yellow
    Set-EnvApi "admin/.env" $PROD_API_URL
    Set-EnvApi "client/.env" $PROD_API_URL

    # 2. Build Client Portal
    Write-Host "`n[2/6] Building Client Portal..." -ForegroundColor Yellow
    Set-Location client
    if (-not (Test-Path "node_modules")) { npm install --legacy-peer-deps }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Client build failed" }
    Set-Location ..

    # 3. Build Admin Panel
    Write-Host "`n[3/6] Building Admin Panel..." -ForegroundColor Yellow
    Set-Location admin
    if (-not (Test-Path "node_modules")) { npm install --legacy-peer-deps }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Admin build failed" }
    Set-Location ..

    # 4. Prepare Server (Cloud Functions)
    Write-Host "`n[4/6] Preparing Server (Functions)..." -ForegroundColor Yellow
    Set-Location server
    if (-not (Test-Path "node_modules")) { npm install --legacy-peer-deps }
    Set-Location ..

    # 5. Map Firebase Hosting Targets
    Write-Host "`n[5/6] Mapping Hosting Targets..." -ForegroundColor Yellow
    firebase target:apply hosting client snapadda-7a6e6
    firebase target:apply hosting admin snapaddaadmin

    # 6. Deploy Everything (Hosting + Functions)
    Write-Host "`n[6/6] Deploying Hosting and Functions..." -ForegroundColor Yellow
    firebase deploy

    if ($LASTEXITCODE -ne 0) { throw "Firebase deploy failed" }

} finally {
    # Restore Local API URL for development
    Write-Host "`n[i] Restoring Localhost API for development..." -ForegroundColor Gray
    Set-EnvApi "admin/.env" $LOCAL_API_URL
    Set-EnvApi "client/.env" $LOCAL_API_URL
    Set-Location $PSScriptRoot
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "   ------------------------------------------------------" -ForegroundColor Green
Write-Host "   Live API:     $PROD_API_URL" -ForegroundColor Green
Write-Host "   Local API:    $LOCAL_API_URL (Restored)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
pause

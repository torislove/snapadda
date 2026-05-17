# SnapAdda Platform - Elite PowerShell Deployment Suite (Production v4 - Elite Sync)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SNAPADDA PLATFORM - ELITE DEPLOYMENT SUITE v4" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# ─── MASTER PRODUCTION CONFIGURATION ───
$PROD_API_URL = "https://snapadda-7a6e6.web.app/api"

$FIREBASE_PROD = @{
    "VITE_FIREBASE_API_KEY"             = "AIzaSyAQX18dK6_wumA5bKEhPnKeckOIfC-SOR0"
    "VITE_FIREBASE_AUTH_DOMAIN"         = "snapadda-7a6e6.firebaseapp.com"
    "VITE_FIREBASE_PROJECT_ID"          = "snapadda-7a6e6"
    "VITE_FIREBASE_STORAGE_BUCKET"      = "snapadda-7a6e6.firebasestorage.app"
    "VITE_FIREBASE_MESSAGING_SENDER_ID" = "227172321059"
    "VITE_FIREBASE_APP_ID"              = "1:227172321059:web:7fe7097f7937739c0f6e96"
    "VITE_FIREBASE_MEASUREMENT_ID"      = "G-EPKYKL1SPN"
    "VITE_RTDB_URL"                     = "https://snapadda-7a6e6-default-rtdb.firebaseio.com"
    "VITE_GOOGLE_CLIENT_ID"             = "227172321059-3ss62q0vtlsh0rh3u2vs2g0f1uf594mc.apps.googleusercontent.com"
    "VITE_TRUECALLER_PARTNER_KEY"       = "uPiI27daafaa7c92a4245af01f6d0a07f4e00"
    "VITE_TRUECALLER_PARTNER_NAME"      = "SnapAdda"
}

# Function to Robustly Set Env Var in .env files
function Set-EnvVar($path, $key, $value) {
    if (-not (Test-Path $path)) { New-Item -ItemType File $path -Force | Out-Null }
    
    $content = Get-Content $path
    $found = $false
    $newContent = @()

    foreach ($line in $content) {
        if ($line -match "^$($key)=") {
            $newContent += "$($key)=`"$($value)`""
            $found = $true
        }
        else {
            if ($line.Trim() -ne "") { $newContent += $line }
        }
    }

    if (-not $found) {
        $newContent += "$($key)=`"$($value)`""
    }

    $newContent | Set-Content $path -Encoding UTF8
}

# Function to Clear reserved keys (Firebase restriction)
function Clear-EnvReservedKey($path) {
    if (Test-Path $path) {
        $content = Get-Content $path
        $newContent = $content | Where-Object { $_ -notmatch "^PORT=" }
        $newContent | Set-Content $path -Encoding UTF8
    }
}

try {
    # 1. Prepare for Production Build
    Write-Host "[1/6] Injecting Production Multi-Env Config..." -ForegroundColor Yellow
    
    $DEPLOY_VERSION = Get-Date -Format "yyyyMMddHHmmss"
    Write-Host "   Setting Version: $DEPLOY_VERSION" -ForegroundColor Cyan

    foreach ($path in @("admin/.env", "client/.env", "server/.env")) {
        Write-Host "   Updating $path..." -ForegroundColor Gray
        # Robustly remove NODE_ENV if it exists to avoid Vite warnings
        if (Test-Path $path) {
            $c = Get-Content $path | Where-Object { $_ -notmatch "^NODE_ENV=" }
            $c | Set-Content $path -Encoding UTF8
        }
        
        # Performance & Consistency: Use relative paths for Hosting->Functions connectivity
        # Use relative paths for production to avoid CORS and multi-domain issues
        $env:VITE_API_URL = "/api"
        Write-Host ">>> Building portal with Relative API: $env:VITE_API_URL" -ForegroundColor Cyan
        Set-EnvVar $path "VITE_API_URL" $env:VITE_API_URL
        Set-EnvVar $path "VITE_APP_VERSION" $DEPLOY_VERSION
        
        foreach ($key in $FIREBASE_PROD.Keys) {
            Set-EnvVar $path $key $FIREBASE_PROD[$key]
        }
        
        # Explicitly ensure Server Secrets are set for the function environment
        if ($path -match "server") {
            Set-EnvVar $path "MONGODB_URI" "mongodb+srv://manojkadiyala8_db_user:Manoj587487@cluster0.fjxb0my.mongodb.net/snapadda?retryWrites=true&w=majority&appName=Cluster0"
            Set-EnvVar $path "CLOUDINARY_CLOUD_NAME" "dipgezyuy"
            Set-EnvVar $path "CLOUDINARY_API_KEY" "744493735563614"
            Set-EnvVar $path "CLOUDINARY_API_SECRET" "HScXz9fgi6f9NOKuXShhyadZ50U"
            Set-EnvVar $path "DB_FIREBASE_URL" $FIREBASE_PROD["VITE_RTDB_URL"]
            Set-EnvVar $path "TRUECALLER_PARTNER_KEY" "uPiI27daafaa7c92a4245af01f6d0a07f4e00"
            Set-EnvVar $path "TRUECALLER_PARTNER_NAME" "SnapAdda"
        }
        
    }

    # 2. Pre-flight Logic Validation
    Write-Host "`n[2/7] Running Institutional Logic Audit..." -ForegroundColor Yellow
    Set-Location client
    node verify-logic.js
    if ($LASTEXITCODE -ne 0) { throw "Mission-Critical Logic Audit FAILED. Aborting deployment for safety." }
    Set-Location ..

    # 3. Build Client Portal
    Write-Host "`n[3/7] Building Client Portal..." -ForegroundColor Yellow
    Set-Location client
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Client build failed" }
    Set-Location ..

    # 4. Build Admin Panel
    Write-Host "`n[4/7] Building Admin Panel..." -ForegroundColor Yellow
    Set-Location admin
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Admin build failed" }
    Set-Location ..

    # 5. Map Firebase Hosting Targets
    Write-Host "`n[5/7] Mapping Hosting Targets..." -ForegroundColor Yellow
    firebase target:apply hosting client snapadda-7a6e6
    firebase target:apply hosting admin snapaddaadmin

    # 6. Deploy Everything (Hosting + Functions)
    Write-Host "`n[6/7] Deploying Hosting and Functions..." -ForegroundColor Yellow
    firebase deploy --only "hosting:client,hosting:admin,functions"

    if ($LASTEXITCODE -ne 0) { throw "Firebase deploy failed" }
    
    # 7. Post-Deployment Verification
    Write-Host "`n[7/7] Running Infrastructure Heartbeat..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Invoke-WebRequest -Uri "$PROD_API_URL/health" -UseBasicParsing | Out-Null
    Write-Host "   ✅ API Gateway Reachable" -ForegroundColor Gray
}
catch {
    Write-Error "Deployment failed: $_"
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "   ------------------------------------------------------" -ForegroundColor Green
Write-Host "   Live API:     $PROD_API_URL" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
# pause

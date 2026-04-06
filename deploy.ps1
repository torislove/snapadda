# SnapAdda Platform - Elite PowerShell Deployment Suite (Production v2)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SNAPADDA PLATFORM - ELITE DEPLOYMENT SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$PROD_API_URL = "/api"
$LOCAL_API_URL = "http://localhost:5000/api"

# Production Firebase Config (Sourced from Admin)
$FIREBASE_PROD = @{
    "VITE_FIREBASE_API_KEY" = "AIzaSyAQX18dK6_wumA5bKEhPnKeckOIfC-SOR0"
    "VITE_FIREBASE_AUTH_DOMAIN" = "snapadda-7a6e6.firebaseapp.com"
    "VITE_FIREBASE_PROJECT_ID" = "snapadda-7a6e6"
    "VITE_FIREBASE_STORAGE_BUCKET" = "snapadda-7a6e6.firebasestorage.app"
    "VITE_FIREBASE_MESSAGING_SENDER_ID" = "227172321059"
    "VITE_FIREBASE_APP_ID" = "1:227172321059:web:7fe7097f7937739c0f6e96"
    "VITE_FIREBASE_MEASUREMENT_ID" = "G-EPKYKL1SPN"
}

# Function to Swap/Set Env Var in .env
function Set-EnvVar($path, $key, $value) {
    if (Test-Path $path) {
        $content = Get-Content $path
        if ($content -match "$key=") {
            $newContent = $content -replace "$key=.*", "$key=`"$value`""
        } else {
            $newContent = $content + "`n$key=`"$value`""
        }
        $newContent | Set-Content $path -Encoding UTF8
    }
}

try {
    # 1. Prepare for Production Build
    Write-Host "[1/6] Injecting Production Multi-Env Config..." -ForegroundColor Yellow
    
    foreach ($path in @("admin/.env", "client/.env", "server/.env")) {
        Set-EnvVar $path "VITE_API_URL" $PROD_API_URL
        foreach ($key in $FIREBASE_PROD.Keys) {
            Set-EnvVar $path $key $FIREBASE_PROD[$key]
        }
        
        # Explicitly ensure Server Secrets are set for the function environment
        if ($path -eq "server/.env") {
            Set-EnvVar $path "MONGODB_URI" "mongodb+srv://manojkadiyala8_db_user:Manoj587487@cluster0.fjxb0my.mongodb.net/snapadda?retryWrites=true&w=majority&appName=Cluster0"
            Set-EnvVar $path "CLOUDINARY_CLOUD_NAME" "dipgezyuy"
            Set-EnvVar $path "CLOUDINARY_API_KEY" "744493735563614"
            Set-EnvVar $path "CLOUDINARY_API_SECRET" "HScXz9fgi6f9NOKuXShhyadZ50U"
        }
        Write-Host "   -> Updated $path with API and Firebase Production keys" -ForegroundColor Gray
    }

    # 2. Build Client Portal
    Write-Host "`n[2/6] Building Client Portal..." -ForegroundColor Yellow
    Set-Location client
    if (-not (Test-Path "node_modules")) { 
        Write-Host "   Installing dependencies..." -ForegroundColor Gray
        npm install --legacy-peer-deps 
    }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Client build failed" }
    Set-Location ..

    # 3. Build Admin Panel
    Write-Host "`n[3/6] Building Admin Panel..." -ForegroundColor Yellow
    Set-Location admin
    if (-not (Test-Path "node_modules")) { 
        Write-Host "   Installing dependencies..." -ForegroundColor Gray
        npm install --legacy-peer-deps 
    }
    # Ensure any previous dist is cleared to prevent stale assets
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Admin build failed" }
    Set-Location ..

    # 4. Prepare Server (Cloud Functions)
    Write-Host "`n[4/6] Preparing Server (Functions)..." -ForegroundColor Yellow
    Set-Location server
    if (-not (Test-Path "node_modules")) { 
        Write-Host "   Installing dependencies..." -ForegroundColor Gray
        npm install --legacy-peer-deps 
    }
    Set-Location ..

    # 5. Map Firebase Hosting Targets
    Write-Host "`n[5/6] Mapping Hosting Targets..." -ForegroundColor Yellow
    firebase target:apply hosting client snapadda-7a6e6
    firebase target:apply hosting admin snapaddaadmin

    # 6. Deploy Everything (Hosting + Functions)
    Write-Host "`n[6/6] Deploying Hosting and Functions..." -ForegroundColor Yellow
    # Using --only to ensure we deploy hosting and the specific api function
    firebase deploy --only "hosting,functions"

    if ($LASTEXITCODE -ne 0) { throw "Firebase deploy failed" }

}
finally {
    # Restore Local API URL for development
    Write-Host "`n[i] Restoring Localhost API for development..." -ForegroundColor Gray
    Set-EnvVar "admin/.env" "VITE_API_URL" $LOCAL_API_URL
    Set-EnvVar "client/.env" "VITE_API_URL" $LOCAL_API_URL
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

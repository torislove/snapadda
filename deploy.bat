@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo   SNAPADDA PLATFORM - ELITE DEPLOYMENT SUITE
echo ==========================================================
echo.

:: 1. Check Dependencies (Client)
echo [1/5] Building Client Portal...
cd client
if not exist node_modules (
    echo [i] node_modules missing in client! Installing...
    call npm install --legacy-peer-deps
)
call npm run build
if %errorlevel% neq 0 (
    echo [!] ERROR: Client Portal build failed!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

:: 2. Check Dependencies (Admin)
echo.
echo [2/5] Building Admin Panel...
cd admin
if not exist node_modules (
    echo [i] node_modules missing in admin! Installing...
    call npm install --legacy-peer-deps
)
call npm run build
if %errorlevel% neq 0 (
    echo [!] ERROR: Admin Panel build failed!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

:: 3. Prepare Server (Cloud Functions)
echo.
echo [3/5] Preparing Server (Functions)...
cd server
if not exist node_modules (
    echo [i] node_modules missing in server! Installing...
    call npm install --legacy-peer-deps
)
:: No build step for server as it's ESM, but we ensure packages are locked
cd ..

:: 4. Map Firebase Hosting Targets
echo.
echo [4/5] Mapping Hosting Targets...
:: Re-applying ensures existing mappings are correct and won't fail deployment
call firebase target:apply hosting client snapadda-7a6e6
call firebase target:apply hosting admin snapaddaadmin

:: 5. Deploy Everything (Hosting + Functions)
echo.
echo [5/5] Deploying Hosting and Functions...
call firebase deploy

if %errorlevel% neq 0 (
    echo.
    echo [!] ERROR: Deployment failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================================
echo   DEPLOYMENT SUCCESSFUL!
echo   ------------------------------------------------------
echo   Client Portal: https://snapadda-7a6e6.web.app
echo   Admin Panel:   https://snapaddaadmin.web.app
echo   Backend:       Firebase Cloud Functions (Live)
echo ==========================================================
echo.
pause

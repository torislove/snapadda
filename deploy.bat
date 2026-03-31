@echo off
echo ===================================================
echo   SnapAdda Platform - One-Click Deployment
echo ===================================================
echo.

:: 1. Build Client
echo [1/3] Building Client Dashboard...
cd client
if not exist node_modules (
    echo.
    echo node_modules missing in client! Installing...
    call npm install --legacy-peer-deps
)
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Client build failed!
    pause
    exit /b %errorlevel%
)
cd ..

:: 2. Build Admin
echo.
echo [2/3] Building Admin Panel...
cd admin
if not exist node_modules (
    echo.
    echo node_modules missing in admin! Installing...
    call npm install --legacy-peer-deps
)
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Admin build failed!
    pause
    exit /b %errorlevel%
)
cd ..

:: 3. Apply Firebase Targets (Safe to repeat)
echo.
echo [3/4] Mapping Firebase Hosting Targets...
call firebase target:clear hosting client
call firebase target:clear hosting admin
call firebase target:apply hosting client snapadda-7a6e6
call firebase target:apply hosting admin snapaddaadmin

:: 4. Deploy to Firebase (Hosting & Functions)
echo.
echo [4/4] Deploying to Firebase...
call firebase deploy


if %errorlevel% neq 0 (
    echo.
    echo ERROR: Deployment failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   DEPLOYMENT SUCCESSFUL!
echo   Client: https://snapadda-7a6e6.web.app
echo   Admin:  https://snapaddaadmin.web.app
echo   Server: Firebase Cloud Functions
echo ===================================================
pause

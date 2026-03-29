@echo off
echo ===================================================
echo   SnapAdda Platform - One-Click Deployment
echo ===================================================
echo.

:: 1. Build Client
echo [1/4] Building Client Dashboard...
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
echo [2/4] Building Admin Panel...
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

:: 3. Server Dependencies
echo.
echo [3/5] Checking Server Dependencies...
cd server
if not exist node_modules (
    echo.
    echo node_modules missing in server! Installing...
    call npm install --legacy-peer-deps
)
cd ..

:: 4. Apply Firebase Targets (Safe to repeat)
echo.
echo [4/5] Mapping Firebase Hosting Targets...
call firebase target:clear hosting client
call firebase target:clear hosting admin
call firebase target:apply hosting client snapadda-7a6e6
call firebase target:apply hosting admin snapaddaadmin

:: 5. Deploy to Firebase
echo.
echo [5/5] Deploying Hosting & Functions...
call firebase deploy --only hosting,functions
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Firebase Deployment failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   DEPLOYMENT SUCCESSFUL!
echo   Client: https://snapadda-7a6e6.web.app
echo   Admin:  https://snapaddaadmin.web.app
echo   API:    https://snapadda-7a6e6.web.app/api
echo ===================================================
pause

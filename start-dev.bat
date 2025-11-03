@echo off
echo Starting SEO Crawler & AI Analysis Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js and npm are available.
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
    if errorlevel 1 (
        echo Error installing root dependencies
        pause
        exit /b 1
    )
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    if errorlevel 1 (
        echo Error installing frontend dependencies
        pause
        exit /b 1
    )
    cd ..
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    if errorlevel 1 (
        echo Error installing backend dependencies
        pause
        exit /b 1
    )
    cd ..
)

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo.
    echo Please edit the .env file with your configuration:
    echo - Set your Gemini API key
    echo - Configure database connection
    echo.
    echo Press any key after you've configured the .env file...
    pause
)

echo.
echo Starting development servers...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:3001
echo.

REM Start both frontend and backend
npm run dev

pause
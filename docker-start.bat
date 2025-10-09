@echo off
REM Docker startup script for AHP Decision Support System (Windows)

echo Starting AHP Decision Support System with Docker...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo    .env file created
)

REM Stop any existing containers
echo Stopping any existing containers...
docker-compose down 2>nul

REM Build and start services
echo.
echo Building Docker images (this may take a few minutes)...
docker-compose build

echo.
echo Starting services...
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo AHP Decision Support System is running!
echo.
echo Access the application:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:3001/api
echo    Health:    http://localhost:3001/api/health
echo.
echo View logs:
echo    docker-compose logs -f
echo.
echo Stop the application:
echo    docker-compose down
echo.

pause

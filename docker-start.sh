#!/bin/bash

# Docker startup script for AHP Decision Support System
set -e

echo "🚀 Starting AHP Decision Support System with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker daemon is not running."
    echo "   Please start Docker Desktop or the Docker service."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "   ✓ .env file created"
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo ""
echo "🔨 Building Docker images (this may take a few minutes)..."
docker-compose build

echo ""
echo "🚢 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for backend health check
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        echo "   ✓ Backend is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Waiting for backend... ($attempt/$max_attempts)"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "   ⚠️  Backend took longer than expected to start."
    echo "   Check logs with: docker-compose logs backend"
fi

echo ""
echo "✅ AHP Decision Support System is running!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001/api"
echo "   Health:    http://localhost:3001/api/health"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop the application:"
echo "   docker-compose down"
echo ""

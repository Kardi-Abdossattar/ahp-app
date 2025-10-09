# Docker Setup Guide

This guide explains how to run the AHP Decision Support System using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

### 1. Clone the repository (if not already done)

```bash
git clone https://github.com/Kardi-Abdossattar/ahp-app.git
cd ahp-app
```

### 2. Configure environment variables (optional)

The default configuration works out of the box. To customize:

```bash
cp .env.example .env
```

Edit `.env` to change database credentials, JWT secret, or ports.

### 3. Start all services

```bash
docker-compose up -d
```

This command will:
- Pull the PostgreSQL image
- Build the backend and frontend images
- Start all services in detached mode
- Run database migrations automatically

### 4. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### 5. View logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 6. Stop the application

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Development Setup

For development with hot-reload:

### 1. Create a docker-compose.dev.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ahp-postgres-dev
    environment:
      POSTGRES_DB: ahp_db
      POSTGRES_USER: ahp_user
      POSTGRES_PASSWORD: ahp_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    networks:
      - ahp-network-dev

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: ahp-backend-dev
    environment:
      DATABASE_URL: postgresql://ahp_user:ahp_password@postgres:5432/ahp_db
      JWT_SECRET: dev-secret-key
      NODE_ENV: development
      PORT: 3001
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
    networks:
      - ahp-network-dev

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: ahp-frontend-dev
    environment:
      VITE_API_URL: http://localhost:3001/api
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - ahp-network-dev

volumes:
  postgres_data_dev:

networks:
  ahp-network-dev:
    driver: bridge
```

### 2. Start development environment

```bash
docker-compose -f docker-compose.dev.yml up
```

## Database Management

### Initialize demo data

```bash
docker-compose exec backend node prisma/seed.js
```

### Run migrations manually

```bash
docker-compose exec backend npx prisma migrate deploy
```

### Access PostgreSQL

```bash
docker-compose exec postgres psql -U ahp_user -d ahp_db
```

### Reset database

```bash
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Port already in use

If ports 3000, 3001, or 5432 are already in use, edit `docker-compose.yml` to change the port mappings:

```yaml
ports:
  - "8080:80"  # Change frontend from 3000 to 8080
```

### Backend fails to start

Check if database is ready:

```bash
docker-compose logs postgres
docker-compose exec postgres pg_isready -U ahp_user
```

### Frontend can't connect to backend

Ensure the backend is healthy:

```bash
curl http://localhost:3001/api/health
```

Check CORS configuration in `backend/server.js`.

### Build errors

Clear Docker cache and rebuild:

```bash
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### View container status

```bash
docker-compose ps
```

## Production Considerations

### 1. Change default secrets

Edit `.env` and set strong passwords:

```bash
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
```

### 2. Enable HTTPS

Use a reverse proxy like Nginx or Traefik with Let's Encrypt certificates.

### 3. Configure backups

Set up automated PostgreSQL backups:

```bash
docker-compose exec postgres pg_dump -U ahp_user ahp_db > backup.sql
```

### 4. Resource limits

Add resource constraints in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 5. Health monitoring

Use Docker healthchecks or external monitoring tools to track service availability.

## Architecture

```
┌─────────────────┐
│   Frontend      │  (React + Nginx)
│   Port: 3000    │
└────────┬────────┘
         │
         │ HTTP API calls
         ▼
┌─────────────────┐
│   Backend       │  (Node.js + Express)
│   Port: 3001    │
└────────┬────────┘
         │
         │ Prisma ORM
         ▼
┌─────────────────┐
│   PostgreSQL    │  (Database)
│   Port: 5432    │
└─────────────────┘
```

## Useful Commands

```bash
# Rebuild specific service
docker-compose build backend

# Restart specific service
docker-compose restart frontend

# Execute command in container
docker-compose exec backend npm run db:seed

# View resource usage
docker stats

# Clean up everything
docker-compose down -v --remove-orphans
docker system prune -af --volumes
```

## Next Steps

1. Create your first project at http://localhost:3000
2. Define criteria and alternatives
3. Make pairwise comparisons
4. View results and sensitivity analysis
5. Export PDF reports

For more information, see the main [README.md](README.md).

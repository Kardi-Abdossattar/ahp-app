# Docker Quick Start

Get the AHP Decision Support System running in 3 steps!

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Steps

### 1. Clone the repository

```bash
git clone https://github.com/Kardi-Abdossattar/ahp-app.git
cd ahp-app
```

### 2. Start the application

**Windows:**
```bash
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**Or use Docker Compose directly:**
```bash
docker-compose up -d
```

### 3. Open your browser

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

That's it! 🎉

## What's Running?

- **PostgreSQL** database on port 5432
- **Backend API** (Node.js/Express) on port 3001
- **Frontend** (React) on port 3000

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose build
docker-compose up -d

# Clean up everything (including database)
docker-compose down -v
```

## Troubleshooting

**Port already in use?**
- Stop other services using ports 3000, 3001, or 5432
- Or edit `docker-compose.yml` to change port mappings

**Backend not starting?**
```bash
docker-compose logs backend
```

**Need to reset database?**
```bash
docker-compose down -v
docker-compose up -d
```

## Next Steps

1. Register a new account at http://localhost:3000
2. Create your first decision project
3. Add criteria and alternatives
4. Make pairwise comparisons
5. View results and analysis

For detailed documentation, see [DOCKER-SETUP.md](DOCKER-SETUP.md)

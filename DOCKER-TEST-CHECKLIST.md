# Docker Setup Test Checklist

Use this checklist to verify the Docker setup works correctly.

## ✅ Pre-flight Checks

- [ ] Docker Desktop installed
- [ ] Docker Desktop running
- [ ] Ports 3000, 3001, 5432 available

```bash
# Check Docker
docker --version
docker-compose --version
docker info

# Check ports (Windows)
netstat -ano | findstr "3000 3001 5432"

# Check ports (Linux/Mac)
lsof -i :3000,3001,5432
```

## ✅ Startup Tests

### 1. Start Services

```bash
cd ahp-app
docker-compose up -d
```

**Expected output:**
```
Creating network "ahp-app_ahp-network" with driver "bridge"
Creating volume "ahp-app_postgres_data" with local driver
Creating ahp-postgres ... done
Creating ahp-backend  ... done
Creating ahp-frontend ... done
```

- [ ] All 3 services created successfully
- [ ] No error messages

### 2. Check Service Status

```bash
docker-compose ps
```

**Expected output:**
```
     Name                   Command               State           Ports
--------------------------------------------------------------------------------
ahp-backend    sh -c npx prisma migrate ...   Up      0.0.0.0:3001->3001/tcp
ahp-frontend   /docker-entrypoint.sh ngin ...   Up      0.0.0.0:3000->80/tcp
ahp-postgres   docker-entrypoint.sh postgres    Up      0.0.0.0:5432->5432/tcp
```

- [ ] All services showing "Up"
- [ ] All ports mapped correctly

### 3. Check Service Logs

```bash
# Backend logs
docker-compose logs backend | tail -20
```

**Expected output:**
```
🚀 Server running on port 3001
📊 AHP API available at http://localhost:3001/api
```

- [ ] Backend started successfully
- [ ] No error messages

```bash
# Frontend logs
docker-compose logs frontend | tail -10
```

- [ ] Nginx started successfully

```bash
# Database logs
docker-compose logs postgres | tail -10
```

- [ ] PostgreSQL started
- [ ] Database initialized

## ✅ Health Check Tests

### 1. Backend Health

```bash
curl http://localhost:3001/api/health
```

**Expected output:**
```json
{"status":"OK","timestamp":"2025-10-09T..."}
```

- [ ] Returns 200 status
- [ ] Returns JSON with "OK"

### 2. Database Connection

```bash
docker-compose exec postgres pg_isready -U ahp_user -d ahp_db
```

**Expected output:**
```
ahp_db - accepting connections
```

- [ ] Database accepting connections

### 3. Prisma Migrations

```bash
docker-compose exec backend npx prisma migrate status
```

- [ ] Migrations applied successfully
- [ ] No pending migrations

## ✅ Frontend Tests

### 1. Homepage

Open: http://localhost:3000

- [ ] Page loads without errors
- [ ] No console errors (F12)
- [ ] Login/Register buttons visible
- [ ] Clean, responsive design

### 2. Static Assets

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/assets/index.js
```

- [ ] Returns 200 status
- [ ] Assets load correctly

### 3. API Connectivity

Open browser console (F12) on http://localhost:3000

Try to register a user:
- [ ] API calls reach backend
- [ ] No CORS errors

## ✅ Backend API Tests

### 1. Public Endpoint

```bash
curl http://localhost:3001/api/health
```

- [ ] Returns health status

### 2. Authentication

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

- [ ] Registration successful
- [ ] Login returns JWT token

### 3. Protected Endpoint

```bash
# Get projects (should fail without token)
curl -X GET http://localhost:3001/api/projects
```

- [ ] Returns 401 Unauthorized

## ✅ Database Tests

### 1. Connect to Database

```bash
docker-compose exec postgres psql -U ahp_user -d ahp_db
```

- [ ] Connection successful

### 2. Check Tables

```sql
\dt
```

- [ ] Tables exist: users, projects, criteria, alternatives, comparisons, results
- [ ] Exit with `\q`

### 3. Check Data

```sql
SELECT COUNT(*) FROM users;
\q
```

- [ ] Query executes without error

## ✅ Volume Persistence Test

### 1. Create Data

1. Register a user on http://localhost:3000
2. Create a project
- [ ] Data saved successfully

### 2. Restart Containers

```bash
docker-compose restart
```

- [ ] Services restart successfully

### 3. Verify Data

1. Login with same user
2. Check project still exists
- [ ] Data persisted

## ✅ Full Integration Test

### Complete User Journey

1. **Register**: http://localhost:3000
   - [ ] Can create account

2. **Login**
   - [ ] Can login successfully
   - [ ] Redirected to dashboard

3. **Create Project**
   - [ ] Can create new project
   - [ ] Project appears in list

4. **Add Criteria**
   - [ ] Can add 2-3 criteria
   - [ ] Criteria saved

5. **Add Alternatives**
   - [ ] Can add 2-3 alternatives
   - [ ] Alternatives saved

6. **Make Comparisons**
   - [ ] Comparison wizard loads
   - [ ] Can make pairwise comparisons
   - [ ] Comparisons saved

7. **View Results**
   - [ ] Results page loads
   - [ ] Charts displayed
   - [ ] Rankings shown
   - [ ] Consistency ratio calculated

## ✅ Performance Tests

```bash
# Check resource usage
docker stats --no-stream
```

- [ ] CPU usage reasonable (<50% idle)
- [ ] Memory usage reasonable (<500MB per container)

## ✅ Cleanup Tests

### 1. Stop Services

```bash
docker-compose down
```

- [ ] All containers stopped
- [ ] Network removed

### 2. Start Again

```bash
docker-compose up -d
```

- [ ] Services start successfully
- [ ] Data still present (volume persisted)

### 3. Full Cleanup

```bash
docker-compose down -v
```

- [ ] Containers removed
- [ ] Volumes removed

### 4. Fresh Start

```bash
docker-compose up -d
```

- [ ] Services start clean
- [ ] No old data present

## ✅ Troubleshooting Verification

### Test Error Handling

1. **Kill Backend**
   ```bash
   docker-compose stop backend
   ```
   - [ ] Frontend shows connection error

2. **Restart Backend**
   ```bash
   docker-compose start backend
   ```
   - [ ] Frontend recovers

3. **Check Logs**
   ```bash
   docker-compose logs -f backend
   ```
   - [ ] Can view real-time logs

## 📋 Summary

All tests passed? Your Docker setup is ready! 🎉

### What Works:

- ✅ Multi-container orchestration
- ✅ Database persistence
- ✅ API communication
- ✅ Frontend serving
- ✅ Health checks
- ✅ Auto migrations
- ✅ Data persistence
- ✅ Service recovery

### Final Verification

```bash
# One command test
docker-compose down -v
docker-compose up -d
sleep 30
curl http://localhost:3001/api/health
```

If you get `{"status":"OK",...}` - Everything works! ✨

## Need Help?

1. Check logs: `docker-compose logs -f`
2. See [DOCKER-SETUP.md](DOCKER-SETUP.md) troubleshooting section
3. Try full reset: `docker-compose down -v && docker-compose up -d --build`

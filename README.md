# AHP Decision Support System

A complete web application for making complex decisions using the Analytic Hierarchy Process (AHP) method. This production-ready system helps individuals and organizations structure decision problems, perform pairwise comparisons, and generate comprehensive analysis reports.

## Features

### Core Functionality
- **Project Management**: Create and manage multiple decision projects
- **Hierarchical Structure**: Build goal-criteria-alternatives hierarchies
- **Pairwise Comparisons**: Interactive comparison interface using Saaty's 1-9 scale
- **AHP Calculations**: Complete mathematical engine with eigenvector method
- **Results Dashboard**: Visual charts, rankings, and consistency analysis
- **PDF Reports**: Professional reports with charts and analysis
- **Sensitivity Analysis**: What-if scenarios for weight changes

### Technical Features
- **Authentication**: JWT-based user authentication
- **Real-time UI**: React with responsive design
- **RESTful API**: Clean backend architecture
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Interactive visualization with Recharts
- **PDF Generation**: Server-side PDF creation with Puppeteer

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT tokens
- **Charts**: Recharts
- **PDF Generation**: Puppeteer
- **Deployment**: Docker + Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Docker (optional)

### Local Development

1. **Clone and install dependencies**
```bash
git clone <repository>
cd ahp-decision-support
npm install
cd backend && npm install
```

2. **Set up the database**
```bash
# Create PostgreSQL database
createdb ahp_db

# Copy environment file
cp backend/.env.example backend/.env

# Update DATABASE_URL in backend/.env
# DATABASE_URL="postgresql://username:password@localhost:5432/ahp_db"

# Generate Prisma client and run migrations
cd backend
npx prisma migrate dev
npx prisma generate
```

3. **Seed the database (optional)**
```bash
cd backend
npm run db:seed
```

4. **Start development servers**
```bash
# Start both frontend and backend
npm run dev:full

# Or start separately:
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
cd backend && npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Demo credentials: demo@ahp.com / demo123

### Docker Deployment

1. **Start all services**
```bash
docker-compose up -d
```

2. **Run database migrations**
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

3. **Access the application**
- Application: http://localhost:5173
- API: http://localhost:3001/api

## Usage Guide

### 1. Create a Project
- Click "New Project" on the dashboard
- Define your decision goal (e.g., "Choose the best laptop")
- Add a description

### 2. Build the Hierarchy
- Add **Criteria**: Factors to evaluate (Performance, Price, Portability)
- Add **Alternatives**: Options to choose from (MacBook Pro, Dell XPS, etc.)
- Minimum: 2 criteria and 2 alternatives

### 3. Make Pairwise Comparisons
- Compare criteria importance using Saaty's 1-9 scale
- Compare alternatives for each criterion
- The system guides you through all required comparisons

### 4. Calculate and Review Results
- Run AHP calculations
- Review final rankings and scores
- Check consistency ratios (should be ≤ 0.1)
- Perform sensitivity analysis
- Download PDF report

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # Create new user
POST /api/auth/login       # User login
GET  /api/auth/me         # Get current user
POST /api/auth/logout     # User logout
```

### Project Endpoints
```
GET    /api/projects           # Get all user projects
GET    /api/projects/:id       # Get project details
POST   /api/projects           # Create new project
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
POST   /api/projects/:id/criteria      # Add criterion
POST   /api/projects/:id/alternatives  # Add alternative
```

### AHP Endpoints
```
POST /api/ahp/comparisons         # Save pairwise comparison
GET  /api/ahp/comparisons/:id     # Get project comparisons
POST /api/ahp/calculate/:id       # Run AHP calculations
GET  /api/ahp/results/:id         # Get latest results
POST /api/ahp/sensitivity/:id     # Perform sensitivity analysis
```

### Reports
```
GET /api/reports/pdf/:id    # Generate PDF report
```

## Project Structure

```
ahp-decision-support/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Projects)
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   └── App.tsx            # Main app component
├── backend/               # Backend Node.js app
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # AHP calculation engine
│   ├── prisma/           # Database schema and migrations
│   └── server.js         # Express server
├── docker-compose.yml    # Docker configuration
└── README.md            # Documentation
```

## AHP Methodology

This application implements the complete Analytic Hierarchy Process:

1. **Problem Decomposition**: Break down complex decisions into hierarchies
2. **Pairwise Comparisons**: Compare elements using consistent judgments
3. **Priority Derivation**: Calculate weights using eigenvector method
4. **Consistency Checking**: Verify logical consistency of judgments
5. **Synthesis**: Combine priorities to rank alternatives

### Saaty's Scale
- 1: Equal importance
- 3: Moderate importance  
- 5: Strong importance
- 7: Very strong importance
- 9: Extreme importance
- 2,4,6,8: Intermediate values

### Consistency Ratio
- CR ≤ 0.1: Acceptable consistency
- CR > 0.1: Inconsistent, review recommended

## Development

### Adding New Features
1. Backend: Add routes in `backend/routes/`
2. Database: Create Prisma migrations in `backend/prisma/migrations/`
3. Frontend: Add components in `src/components/`
4. API: Update `src/services/api.ts`

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests  
cd backend && npm test
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL="postgresql://user:pass@localhost:5432/ahp_db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=3001
```

**Frontend (.env)**
```
VITE_API_URL="http://localhost:3001/api"
```

## Production Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Update environment variables
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure monitoring

### Security Considerations
- Change JWT_SECRET in production
- Use environment-specific database credentials  
- Enable CORS only for production domains
- Set up rate limiting
- Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the AHP methodology resources

---

**Built with ❤️ for better decision making**
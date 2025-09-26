# AHP Decision Support System

A complete web application for making complex decisions using the Analytic Hierarchy Process (AHP) method. This production-ready system helps individuals and organizations structure decision problems, perform pairwise comparisons, and generate comprehensive analysis reports.

## 🌟 Live Demo

**Try the static demo (no backend required):**
- 🏠 **[Demo Homepage](https://yourusername.github.io/ahp-app/)** - Overview and methodology
- 💻 **[Laptop Selection Analysis](https://yourusername.github.io/ahp-app/laptops.html)** - Software development laptop comparison
- 🚗 **[Car Selection Analysis](https://yourusername.github.io/ahp-app/cars.html)** - Family SUV comparison

> **Note:** Replace `yourusername` and `ahp-app` with your actual GitHub username and repository name.

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

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT tokens
- **Charts**: Recharts
- **PDF Generation**: Puppeteer

## Quick Start

### Prerequisites
- Node.js 18+ 
{{ ... }}
5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Demo credentials: demo@ahp.com / demo123

## Deployment (non-Docker)

For local development, run frontend and backend directly:
```bash
# Terminal 1 (frontend)
npm run dev
# Terminal 2 (backend)
cd backend && npm run dev
```
For production, build the frontend and serve via a static file server or reverse proxy (e.g., Nginx), and run the backend with a process manager (e.g., PM2). Ensure environment variables are set and the database is reachable.

## Usage Guide

### 1. Create a Project
- Click "New Project" on the dashboard
{{ ... }}
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # AHP calculation engine
│   ├── prisma/           # Database schema and migrations
│   └── server.js         # Express server
211→└── README.md            # Documentation
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

### Structured Errors and Logging
- Every request includes a `requestId` for traceability.
- Error responses follow a structured shape:
  ```json
  {
    "ok": false,
    "message": "Human-readable message",
    "code": "INTERNAL_ERROR | NOT_FOUND | ...",
    "requestId": "uuid",
    "stack": "<only in development>"
  }
  ```
- Logs include the request ID and timing via `morgan`.

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

## 🚀 Static Demo for GitHub Pages

This project includes a complete static demo that can be published on GitHub Pages without requiring any backend infrastructure.

### Building the Static Demo

1. **Generate demo data** (run once):
   ```bash
   # Start your backend
   cd backend && npm start
   
   # In another terminal, initialize demo data
   curl http://localhost:3001/api/public/init
   ```

2. **Test locally**:
   ```bash
   npm run serve-demo
   # Visit http://localhost:8080
   ```

3. **Build static files**:
   ```bash
   npm run build-demo
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   # Commit the gh-pages folder
   git add gh-pages/
   git commit -m "Add static demo for GitHub Pages"
   git push origin main
   
   # Create and push gh-pages branch
   git subtree push --prefix gh-pages origin gh-pages
   ```

4. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch and `/ (root)` folder
   - Save settings

### Demo Features
- ✅ **No Backend Required**: Pure static HTML/CSS/JS
- 📊 **Interactive Charts**: Using Chart.js from CDN
- 📱 **Responsive Design**: Works on all devices
- 🎯 **Real AHP Results**: Pre-computed with logical comparisons
- 🚀 **Fast Loading**: Optimized for GitHub Pages

### Demo Content
- **Laptop Selection**: Performance vs Price vs Portability analysis
- **Car Selection**: Safety vs Fuel Efficiency vs Comfort vs Price analysis
- **Visual Charts**: Bar charts for criteria weights, pie charts for final scores
- **Detailed Tables**: Rankings, weights, and consistency analysis

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
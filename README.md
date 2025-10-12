# AHP Decision Support System

A comprehensive web application for multi-criteria decision-making using the **Analytic Hierarchy Process (AHP)** method. This full-stack solution provides a complete decision support system with user authentication, project management, and advanced sensitivity analysis.

## Table of Contents

- [What is AHP?](#what-is-ahp)
- [How the AHP Method Works](#how-the-ahp-method-works)
- [Sensitivity Analysis](#sensitivity-analysis)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)

---

## What is AHP?

The **Analytic Hierarchy Process (AHP)** is a structured decision-making methodology developed by Thomas L. Saaty in the 1970s. It helps decision-makers organize and analyze complex decisions by breaking them down into a hierarchy of criteria and alternatives.

### Key Benefits:
- **Structured Approach**: Organizes complex decisions into manageable components
- **Quantitative Analysis**: Converts subjective judgments into numerical priorities
- **Consistency Checking**: Validates the logical consistency of your comparisons
- **Transparent Results**: Provides clear, defensible decision rationale

---

## How the AHP Method Works

### 1. **Problem Decomposition**

The decision problem is structured as a hierarchy:
```
Goal (Top Level)
  ├── Criterion 1
  ├── Criterion 2
  └── Criterion 3
        ├── Alternative 1
        ├── Alternative 2
        └── Alternative 3
```

**Example**: Choosing a laptop
- **Goal**: Select the best laptop
- **Criteria**: Performance, Price, Portability
- **Alternatives**: MacBook Pro, Dell XPS, ThinkPad X1

### 2. **Pairwise Comparisons**

Decision-makers compare elements pairwise using **Saaty's 1-9 scale**:

| Value | Meaning | Description |
|-------|---------|-------------|
| 1 | Equal importance | Both elements contribute equally |
| 3 | Moderate importance | One element is slightly more important |
| 5 | Strong importance | One element is significantly more important |
| 7 | Very strong importance | One element is very strongly favored |
| 9 | Extreme importance | One element is extremely more important |
| 2, 4, 6, 8 | Intermediate values | Used for compromise between adjacent scales |

**Example Comparison**:
- Question: "How important is Performance compared to Price?"
- Answer: "Performance is moderately more important" → **Value = 3**

This creates a **pairwise comparison matrix**:
```
           Performance  Price  Portability
Performance     1        3         5
Price          1/3       1         2
Portability    1/5      1/2        1
```

### 3. **Priority Calculation (Eigenvector Method)**

The application calculates weights using the **geometric mean method**:

1. **Calculate geometric mean of each row**:
   - For each row *i*, compute: `GM[i] = (∏ matrix[i][j])^(1/n)`
   - Where n is the number of criteria

2. **Normalize to get weights**:
   - `weight[i] = GM[i] / Σ(GM)`

**Example Result**:
- Performance: 0.637 (63.7%)
- Price: 0.258 (25.8%)
- Portability: 0.105 (10.5%)

### 4. **Consistency Analysis**

AHP includes a **consistency check** to ensure logical comparisons:

**Consistency Ratio (CR)** formula:
```
CR = CI / RI

Where:
- CI = (λmax - n) / (n - 1)
- λmax = principal eigenvalue of the matrix
- RI = Random Index (from Saaty's table)
- n = matrix size
```

**Interpretation**:
- **CR ≤ 0.10 (10%)**: Acceptable consistency ✅
- **CR > 0.10 (10%)**: Inconsistent judgments, review needed ⚠️

**Random Index (RI) Table**:
| n | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|-----|
| RI | 0.58 | 0.90 | 1.12 | 1.24 | 1.32 | 1.41 | 1.45 | 1.49 |

### 5. **Final Score Calculation**

The final score for each alternative is computed as:

```
Final_Score[alternative] = Σ (Criterion_Weight[i] × Alternative_Score[i][alternative])
```

**Example**:
```
MacBook Pro Score = (0.637 × 0.45) + (0.258 × 0.15) + (0.105 × 0.20)
                  = 0.287 + 0.039 + 0.021
                  = 0.347 (34.7%)
```

The alternative with the **highest final score** is the recommended choice.

---

## Sensitivity Analysis

**Sensitivity Analysis** helps you understand how robust your decision is by testing what happens when criteria weights change.

### How It Works

1. **Select a criterion** to modify (e.g., "Price")
2. **Set a new weight** (e.g., increase from 25% to 40%)
3. **Automatic redistribution**: Other criteria weights are adjusted proportionally
4. **Recalculate**: Final scores are recomputed with new weights
5. **Compare results**: See how rankings and scores change

### Mathematical Process

When you change one criterion weight, the system:

1. **Calculates the difference**: `Δweight = new_weight - original_weight`
2. **Redistributes proportionally** among other criteria:
   ```
   For each other criterion i:
   new_weight[i] = original_weight[i] × (1 - new_weight_target) / (1 - original_weight_changed)
   ```
3. **Ensures normalization**: All weights sum to 1.0 (100%)
4. **Recalculates final scores** using the adjusted weights

### Use Cases

- **Robustness Testing**: Check if top choice remains stable when priorities shift
- **What-if Analysis**: Explore scenarios (e.g., "What if budget becomes more important?")
- **Decision Confidence**: Understand sensitivity to weight changes
- **Stakeholder Alignment**: Test different stakeholder preferences

### Example

**Original Weights**:
- Performance: 60%
- Price: 25%
- Portability: 15%

**Sensitivity Test**: Increase Price to 40%

**New Weights** (automatically adjusted):
- Performance: 47.4% (60% × 0.75/0.79)
- Price: 40%
- Portability: 12.6% (15% × 0.75/0.79)

**Result**: If increasing price importance changes the #1 ranked alternative, the decision is **price-sensitive**.

---

## Features

### Core Functionality
- ✅ **User Authentication**: Secure login and registration with JWT
- ✅ **Project Management**: Create, save, and manage multiple decision projects
- ✅ **Hierarchical Structure**: Support for multi-level criteria hierarchies
- ✅ **Pairwise Comparisons**: Intuitive interface using Saaty's 1-9 scale
- ✅ **Automatic Calculations**: Real-time weight and score computation
- ✅ **Consistency Checking**: Built-in validation with CR indicators
- ✅ **Sensitivity Analysis**: Interactive what-if analysis tools
- ✅ **Visual Reports**: Charts, tables, and downloadable PDF reports
- ✅ **Data Persistence**: PostgreSQL database with Prisma ORM

### Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based security
- **Deployment**: Docker & Docker Compose ready

---

## Quick Start

### 🐳 Docker Setup (Recommended)

**Prerequisites**: Docker and Docker Compose installed

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ahp-app.git
   cd ahp-app
   ```

2. **Start with Docker**
   ```bash
   # Linux/Mac
   chmod +x docker-start.sh
   ./docker-start.sh

   # Windows
   docker-start.bat

   # Or manually
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health check: http://localhost:3001/api/health

### 💻 Manual Setup

**Prerequisites**: Node.js 18+, npm, PostgreSQL

1. **Clone and setup backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   npm install
   npx prisma migrate deploy
   npx prisma db seed  # Optional: Create demo user
   npm start
   ```

2. **Setup frontend** (new terminal)
   ```bash
   cd ahp-app
   npm install
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001/api

---

## Project Structure

```
ahp-app/
├── backend/                 # Backend API server
│   ├── routes/             # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── projects.js     # Project CRUD operations
│   │   ├── ahp.js          # AHP calculations & sensitivity analysis
│   │   └── reports.js      # PDF report generation
│   ├── utils/
│   │   └── ahpEngine.js    # Core AHP algorithm implementation
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── prisma/             # Database schema and migrations
│   └── server.js           # Express server setup
│
├── src/                    # Frontend React application
│   ├── components/
│   │   ├── Comparison/     # Pairwise comparison UI
│   │   ├── Results/        # Results visualization
│   │   │   ├── ResultsChart.tsx
│   │   │   ├── ConsistencyIndicator.tsx
│   │   │   └── SensitivityAnalysis.tsx
│   │   └── UI/             # Reusable UI components
│   ├── pages/
│   │   ├── Auth/           # Login & Registration
│   │   ├── Dashboard/      # Project dashboard
│   │   ├── Comparison/     # Comparison wizard
│   │   └── Results/        # Results & analysis
│   ├── contexts/           # React contexts (Auth, Project)
│   └── services/
│       └── api.ts          # API client
│
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Frontend container
└── README.md              # This file
```

---

## Usage Guide

### 1. Create a New Project

1. Register/Login to your account
2. Click **"New Project"** on the dashboard
3. Enter:
   - **Title**: Project name (e.g., "Laptop Selection")
   - **Description**: Brief description
   - **Goal**: Decision objective

### 2. Define Criteria

1. Add criteria that matter for your decision
2. Examples:
   - Laptop: Performance, Price, Portability
   - Car: Safety, Fuel Economy, Comfort
   - Job: Salary, Location, Growth Opportunities

### 3. Define Alternatives

1. Add options you're choosing between
2. Examples:
   - Laptops: MacBook Pro, Dell XPS, ThinkPad
   - Cars: Toyota Camry, Honda Accord, Mazda 6

### 4. Perform Comparisons

1. **Criteria Comparisons**: Compare criteria against each other
   - "How much more important is Performance vs Price?"
   - Use the slider: 1 (equal) to 9 (extreme)

2. **Alternative Comparisons**: For each criterion, compare alternatives
   - Under "Performance": "How much better is MacBook vs Dell?"

### 5. Review Results

The system automatically calculates:
- **Criteria Weights**: Importance of each criterion
- **Alternative Scores**: Performance of each option per criterion
- **Final Rankings**: Overall scores and recommended choice
- **Consistency Ratios**: Validation of logical consistency

### 6. Sensitivity Analysis

1. Go to the **"Sensitivity Analysis"** section
2. Select a criterion to adjust
3. Enter a new weight percentage
4. Click **"Analyze"** to see:
   - How rankings change
   - Score differences
   - Decision robustness

### 7. Generate Report

1. Click **"Generate PDF Report"**
2. Download a comprehensive report with:
   - Project overview
   - Comparison matrices
   - Results charts
   - Consistency analysis

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### AHP Calculations
- `POST /api/ahp/calculate/:projectId` - Calculate AHP results
- `POST /api/ahp/sensitivity` - Perform sensitivity analysis

### Reports
- `GET /api/reports/:projectId` - Generate PDF report

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ahp_db"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support & Resources

### Documentation
- [AHP Method Overview](https://en.wikipedia.org/wiki/Analytic_hierarchy_process)
- [Saaty's Original Paper](https://www.sciencedirect.com/science/article/abs/pii/0377221787901329)

### Getting Help
- Create an issue on GitHub
- Check existing documentation
- Review example projects

---

## Acknowledgments

- **Thomas L. Saaty** - Creator of the AHP method
- Built with modern web technologies for educational and professional use

---

**Built for better decision-making** 🎯

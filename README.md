# AHP Decision Support System (Full Version)

A comprehensive web application for complex decision-making using the Analytic Hierarchy Process (AHP) method. This full-stack solution provides a complete decision support system with user authentication, project management, and advanced analysis features.

## Features

### Core Functionality
- **User Authentication**: Secure login and registration system
- **Project Management**: Create, save, and manage multiple decision projects
- **Hierarchical Structure**: Build complex decision hierarchies with multiple levels
- **Interactive Comparisons**: Intuitive interface for pairwise comparisons using Saaty's 1-9 scale
- **Comprehensive Analysis**: Automatic calculation of priorities and consistency ratios
- **Visual Reports**: Generate and export detailed PDF reports with charts
- **Sensitivity Analysis**: Test how changes in weights affect the final decision

### Technical Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based security
- **Data Visualization**: Recharts
- **PDF Generation**: Puppeteer

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kardi-Abdossattar/ahp-app.git
   cd ahp-app
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
- **No Backend Required**: Pure static HTML/CSS/JS
- **Interactive Charts**: Using Chart.js from CDN
- **Responsive Design**: Works on all devices
- **Real AHP Results**: Pre-computed with logical comparisons
- **Fast Loading**: Optimized for GitHub Pages

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

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Kardi-Abdossattar/ahp-app/blob/main/LICENSE) file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the AHP methodology resources

---

**Built with ❤️ for better decision making**
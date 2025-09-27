# AHP Decision Support System - Static Demo

This is the static demo version of the AHP Decision Support System, designed to be hosted on GitHub Pages. This version showcases the core functionality of the AHP methodology through pre-computed examples, requiring no backend server.

## 🚀 Live Demo

Explore the interactive demos:
- 🏠 [Demo Homepage](https://Kardi-Abdossattar.github.io/ahp-app/)
- 💻 [Laptop Selection Analysis](https://Kardi-Abdossattar.github.io/ahp-app/laptops.html) - Compare laptops for software development
- 🚗 [Car Selection Analysis](https://Kardi-Abdossattar.github.io/ahp-app/cars.html) - Compare family SUVs

> **Note:** The demo is hosted at your GitHub Pages URL.

## 📋 Features

- **No Backend Required**: Pure HTML, CSS, and JavaScript
- **Interactive Visualizations**: Dynamic charts and tables
- **Responsive Design**: Works on desktop and mobile devices
- **Pre-computed Examples**: Real AHP analysis results
- **Fast Loading**: Optimized for GitHub Pages

## 🛠️ How It Works

1. **Data Preparation**: AHP analysis is performed using the full application
2. **Export**: Results are exported to JSON format
3. **Visualization**: Static HTML pages load and display the JSON data using client-side JavaScript
4. **Deployment**: Hosted on GitHub Pages with zero server requirements

## 📂 File Structure

```
gh-pages/
├── index.html        # Landing page with demo overview
├── laptops.html      # Laptop selection analysis
├── cars.html         # Car selection analysis
├── style.css         # Styling for all pages
├── results.js        # JavaScript for rendering charts and tables
└── demo-data/        # Pre-computed AHP results in JSON format
    ├── laptops.json
    └── cars.json
```

## 🔍 Example Use Cases

### Laptop Selection
- **Criteria**: Performance, Price, Portability, Battery Life
- **Alternatives**: MacBook Pro, Dell XPS, Lenovo ThinkPad, HP Spectre
- **Analysis**: Find the best laptop for software development

### Car Selection
- **Criteria**: Safety, Fuel Efficiency, Comfort, Price
- **Alternatives**: Toyota RAV4, Honda CR-V, Mazda CX-5, Subaru Forester
- **Analysis**: Choose the best family SUV

## 🔄 Updating the Demo

To update the demo with new analyses:

1. Run the analysis in the full application
2. Export the results to JSON
3. Update the corresponding JSON file in `demo-data/`
4. Commit and push the changes

## 📚 Full Version

For the complete AHP Decision Support System with user accounts, project management, and interactive analysis, check out the [main branch](https://github.com/Kardi-Abdossattar/ahp-app/tree/main).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Kardi-Abdossattar/ahp-app/blob/main/LICENSE) file for details.

---

Built with ❤️ using the Analytic Hierarchy Process

#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Building AHP Demo for GitHub Pages...');

try {
  // Create gh-pages directory
  const ghPagesDir = join(rootDir, 'gh-pages');
  if (!existsSync(ghPagesDir)) {
    mkdirSync(ghPagesDir, { recursive: true });
  }

  // Copy static demo files
  console.log('📁 Copying static demo files...');
  const staticDemoDir = join(rootDir, 'static-demo');
  const demoDataDir = join(rootDir, 'demo-data');

  // Copy HTML files
  ['index.html', 'laptops.html', 'cars.html'].forEach(file => {
    const src = join(staticDemoDir, file);
    const dest = join(ghPagesDir, file);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`✅ Copied ${file}`);
    }
  });

  // Copy CSS and JS files
  ['style.css', 'results.js'].forEach(file => {
    const src = join(staticDemoDir, file);
    const dest = join(ghPagesDir, file);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`✅ Copied ${file}`);
    }
  });

  // Create demo-data directory in gh-pages
  const ghPagesDemoData = join(ghPagesDir, 'demo-data');
  if (!existsSync(ghPagesDemoData)) {
    mkdirSync(ghPagesDemoData, { recursive: true });
  }

  // Copy JSON data files
  ['laptops.json', 'cars.json'].forEach(file => {
    const src = join(demoDataDir, file);
    const dest = join(ghPagesDemoData, file);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`✅ Copied ${file}`);
    }
  });

  // Create a simple .nojekyll file to prevent Jekyll processing
  writeFileSync(join(ghPagesDir, '.nojekyll'), '');

  // Create a README for the gh-pages branch
  const readmeContent = `# AHP Decision Support Demo

This branch contains the static demo files for GitHub Pages.

## Live Demo
- 🏠 [Homepage](https://yourusername.github.io/ahp-app/)
- 💻 [Laptop Analysis](https://yourusername.github.io/ahp-app/laptops.html)
- 🚗 [Car Analysis](https://yourusername.github.io/ahp-app/cars.html)

## Files
- \`index.html\` - Homepage with demo overview
- \`laptops.html\` - Laptop selection analysis
- \`cars.html\` - Car selection analysis
- \`style.css\` - Styling for all pages
- \`results.js\` - JavaScript for rendering charts and tables
- \`demo-data/\` - JSON files with pre-computed AHP results

## How it works
1. AHP analysis was run once using the backend
2. Results were exported to JSON files
3. Static HTML pages load and display the JSON data
4. No backend required - pure client-side rendering

Built with ❤️ using the Analytic Hierarchy Process
`;

  writeFileSync(join(ghPagesDir, 'README.md'), readmeContent);

  console.log('\n🎉 Demo build complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Commit the gh-pages/ folder to your repository');
  console.log('2. Push to GitHub');
  console.log('3. Enable GitHub Pages from the gh-pages branch in repository settings');
  console.log('4. Update the README.md with your actual GitHub username/repo name');
  console.log('\n📁 Files created in gh-pages/:');
  console.log('   - index.html (homepage)');
  console.log('   - laptops.html (laptop analysis)');
  console.log('   - cars.html (car analysis)');
  console.log('   - style.css (styling)');
  console.log('   - results.js (chart rendering)');
  console.log('   - demo-data/laptops.json');
  console.log('   - demo-data/cars.json');
  console.log('   - .nojekyll (prevents Jekyll processing)');
  console.log('   - README.md (documentation)');

} catch (error) {
  console.error('❌ Error building demo:', error.message);
  process.exit(1);
}

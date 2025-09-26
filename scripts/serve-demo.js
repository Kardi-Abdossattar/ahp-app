#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const staticDir = join(rootDir, 'static-demo');
const demoDataDir = join(rootDir, 'demo-data');

const PORT = 8080;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>');
      return;
    }

    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      // Try to serve index.html from directory
      const indexPath = join(filePath, 'index.html');
      if (existsSync(indexPath)) {
        serveFile(res, indexPath);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Directory listing not allowed</h1>');
      }
      return;
    }

    const content = readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': content.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(content);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>500 - Internal Server Error</h1>');
  }
}

const server = createServer((req, res) => {
  let url = req.url;
  
  // Remove query string
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    url = url.substring(0, queryIndex);
  }

  // Decode URL
  url = decodeURIComponent(url);

  console.log(`${req.method} ${url}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Route handling
  if (url === '/' || url === '/index.html') {
    serveFile(res, join(staticDir, 'index.html'));
  } else if (url === '/laptops.html') {
    serveFile(res, join(staticDir, 'laptops.html'));
  } else if (url === '/cars.html') {
    serveFile(res, join(staticDir, 'cars.html'));
  } else if (url === '/style.css') {
    serveFile(res, join(staticDir, 'style.css'));
  } else if (url === '/results.js') {
    serveFile(res, join(staticDir, 'results.js'));
  } else if (url.startsWith('/demo-data/')) {
    // Serve JSON files from demo-data directory
    const fileName = url.replace('/demo-data/', '');
    const filePath = join(demoDataDir, fileName);
    serveFile(res, filePath);
  } else {
    // Try to serve from static-demo directory
    const filePath = join(staticDir, url);
    serveFile(res, filePath);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Demo server running at http://localhost:${PORT}`);
  console.log(`📊 Available pages:`);
  console.log(`   🏠 Homepage: http://localhost:${PORT}/`);
  console.log(`   💻 Laptops:  http://localhost:${PORT}/laptops.html`);
  console.log(`   🚗 Cars:     http://localhost:${PORT}/cars.html`);
  console.log(`\n📁 Serving files from:`);
  console.log(`   - static-demo/ (HTML, CSS, JS)`);
  console.log(`   - demo-data/ (JSON files)`);
  console.log(`\n💡 Press Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down demo server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down demo server (SIGTERM)...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

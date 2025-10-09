import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    react(),
    // Dev-only middleware: rewrite lucide 'fingerprint' icon requests to 'shield' to avoid blockers
    {
      name: 'rewrite-lucide-fingerprint',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && req.url.includes('lucide-react') && req.url.includes('fingerprint')) {
            req.url = req.url.replace(/fingerprint/g, 'shield');
          }
          next();
        });
      },
    },
  ],
  optimizeDeps: {
    include: ['lucide-react'],
  },
  resolve: {
    alias: {
      // Map problematic fingerprint icon to shield across common resolution paths
      'lucide-react/dist/esm/icons/fingerprint.js': 'lucide-react/dist/esm/icons/shield.js',
      'lucide-react/dist/esm/icons/fingerprint.mjs': 'lucide-react/dist/esm/icons/shield.js',
      'lucide-react/dist/esm/icons/fingerprint': 'lucide-react/dist/esm/icons/shield.js',
      'lucide-react/icons/fingerprint': 'lucide-react/icons/shield',
      'lucide-react/icons/fingerprint.js': 'lucide-react/icons/shield.js',
    },
  },
});

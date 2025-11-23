import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    // Base path logic:
    // - Dev server (npm run dev): always use root
    // - Production build: use root on Netlify, subpath otherwise
    base: command === 'serve' ? '/' : (process.env.NETLIFY ? '/' : '/demo-pwa-app/'),        

    // Root directory (where index.html is)
    root: '.',

    // Build configuration
    build: {
        // Output directory for production build
        outDir: 'dist',

        // Don't empty outDir before building (safer)
        emptyOutDir: true,

        // Generate source maps for debugging
        sourcemap: true,

        // Copy service worker and manifest to dist
        rollupOptions: {
        input: {
            main: './index.html'
        }
        }
    },

    // Development server configuration
    server: {
        port: 3000,
        open: true
    }
}));
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
    base: command === 'serve' ? '/' : (process.env.NETLIFY ? '/' : '/demo-pwa-app/'),
    root: '.',

    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/*.png', 'manifest.json'],

            manifest: {
                name: 'QuizMaster - AI-Powered Quiz App',
                short_name: 'QuizMaster',
                description: 'Test your knowledge on any topic with AI-generated questions',
                theme_color: '#4A90E2',
                background_color: '#F8F9FA',
                display: 'standalone',
                orientation: 'portrait-primary',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                categories: ['education', 'learning', 'quiz']
            },

            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],

                runtimeCaching: [
                    // API calls (Network First)
                    {
                        urlPattern: /^https:\/\/.*\.netlify\.app\/\.netlify\/functions\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 5 * 60 // 5 minutes
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // Tailwind CDN (Cache First)
                    {
                        urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'tailwind-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    // Images (Cache First)
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                            }
                        }
                    }
                ],

                cleanupOutdatedCaches: true,
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api/, /^\/\.netlify/]
            },

            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: './index.html'
            }
        }
    },

    server: {
        port: 3000,
        open: false
    }
}));
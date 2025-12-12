import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
    base: command === 'serve' ? '/' : '/app/',
    root: '.',

    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/*.png'],

            manifest: {
                name: 'Saberloop - Learn Anything, Practice Anything',
                short_name: 'Saberloop',
                description: 'The fun way to learn and track your progress with AI-powered quizzes',
                theme_color: '#FF6B35',
                background_color: '#1a1a2e',
                display: 'standalone',
                orientation: 'portrait-primary',
                scope: '/app/',
                start_url: '/app/',
                icons: [
                    {
                        src: '/app/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/app/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/app/icons/icon-192x192-maskable.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: '/app/icons/icon-512x512-maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
                screenshots: [
                    {
                        src: '/app/icons/screenshot-mobile-1.png',
                        sizes: '400x855',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Saberloop Welcome Screen'
                    },
                    {
                        src: '/app/icons/screenshot-mobile-2.png',
                        sizes: '400x855',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Saberloop Home Screen'
                    },
                    {
                        src: '/app/icons/screenshot-desktop-1.png',
                        sizes: '1280x720',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Saberloop on Desktop'
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
                navigateFallback: '/app/index.html',
                navigateFallbackDenylist: [/^\/api/, /^\/\.netlify/]
            },

            devOptions: {
                enabled: true,
                type: 'module',
                suppressWarnings: true
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
        port: 8888,
        open: false,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    }
}));
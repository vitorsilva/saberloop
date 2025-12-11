# Deployment Guide

## Overview

Saberloop uses GitHub Actions for CI testing and FTP deployment to a VPS (LAMP server).

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   GitHub    │────▶│   VPS       │
│    Push     │     │   Actions   │     │ (FTP Deploy)│
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │  Tests    │
                    │  - Unit   │
                    │  - E2E    │
                    │  - Build  │
                    └───────────┘
```

## Deployment Architecture

| Component | Platform | Purpose |
|-----------|----------|---------|
| CI Pipeline | GitHub Actions | Run tests, verify build |
| Frontend | VPS (Apache) | Static file hosting |
| AI Integration | OpenRouter (client-side) | User-provided API keys |
| DNS | Domain registrar | Point to VPS |

## Prerequisites

1. **GitHub Repository** - Code hosted on GitHub
2. **VPS with cPanel** - LAMP stack (Apache, PHP)
3. **FTP Access** - For automated deployment
4. **Domain** - saberloop.com configured to point to VPS

## Configuration Files

### `vite.config.js` (Build Configuration)

```javascript
export default defineConfig(({ command }) => ({
    // Base path for production deployment
    base: command === 'serve' ? '/' : '/app/',

    plugins: [
        VitePWA({
            manifest: {
                scope: '/app/',
                start_url: '/app/',
                // ... other PWA settings
            },
            workbox: {
                navigateFallback: '/app/index.html'
            }
        })
    ]
}));
```

### `scripts/deploy-ftp.cjs` (FTP Deployment)

```javascript
const frontendConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    localRoot: './dist',
    remoteRoot: '/app',  // Deploy to /app subdirectory
    include: ['*', '**/*']
};
```

### `.github/workflows/test.yml` (CI Pipeline)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --run
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - run: npm run build
```

## Environment Variables

### Local `.env` File

Create a `.env` file (not committed to git):

```bash
# FTP Deployment Credentials
FTP_HOST=ftp.saberloop.com
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password

# Development Options
VITE_USE_REAL_API=false  # Use mock API in development
```

### Production (No Server-Side Variables Needed)

Saberloop uses **client-side OpenRouter integration**. Users provide their own API keys, stored securely in their browser's IndexedDB. No server-side API keys required!

## Deployment Process

### Manual Deployment (Primary Method)

```bash
# Build and deploy in one command
npm run build:deploy

# Or separately:
npm run build    # Build to dist/
npm run deploy   # FTP upload to VPS
```

### CI Pipeline

Every push to `main` triggers GitHub Actions:
1. Run unit tests (Vitest)
2. Run E2E tests (Playwright)
3. Verify build succeeds

**Note:** Automated FTP deployment from CI is not yet configured. Deploy manually after tests pass.

## Deployment Checklist

### Before First Deploy

- [ ] Domain DNS pointing to VPS
- [ ] FTP credentials configured in `.env`
- [ ] SSL certificate installed on VPS (Let's Encrypt)
- [ ] `.htaccess` configured for SPA routing

### Before Each Deploy

- [ ] All tests pass locally (`npm test && npm run test:e2e`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables are set
- [ ] Service worker version updated if needed

### After Deploy

- [ ] Verify site loads at https://saberloop.com/app/
- [ ] Check PWA installability
- [ ] Verify offline functionality
- [ ] Test quiz flow with OpenRouter
- [ ] Check browser console for errors

## Rollback

### Via FTP

1. Keep backup of previous `dist/` folder before deploy
2. Re-upload previous version via FTP if needed

### Via Git

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Rebuild and redeploy
npm run build:deploy
```

## Domain Configuration

### DNS Setup (saberloop.com)

Configure DNS at your domain registrar:

```
A     @     YOUR_VPS_IP_ADDRESS
A     www   YOUR_VPS_IP_ADDRESS
```

### SSL Certificate

Use Let's Encrypt via cPanel:
1. Go to cPanel → SSL/TLS Status
2. Run AutoSSL for saberloop.com
3. Certificate auto-renews

### Apache .htaccess (SPA Routing)

Create `.htaccess` in the `/app/` directory:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA routing - serve index.html for all non-file requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

## Monitoring

### Error Tracking

Application uses structured logging (see `src/utils/logger.js`).
Errors logged to browser console, visible in DevTools.

### Apache Access Logs

Available via cPanel → Raw Access Logs

## Troubleshooting

### Build Fails

```bash
# Check build locally
npm run build

# Clear npm cache
npm cache clean --force
npm ci
```

### FTP Deploy Fails

1. Check FTP credentials in `.env`
2. Verify VPS disk space available
3. Check FTP port 21 not blocked

### PWA Not Updating

1. Service worker auto-updates on new deploy
2. Clear browser cache if needed
3. Unregister old service worker in DevTools

### SPA Routes Return 404

Ensure `.htaccess` is deployed and Apache `mod_rewrite` is enabled.

## Cost Considerations

### VPS Hosting

Using existing VPS - **zero additional cost**

### OpenRouter API

Users provide their own API keys - **zero API cost to you**

See [OpenRouter pricing](https://openrouter.ai/pricing) for user costs.

## Related Documentation

- [System Overview](./SYSTEM_OVERVIEW.md)
- [API Design](./API_DESIGN.md)
- [Installation Guide](../developer-guide/INSTALLATION.md)
- [Phase 3.4 Learning Notes](../learning/epic03_quizmaster_v2/PHASE3.4_LEARNING_NOTES.md) - VPS migration details

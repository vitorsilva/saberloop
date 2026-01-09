# Staging Deployment Guide

## Overview

The staging environment allows testing changes in a production-like setting before deploying to the main production URL.

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | https://saberloop.com/app/ | Live user-facing app |
| **Staging** | https://saberloop.com/app-staging/ | Testing before production |

## Quick Start

### Deploy to Staging

```bash
# Build and deploy in one command
npm run build:deploy:staging
```

### Deploy to Production

```bash
# Build and deploy in one command
npm run build:deploy
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build:staging` | Build with `/app-staging/` base path |
| `npm run deploy:staging` | Deploy `dist/` to staging |
| `npm run build:deploy:staging` | Build and deploy to staging |
| `npm run build` | Build with `/app/` base path (production) |
| `npm run deploy` | Deploy `dist/` to production |
| `npm run build:deploy` | Build and deploy to production |

## How It Works

### Environment Variable

The build target is controlled by the `DEPLOY_TARGET` environment variable:

```bash
# Staging build
DEPLOY_TARGET=staging npm run build

# Production build (default)
npm run build
```

The `cross-env` package ensures this works on Windows, Mac, and Linux.

### Base Path Configuration

In `vite.config.js`, the `getBasePath()` function determines the base path:

- Development (`npm run dev`): `/`
- Production: `/app/`
- Staging: `/app-staging/`

This affects:
- All asset URLs
- PWA manifest paths (scope, start_url, icons)
- Service worker navigation fallback

### Deployment Validation

The deploy script validates the manifest before deploying to prevent mismatches:

```bash
# This will FAIL if you try to deploy a production build to staging
npm run build          # Builds with /app/
npm run deploy:staging # Error: manifest has /app/, expected /app-staging/

# Correct way
npm run build:staging  # Builds with /app-staging/
npm run deploy:staging # Success!
```

## Workflow

### Testing a Feature Branch

1. Make changes on your feature branch
2. Build and deploy to staging:
   ```bash
   npm run build:deploy:staging
   ```
3. Test at https://saberloop.com/app-staging/
4. Fix any issues, repeat steps 2-3
5. When satisfied, create PR to merge to main
6. After merge, deploy to production:
   ```bash
   npm run build:deploy
   ```

### Testing a Large Change (like i18n)

For multi-phase changes, use staging throughout:

1. Complete Phase 1, deploy to staging, test
2. Complete Phase 2, deploy to staging, test
3. Continue until all phases complete
4. Final testing on staging
5. Merge all changes to main
6. Deploy to production

## PWA Considerations

Since staging and production are different PWA installations:

- **Service workers are separate** - Updates to staging don't affect production
- **Can install both** - You can install staging and production as separate apps
- **Different manifest IDs** - `/app/` vs `/app-staging/`

## Troubleshooting

### "Build/deploy mismatch detected"

You're trying to deploy a build that doesn't match the target:

```
❌ Build/deploy mismatch detected!
   Manifest has: /app/
   Expected for staging: /app-staging/
```

**Fix**: Rebuild with the correct target:
```bash
npm run build:staging   # For staging
npm run build           # For production
```

### Service Worker Caching Issues

If changes don't appear on staging:

1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Hard refresh (Ctrl+Shift+R)

Or use incognito/private browsing mode.

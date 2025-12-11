# Deployment Guide

## Overview

Saberloop uses a CI/CD pipeline with GitHub Actions for testing and Netlify for deployment.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   GitHub    │────▶│   Netlify   │
│    Push     │     │   Actions   │     │   Deploy    │
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
| Frontend | Netlify CDN | Static file hosting |
| Backend | Netlify Functions | Serverless API |
| DNS | Netlify | Domain management |

## Prerequisites

1. **GitHub Repository** - Code hosted on GitHub
2. **Netlify Account** - Free tier is sufficient
3. **Anthropic API Key** - For Claude API access

## Configuration Files

### `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  targetPort = 3000
  port = 8888

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### `.github/workflows/test.yml`

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

### Netlify Dashboard

Set these in Netlify Dashboard → Site Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `NODE_VERSION` | No | Node.js version (default: 18) |

### Local Development

Create a `.env` file (not committed):

```bash
# Required for real API
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional: Use mock API in development
VITE_USE_REAL_API=false
```

## Deployment Process

### Automatic Deployment

Every push to `main` triggers:

1. **GitHub Actions** runs tests
2. **Netlify** detects push and builds
3. **Deploy Preview** for pull requests
4. **Production Deploy** for main branch

### Manual Deployment

```bash
# Build locally
npm run build

# Deploy via Netlify CLI
netlify deploy --prod
```

## Deployment Checklist

### Before First Deploy

- [ ] Create Netlify account and site
- [ ] Connect GitHub repository
- [ ] Set `ANTHROPIC_API_KEY` in Netlify environment
- [ ] Configure build settings in Netlify

### Before Each Deploy

- [ ] All tests pass locally (`npm test && npm run test:e2e`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables are set
- [ ] Service worker version updated if needed

### After Deploy

- [ ] Verify site loads
- [ ] Test API endpoints
- [ ] Check PWA installability
- [ ] Verify offline functionality
- [ ] Check browser console for errors

## Rollback

### Via Netlify Dashboard

1. Go to Deploys tab
2. Find previous working deploy
3. Click "Publish deploy"

### Via Git

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

## Domain Configuration

### Custom Domain

1. In Netlify Dashboard → Domain settings
2. Add custom domain
3. Configure DNS records:

```
A     @     75.2.60.5
CNAME www   your-site.netlify.app
```

### SSL Certificate

Netlify provides free SSL via Let's Encrypt. Automatic renewal.

## Monitoring

### Netlify Analytics

- Page views
- Top pages
- Bandwidth usage
- Function invocations

### Function Logs

View in Netlify Dashboard → Functions → Select function → Logs

### Error Tracking

Application uses structured logging (see `src/utils/logger.js`).
Errors logged to console, visible in browser DevTools.

## Troubleshooting

### Build Fails

```bash
# Check build locally
npm run build

# Clear npm cache
npm cache clean --force
npm ci
```

### Functions Not Working

1. Check environment variables are set
2. View function logs in Netlify Dashboard
3. Test locally with `netlify dev`

### PWA Not Updating

1. Increment service worker version
2. Clear browser cache
3. Unregister old service worker in DevTools

### CORS Errors

Check that Netlify Functions include CORS headers (they should by default).

## Cost Considerations

### Netlify Free Tier

| Resource | Limit |
|----------|-------|
| Bandwidth | 100GB/month |
| Build minutes | 300/month |
| Function invocations | 125K/month |
| Concurrent builds | 1 |

### Anthropic API

See [Anthropic pricing](https://www.anthropic.com/pricing) for current rates.

## Related Documentation

- [System Overview](./SYSTEM_OVERVIEW.md)
- [API Design](./API_DESIGN.md)
- [Installation Guide](../developer-guide/INSTALLATION.md)

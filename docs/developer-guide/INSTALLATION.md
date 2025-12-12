# Installation Guide

## Prerequisites

Before installing Saberloop, ensure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

### Getting an API Key

To use real AI-generated questions, you need an API key from one of:

1. **Anthropic Claude** (recommended for server-side)
   - Sign up at [console.anthropic.com](https://console.anthropic.com/)
   - Create an API key
   - Free tier has limited credits

2. **OpenRouter** (for client-side with your own key)
   - Sign up at [openrouter.ai](https://openrouter.ai/)
   - Provides access to multiple AI models
   - Some free tier models available

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/vitorsilva/saberloop.git
cd saberloop
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Vite (build tool)
- Vitest (unit testing)
- Playwright (E2E testing)
- idb (IndexedDB wrapper)
- loglevel (logging)
- web-vitals (performance monitoring)

### 3. Set Up Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required for real API (server-side)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional: Use mock API in development
VITE_USE_REAL_API=false
```

### 4. Install Playwright Browsers (for E2E tests)

```bash
npx playwright install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Opens at `http://localhost:3000`

**With Netlify Functions:**

```bash
# Install Netlify CLI if not installed
npm install -g netlify-cli

# Run with functions
netlify dev
```

Opens at `http://localhost:8888` (includes serverless functions)

### Production Build

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## Running Tests

### Unit Tests

```bash
# Watch mode (development)
npm test

# Single run
npm test -- --run

# With coverage
npm run test:coverage
```

### E2E Tests

```bash
# Headless
npm run test:e2e

# With Playwright UI
npm run test:e2e:ui
```

## Verifying Installation

After installation, verify everything works:

```bash
# 1. Run unit tests
npm test -- --run

# 2. Build the project
npm run build

# 3. Run E2E tests
npm run test:e2e

# 4. Start dev server and verify in browser
npm run dev
```

You should be able to:
- See the welcome screen or home page
- Create a quiz (with mock or real API)
- Complete a quiz and see results
- Install the PWA (Chrome: address bar install icon)

## Troubleshooting Installation

### Node Version Issues

```bash
# Check Node version
node --version

# If wrong version, use nvm
nvm install 18
nvm use 18
```

### npm Install Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Playwright Install Issues

```bash
# Install with dependencies
npx playwright install --with-deps
```

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (Mac/Linux)
lsof -i :3000
kill -9 <PID>
```

## Next Steps

- [Configuration Guide](./CONFIGURATION.md) - Set up environment variables
- [Architecture Overview](../architecture/SYSTEM_OVERVIEW.md) - Understand the codebase
- [Contributing Guide](../../CONTRIBUTING.md) - Start contributing

## Related Documentation

- [Configuration](./CONFIGURATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [FAQ](./FAQ.md)

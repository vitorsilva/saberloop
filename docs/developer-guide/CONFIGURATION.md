# Configuration Guide

## Environment Variables

Saberloop uses environment variables for configuration. These are managed differently for local development and production.

## Local Development

### `.env` File

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# API Configuration
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Development Options
VITE_USE_REAL_API=false
```

**Important:** Never commit `.env` to version control. It's already in `.gitignore`.

### Available Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | For real API | - | Your Anthropic Claude API key |
| `VITE_USE_REAL_API` | No | `false` | Use real API vs mock API |

### Vite Environment Variables

Variables prefixed with `VITE_` are exposed to the frontend:

```javascript
// Access in frontend code
const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true';
```

Variables without `VITE_` prefix are only available in Netlify Functions (server-side).

## Production (Netlify)

### Setting Environment Variables

1. Go to Netlify Dashboard
2. Select your site
3. Navigate to: Site Settings → Environment Variables
4. Add variables:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | Your actual API key |
| `VITE_USE_REAL_API` | `true` |

### Deploy Contexts

Netlify supports different values per deploy context:

| Context | Description |
|---------|-------------|
| Production | Live site |
| Deploy Previews | Pull request previews |
| Branch deploys | Non-main branch deploys |

## API Configuration

### Mock API (Default for Development)

When `VITE_USE_REAL_API=false`:
- Uses pre-defined mock responses
- No API calls to external services
- Instant responses
- Good for UI development

### Real API (Anthropic via Netlify Functions)

When `VITE_USE_REAL_API=true` and `ANTHROPIC_API_KEY` is set:
- Calls Claude API via Netlify Functions
- Real AI-generated content
- API key stays server-side

### OpenRouter (User's Own Key)

Users can connect their own OpenRouter API key:
1. Go to Settings in the app
2. Click "Connect to AI Provider"
3. Authenticate with OpenRouter
4. Uses user's key directly from browser

## Build Configuration

### `vite.config.js`

```javascript
export default defineConfig({
  plugins: [VitePWA({...})],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 3000
  }
});
```

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
```

## PWA Configuration

### Service Worker

Configured via Vite PWA Plugin in `vite.config.js`:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [...]
  }
})
```

### Manifest

`public/manifest.json` configures PWA appearance:

```json
{
  "name": "Saberloop",
  "short_name": "Saberloop",
  "theme_color": "#6366f1",
  "background_color": "#0f172a"
}
```

## Logging Configuration

### Log Levels

Logging is configured in `src/utils/logger.js`:

| Level | Environment | Description |
|-------|-------------|-------------|
| DEBUG | Development | Verbose debugging info |
| INFO | All | General information |
| WARN | All | Warnings |
| ERROR | All | Errors |

In production, DEBUG logs are hidden.

### Changing Log Level

```javascript
// In browser console
localStorage.setItem('loglevel', 'debug');
// Refresh page
```

## Database Configuration

IndexedDB settings in `src/core/db.js`:

| Setting | Value |
|---------|-------|
| Database name | `quizmaster` |
| Version | `1` |

## Switching Configurations

### Development → Production

1. Set `VITE_USE_REAL_API=true` in `.env`
2. Ensure `ANTHROPIC_API_KEY` is set
3. Test with `netlify dev`

### Testing Mock API

1. Set `VITE_USE_REAL_API=false` in `.env`
2. Run `npm run dev`
3. No API key needed

### Testing Real API Locally

1. Set `VITE_USE_REAL_API=true` in `.env`
2. Set `ANTHROPIC_API_KEY` in `.env`
3. Run `netlify dev` (not `npm run dev`)

## Related Documentation

- [Installation Guide](./INSTALLATION.md)
- [Deployment](../architecture/DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

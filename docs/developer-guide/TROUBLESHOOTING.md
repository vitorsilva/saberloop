# Troubleshooting Guide

## Common Issues

### Development Server

#### Port Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Or use a different port
npm run dev -- --port 3001
```

#### Hot Reload Not Working

**Symptom:** Changes don't reflect in browser

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart dev server

---

### API Issues

#### "Server configuration error"

**Symptom:** API returns 500 with "Server configuration error"

**Cause:** `ANTHROPIC_API_KEY` not set

**Solution:**
1. Check `.env` file exists with key
2. For Netlify: Check Environment Variables in dashboard
3. Restart `netlify dev` after changing env vars

#### "Invalid API key"

**Symptom:** API returns 401

**Solutions:**
1. Verify API key is correct (starts with `sk-ant-`)
2. Check key hasn't expired
3. Verify key has sufficient credits

#### CORS Errors

**Symptom:** Browser console shows CORS errors

**Solutions:**
1. Use `netlify dev` instead of `npm run dev` for API calls
2. Check Netlify Functions have CORS headers
3. Ensure frontend calls correct URL

#### Rate Limiting

**Symptom:** API returns 429 Too Many Requests

**Solutions:**
1. Wait and retry
2. Implement retry logic with backoff
3. Check Anthropic dashboard for usage limits

---

### PWA Issues

#### App Not Installing

**Symptom:** No install prompt or icon

**Causes and Solutions:**

| Cause | Solution |
|-------|----------|
| Not HTTPS | Use localhost or deploy to Netlify |
| Invalid manifest | Check DevTools → Application → Manifest |
| Service worker not registered | Check DevTools → Application → Service Workers |
| Already installed | Check if already in app drawer |
| Not Chromium browser | PWA install only works in Chrome/Edge |

#### Service Worker Not Updating

**Symptom:** Old content appears after deploy

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R`
2. DevTools → Application → Service Workers → Update
3. Check "Update on reload" in DevTools
4. Clear site data: DevTools → Application → Storage → Clear site data

#### Offline Not Working

**Symptom:** App fails when offline

**Solutions:**
1. Verify service worker is active
2. Check Cache Storage in DevTools
3. Ensure all required files are in cache
4. Check network requests for missing files

---

### Build Issues

#### Build Fails

**Symptom:** `npm run build` fails

**Common Causes:**

1. **TypeScript/Syntax errors**
   ```bash
   # Check for errors
   npm run build 2>&1 | head -50
   ```

2. **Missing dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Vite config issues**
   - Check `vite.config.js` syntax
   - Verify plugin configurations

#### Large Bundle Size

**Symptom:** Build output is unexpectedly large

**Solutions:**
1. Check for unnecessary imports
2. Use dynamic imports for large components
3. Analyze bundle:
   ```bash
   npm run build -- --sourcemap
   npx vite-bundle-visualizer
   ```

---

### Test Issues

#### Unit Tests Fail

**Symptom:** `npm test` fails

**Solutions:**
1. Check test file syntax
2. Ensure mocks are correct
3. Run single test for debugging:
   ```bash
   npm test -- --run src/utils/logger.test.js
   ```

#### E2E Tests Fail

**Symptom:** `npm run test:e2e` fails

**Solutions:**
1. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```
2. Run with UI for debugging:
   ```bash
   npm run test:e2e:ui
   ```
3. Check selectors haven't changed
4. Increase timeouts for slow operations

#### Tests Pass Locally, Fail in CI

**Symptom:** Tests pass locally but fail in GitHub Actions

**Solutions:**
1. Check Node version matches CI
2. Run `npm ci` instead of `npm install` locally
3. Check for race conditions (add waits)
4. View CI logs for specific error

---

### Database Issues

#### IndexedDB Not Working

**Symptom:** Data not persisting

**Solutions:**
1. Check browser supports IndexedDB
2. Check for private/incognito mode (limited storage)
3. Clear IndexedDB and retry:
   - DevTools → Application → IndexedDB → Delete database

#### Data Migration Issues

**Symptom:** App crashes after update

**Cause:** Database schema changed without migration

**Solution:**
1. Clear IndexedDB data
2. Or implement proper migration in `db.js`

---

### Browser-Specific Issues

#### Safari Issues

- PWA installation differs (Share → Add to Home Screen)
- IndexedDB may be limited in private mode
- Service worker support varies

#### Firefox Issues

- PWA installation via browser menu
- Some PWA features may differ

#### Mobile Issues

- Test on actual device, not just emulator
- Check touch events work correctly
- Verify viewport settings

---

## Debugging Tools

### Browser DevTools

| Tab | Use For |
|-----|---------|
| Console | JavaScript errors, logs |
| Network | API calls, failed requests |
| Application | Service Worker, Cache, IndexedDB, Manifest |
| Performance | Performance profiling |
| Lighthouse | PWA audit, performance audit |

### Useful Console Commands

```javascript
// Check IndexedDB
indexedDB.databases()

// Check service worker
navigator.serviceWorker.getRegistrations()

// Clear all site data (careful!)
// Do this in DevTools → Application → Storage

// Check log level
localStorage.getItem('loglevel')
```

### Netlify CLI Debugging

```bash
# View function logs
netlify functions:serve

# Test specific function
netlify functions:invoke generate-questions --payload '{"topic":"Math"}'
```

---

## Getting Help

If you can't resolve an issue:

1. **Search existing issues:** [GitHub Issues](https://github.com/vitorsilva/demo-pwa-app/issues)
2. **Create new issue** with:
   - Description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS version
   - Console errors
   - Screenshots if applicable

## Related Documentation

- [Installation Guide](./INSTALLATION.md)
- [Configuration](./CONFIGURATION.md)
- [FAQ](./FAQ.md)

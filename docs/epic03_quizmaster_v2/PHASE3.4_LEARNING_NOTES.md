# Phase 3.4: PHP VPS Migration - Learning Notes

**Epic:** 3 - QuizMaster V2
**Phase:** 3.4 - PHP VPS Migration
**Status:** 🔄 In Progress (Backend Complete, Frontend Integration Pending)
**Started:** 2025-11-27
**Reason:** Netlify credit constraints requiring cost-effective hosting solution

---

## Why This Phase Became Necessary

**Problem:** Netlify Functions free tier (125K requests/month) credits running out

**Solution:** Migrate to PHP API on existing VPS (zero additional cost)

**Benefits:**
- 💰 No usage limits or additional costs
- 🚀 No cold starts (always-warm server)
- 🔧 Full infrastructure control
- 🎓 Learn traditional server architecture and PHP backend development
- 📊 Server-side logging and analytics capabilities

---

## Session 1 - 2025-11-27

### Planning & Documentation Reorganization

**Tasks Completed:**
- [x] Moved PHASE10_PHP_MIGRATION.md from parking_lot to epic03_quizmaster_v2
- [x] Renamed to PHASE3.4_PHP_MIGRATION.md
- [x] Updated file header metadata (phase number, status, rationale)
- [x] Added Phase 3.4 to Epic 3 master plan (EPIC3_QUIZMASTER_V2_PLAN.md)
- [x] Updated timeline table with Phase 3.4
- [x] Updated CLAUDE.md current status
- [x] Created this learning notes file

**Key Decision:**
Phase 3.4 moved from "optional parking lot" to "required active phase" due to practical cost constraints. This is a great real-world example of how project requirements can change based on operational needs!

---

## Session 2 - 2025-11-28

### PHP Backend Implementation (Complete!)

**Environment:**
- **Access:** cPanel (no SSH)
- **Web Server:** Apache
- **PHP Version:** 7.4.33
- **API URL:** `https://osmeusapontamentos.com/quiz-generator/api/v1/`
- **Approach:** Subdirectory on existing WordPress site

**Tasks Completed:**

#### Infrastructure Setup
- [x] Verified PHP works on server
- [x] Created directory structure (`/quiz-generator/src/`, `/quiz-generator/api/v1/`)
- [x] Created `.htaccess` to protect `.env` file and `/src/` directory
- [x] Created `.env` file with API key on server
- [x] Created local `php-api/` folder for version control

#### PHP Classes Created
- [x] `src/Config.php` - Loads and parses `.env` file
- [x] `src/AnthropicClient.php` - Handles Claude API communication via cURL

#### API Endpoints Created
- [x] `src/endpoints/health-check.php` - Returns API status, PHP version, key configured
- [x] `src/endpoints/generate-questions.php` - Generates 5 quiz questions (port of Netlify function)
- [x] `src/endpoints/generate-explanation.php` - Generates explanations for wrong answers

#### Router
- [x] `api/v1/index.php` - Routes requests to appropriate endpoint handlers
- [x] Supports query parameter fallback (`?endpoint=health-check`) for WordPress compatibility

#### Testing
- [x] Health check endpoint: ✅ Working
- [x] Generate questions endpoint: ✅ Working (tested with "Solar System" topic)
- [x] Generate explanation endpoint: ✅ Working

#### Cleanup
- [x] Removed test files (`test.php`, `index.html`)
- [x] Removed unused `.htaccess` in `api/v1/`
- [x] Created `.env.example` template for git

---

## Issues Encountered & Solutions

### Issue 1: WordPress Intercepting All Requests (404 errors)

**Problem:** WordPress `.htaccess` was catching all URLs and routing them through WordPress, even for the `/quiz-generator/` folder.

**Attempted Solutions:**
1. Adding exclusion rule before WordPress block - didn't work
2. Adding exclusion rule inside WordPress `<IfModule>` block - didn't work

**Final Solution:** Created an `index.html` file in `/quiz-generator/`. WordPress rules check `RewriteCond %{REQUEST_FILENAME} !-f` and `!-d` - so if a real file/directory exists, WordPress leaves it alone.

### Issue 2: URL Rewriting Not Working

**Problem:** Apache `.htaccess` rewrite rules in `/api/v1/.htaccess` weren't being applied. URLs like `/api/v1/health-check` still returned 404.

**Attempted Solution:** Standard `RewriteRule ^(.*)$ index.php [QSA,L]` approach

**Final Solution:** Instead of relying on URL rewriting, modified the router (`index.php`) to accept endpoint as a query parameter:

```php
// Try path-based routing first, then fall back to query parameter
if (empty($endpoint) || $endpoint === 'index.php') {
    $endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
}
```

**API URLs now work as:**
```
https://osmeusapontamentos.com/quiz-generator/api/v1/index.php?endpoint=health-check
https://osmeusapontamentos.com/quiz-generator/api/v1/index.php?endpoint=generate-questions
https://osmeusapontamentos.com/quiz-generator/api/v1/index.php?endpoint=generate-explanation
```

### Issue 3: PHP Version Compatibility

**Problem:** Initial code used PHP 8.0+ features (`str_starts_with()`, `str_contains()`, typed properties)

**Solution:** Rewrote all code for PHP 7.4 compatibility:
- `str_starts_with($x, '#')` → `strpos($x, '#') === 0`
- `str_contains($x, '=')` → `strpos($x, '=') !== false`
- `$array[$key] ?? $default` → `isset($array[$key]) ? $array[$key] : $default`
- Removed type declarations from properties and return types

---

## Key Learnings

### 1. PHP Best Practices

**No closing `?>` tag:** In files containing only PHP, omit the closing tag. Whitespace after `?>` can cause "headers already sent" errors.

**Reading POST body:** Use `file_get_contents('php://input')` for JSON POST data, not `$_POST` (which only works for form submissions).

**Static methods for config:** Using `Config::get('KEY')` pattern allows access from anywhere without instantiation.

### 2. Apache & WordPress Coexistence

**WordPress rewrite conditions:** The `!-f` and `!-d` conditions mean "if not a real file/directory". Creating actual files bypasses WordPress routing.

**Query parameters as fallback:** When URL rewriting fails due to CMS conflicts, query parameters (`?endpoint=X`) are a reliable alternative.

### 3. Security with .htaccess

```apache
# Protect sensitive files
<Files ".env">
    Require all denied
</Files>

# Prevent directory listing
Options -Indexes
```

**Always test:** Visit the protected URL directly to confirm 403 Forbidden response.

### 4. cURL for API Calls

```php
$ch = curl_init();
curl_setopt_array($ch, array(
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 60
));
$response = curl_exec($ch);
```

### 5. Same-Origin = No CORS

Since frontend and backend are both on `osmeusapontamentos.com`, no CORS configuration needed! Same domain + same protocol + same port = same origin.

---

## Architecture (Implemented)

### Final Structure on Server

```
/home/mdemaria/public_html/osmeusapontamentos.com/quiz-generator/
├── .htaccess              # Protects .env and src/
├── .env                   # API key (not in git!)
├── index.html             # Placeholder for WordPress bypass
├── src/
│   ├── Config.php
│   ├── AnthropicClient.php
│   └── endpoints/
│       ├── health-check.php
│       ├── generate-questions.php
│       └── generate-explanation.php
└── api/
    └── v1/
        └── index.php      # Router
```

### Local Project Structure

```
demo-pwa-app/
├── php-api/               # PHP backend (mirrors server)
│   ├── .htaccess
│   ├── .env.example       # Template (safe for git)
│   ├── src/
│   │   ├── Config.php
│   │   ├── AnthropicClient.php
│   │   └── endpoints/
│   │       ├── health-check.php
│   │       ├── generate-questions.php
│   │       └── generate-explanation.php
│   └── api/
│       └── v1/
│           └── index.php
├── netlify/               # Original Netlify Functions (kept for reference)
│   └── functions/
└── src/                   # Frontend
```

---

## API Endpoints (Working!)

| Endpoint | Method | URL |
|----------|--------|-----|
| Health Check | GET | `https://osmeusapontamentos.com/quiz-generator/api/v1/index.php?endpoint=health-check` |
| Generate Questions | POST | `https://osmeusapontamentos.com/quiz-generator/api/v1/index.php?endpoint=generate-questions` |
| Generate Explanation | POST | `https://osmeusapontamentos.com/quiz-generator/api/v1/index.php?endpoint=generate-explanation` |

### Example: Generate Questions

```javascript
fetch('https://osmeusapontamentos.com/quiz-generator/api/v1/index.php?endpoint=generate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Solar System', gradeLevel: '5th grade' })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## Testing Checklist

### Integration Testing
- [x] Health check endpoint returns correct JSON
- [x] Generate questions endpoint creates 5 questions
- [x] Generate explanation endpoint returns helpful text
- [x] Error handling returns proper JSON errors
- [ ] ~~CORS headers present~~ (Not needed - same origin)

### Security Testing
- [x] API key not exposed in responses (`api_key_configured: true`, not the actual key)
- [x] `.env` file protected (returns 403 Forbidden)
- [x] HTTPS enforced (SSL already configured on domain)
- [x] Input validation prevents injection

---

## Next Steps

**Remaining for Phase 3.4:**
1. [ ] Update frontend to use PHP backend instead of Netlify
2. [ ] Test full quiz flow end-to-end
3. [ ] Decide whether to keep Netlify as fallback or remove

**Questions to Decide:**
- Should we keep dual backend support (Netlify + PHP) or fully migrate?
- Do we need to update environment variable configuration in frontend?

---

## References

- **Phase 3.4 Plan:** `docs/epic03_quizmaster_v2/PHASE3.4_PHP_MIGRATION.md`
- **PHP API Code:** `php-api/`
- **Server Location:** `/home/mdemaria/public_html/osmeusapontamentos.com/quiz-generator/`

**External Resources:**
- [PHP Manual](https://www.php.net/manual/en/)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

---

**Last Updated:** 2025-11-28
**Next Session:** Frontend integration with PHP backend

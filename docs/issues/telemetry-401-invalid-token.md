# Issue: Telemetry endpoint returns 401 Unauthorized - Invalid token

**Created:** 2026-01-03
**Status:** In Progress
**Branch:** `claude/fix-telemetry-failures-BTety`

---

## Problem Statement

Telemetry data is failing to send to the server with HTTP 401 (Unauthorized) errors. The server response shows `{"error":"Invalid token"}`.

### Symptoms

- All POST requests to `https://saberloop.com/telemetry/ingest.php` return 401
- Console shows: `[Telemetry] Failed to send, saved to offline queue: HTTP 401`
- Events queue up in localStorage but never get sent
- Server response: `{"error":"Invalid token"}`

---

## Root Cause Analysis

The `php-api/telemetry/config.php` uses `getenv('TELEMETRY_TOKEN')` to retrieve the authentication token:

```php
'token' => getenv('TELEMETRY_TOKEN') ?: 'change-this-to-secure-token',
```

**Problem**: `getenv()` often doesn't work in shared PHP hosting because environment variables aren't passed from the web server to PHP. The fallback value `'change-this-to-secure-token'` doesn't match the production frontend's `VITE_TELEMETRY_TOKEN`.

The documentation in `PHASE40_TELEMETRY.md` (T2.2) mentions:
> "Copy to config.local.php and update the token for production"

But this mechanism was never actually implemented in the code - `config.php` doesn't check for or load a `config.local.php` file.

---

## Solution Design

Implement the `config.local.php` override mechanism that was intended but never coded:

### Changes Required

1. **Modify `php-api/telemetry/config.php`**:
   - Check for `config.local.php` and load it if it exists
   - Allow local config to override default values

2. **Update `php-api/telemetry/.htaccess`**:
   - Block direct web access to `config.local.php`

3. **Update deployment script** (`scripts/deploy-telemetry.cjs`):
   - Add clearer instructions about creating `config.local.php`

4. **Create `php-api/telemetry/config.local.example.php`**:
   - Provide a template for the local config file

---

## Files to Change

| File | Action |
|------|--------|
| `php-api/telemetry/config.php` | Modify - add config.local.php loading |
| `php-api/telemetry/.htaccess` | Modify - block config.local.php access |
| `php-api/telemetry/config.local.example.php` | Create - template file |
| `scripts/deploy-telemetry.cjs` | Modify - update instructions |

---

## Testing Plan

1. **Unit Test**: Mock the config loading behavior
2. **Manual Test**:
   - Deploy to server
   - Create `config.local.php` with correct token
   - Verify telemetry requests return 200
3. **Verification**:
   - Check that config.local.php is NOT accessible via web
   - Check that telemetry data is being stored

---

## Implementation Progress

- [x] Root cause identified
- [x] Solution designed
- [ ] Failing test written
- [ ] Fix implemented
- [ ] Tests pass
- [ ] Deployed and verified
- [ ] Documentation updated

---

## Learnings

(To be filled after completion)

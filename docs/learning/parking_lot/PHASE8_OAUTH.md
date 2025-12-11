# Phase 8: OAuth Integration with Claude API (Optional)

**Epic:** 3 - QuizMaster V2
**Status:** Optional / Experimental
**Estimated Time:** 2-3 sessions
**Prerequisites:** Phase 1 (Backend Integration) complete

---

## Overview

Phase 8 is an **optional experimental enhancement** that explores OAuth authentication with Claude API instead of using static API keys. This phase investigates using OAuth for a more secure, user-friendly authentication flow where users log in with their Anthropic account.

**⚠️ IMPORTANT: As of November 2025, Anthropic's OAuth is not publicly available. This phase is experimental and may require beta access or may not be possible yet.**

**What you'll explore:**
- OAuth 2.0 authorization flow with PKCE
- Secure token management in PWA context
- Redirect-based authentication in browser
- Token refresh strategies
- Comparison: API keys vs OAuth

**Why this is optional:**
- ✅ Static API keys work perfectly
- ✅ Simpler implementation
- ⚠️ OAuth may not be available yet
- ⚠️ More complex user experience
- ⚠️ Requires backend token exchange

**Why you might want it:**
- 🎓 Learn OAuth 2.0 flows
- 🔒 More secure than storing API keys
- 👥 Multi-user support (future)
- 🔄 Token rotation and refresh
- 💼 Enterprise authentication patterns

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand OAuth 2.0 authorization code flow
- ✅ Implement PKCE (Proof Key for Code Exchange)
- ✅ Handle OAuth redirects in PWA
- ✅ Securely store access/refresh tokens
- ✅ Implement token refresh logic
- ✅ Compare API keys vs OAuth approaches
- ✅ Handle OAuth errors gracefully

---

## OAuth vs API Keys Comparison

### Current Approach (API Keys)

**How it works:**
```javascript
// User enters API key in settings
const apiKey = 'sk-ant-api03-abc123...';

// Stored in localStorage
localStorage.setItem('anthropic_api_key', apiKey);

// Used directly in API calls
const anthropic = new Anthropic({ apiKey });
```

**Pros:**
- ✅ Simple implementation
- ✅ No backend OAuth flow needed
- ✅ Works immediately
- ✅ Easy for single user

**Cons:**
- ⚠️ User must create API key manually
- ⚠️ Key stored in browser (less secure)
- ⚠️ No expiration/rotation
- ⚠️ Hard to revoke

---

### OAuth Approach

**How it works:**
```javascript
// User clicks "Login with Claude"
// → Redirected to claude.ai/oauth/authorize
// → Logs in with Anthropic account
// → Redirected back to app with authorization code
// → App exchanges code for access token
// → Token stored securely
// → Token used for API calls
// → Token refreshed when expired
```

**Pros:**
- ✅ No API key management needed
- ✅ Tokens expire and refresh automatically
- ✅ Can be revoked remotely
- ✅ Better for multi-user apps
- ✅ Follows industry best practices

**Cons:**
- ⚠️ More complex implementation
- ⚠️ Requires OAuth backend flow
- ⚠️ Requires user to have Anthropic account
- ⚠️ May not be publicly available yet

---

## OAuth 2.0 Flow Overview

### Authorization Code Flow with PKCE

```
┌─────────────┐                                  ┌──────────────┐
│             │                                  │              │
│  QuizMaster │                                  │  Claude API  │
│     PWA     │                                  │  (Anthropic) │
│             │                                  │              │
└──────┬──────┘                                  └───────┬──────┘
       │                                                 │
       │ 1. User clicks "Login with Claude"             │
       │    Generate code_verifier & code_challenge     │
       │                                                 │
       │ 2. Redirect to /oauth/authorize                │
       ├────────────────────────────────────────────────>│
       │    with code_challenge                         │
       │                                                 │
       │                                3. User logs in  │
       │                                   & authorizes  │
       │                                                 │
       │ 4. Redirect back with authorization code       │
       │<────────────────────────────────────────────────┤
       │    to /oauth/callback?code=abc123               │
       │                                                 │
       │ 5. Exchange code for tokens                     │
       │    POST /oauth/token                            │
       │    with code + code_verifier                    │
       ├────────────────────────────────────────────────>│
       │                                                 │
       │ 6. Receive access_token & refresh_token         │
       │<────────────────────────────────────────────────┤
       │                                                 │
       │ 7. Store tokens securely (IndexedDB)            │
       │                                                 │
       │ 8. Use access_token for API calls               │
       │                                                 │
       │ 9. When token expires, refresh                  │
       │    POST /oauth/token with refresh_token         │
       ├────────────────────────────────────────────────>│
       │                                                 │
       │ 10. Receive new access_token                    │
       │<────────────────────────────────────────────────┤
       │                                                 │
```

### Key Concepts

**Code Verifier & Code Challenge (PKCE):**
- Prevents authorization code interception attacks
- Code verifier: Random string generated by client
- Code challenge: SHA-256 hash of code verifier
- Server verifies challenge matches verifier during token exchange

**Authorization Code:**
- Short-lived, one-time-use code
- Exchanged for access token
- Proves user authorized the app

**Access Token:**
- Used to make API calls
- Expires after short period (e.g., 1 hour)
- Must be refreshed

**Refresh Token:**
- Used to get new access tokens
- Longer-lived (e.g., 30 days)
- Stored securely

---

## Implementation Plan

### Step 1: Check OAuth Availability

**First, verify if Anthropic OAuth is available:**

```bash
# Try to access OAuth endpoints
curl https://claude.ai/.well-known/oauth-authorization-server

# Or check Anthropic documentation
# https://docs.anthropic.com/oauth (may not exist yet)
```

**If OAuth is not available:**
- This phase cannot be implemented yet
- Document the research and wait for public OAuth
- Continue with API key approach (Phase 1)

**If OAuth is available, continue with implementation...**

---

### Step 2: Register OAuth Application

**Hypothetical registration process:**

1. Go to Anthropic Console: https://console.anthropic.com/
2. Navigate to "OAuth Applications" or "API Keys" → "OAuth Apps"
3. Create new OAuth application:
   - **Name:** QuizMaster PWA
   - **Redirect URIs:**
     - `https://your-app.netlify.app/oauth/callback`
     - `http://localhost:3000/oauth/callback` (development)
   - **Scopes:**
     - `org:create_api_key` (or equivalent for API access)
     - `user:profile`
     - `user:inference`

4. Save **Client ID** (public, safe to expose)

**Note:** Real configuration may differ from this hypothetical example.

---

### Step 3: Create OAuth Utility

**File:** `src/utils/oauth.js` (NEW)

```javascript
/**
 * OAuth 2.0 utilities for Claude API authentication
 */

const OAUTH_CONFIG = {
  clientId: '9d1c250a-e61b-44d9-88ed-5944d1962f5e', // From OAuth registration
  authorizationEndpoint: 'https://claude.ai/oauth/authorize',
  tokenEndpoint: 'https://api.anthropic.com/oauth/token',
  redirectUri: window.location.origin + '/oauth/callback',
  scopes: ['org:create_api_key', 'user:profile', 'user:inference']
};

// PKCE helpers
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer) {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Start OAuth flow
export async function startOAuthFlow() {
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier for later use
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', generateState());

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: OAUTH_CONFIG.redirectUri,
    scope: OAUTH_CONFIG.scopes.join(' '),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: sessionStorage.getItem('oauth_state')
  });

  const authUrl = `${OAUTH_CONFIG.authorizationEndpoint}?${params}`;

  // Redirect to authorization page
  window.location.href = authUrl;
}

// Handle callback
export async function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  // Check for errors
  if (error) {
    throw new Error(`OAuth error: ${error} - ${urlParams.get('error_description')}`);
  }

  // Verify state (CSRF protection)
  const storedState = sessionStorage.getItem('oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  // Get code verifier
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code, codeVerifier);

  // Clean up session storage
  sessionStorage.removeItem('oauth_code_verifier');
  sessionStorage.removeItem('oauth_state');

  return tokens;
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code, codeVerifier) {
  const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      client_id: OAUTH_CONFIG.clientId,
      code_verifier: codeVerifier,
      redirect_uri: OAUTH_CONFIG.redirectUri
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  const tokens = await response.json();
  /*
  {
    access_token: "eyJ...",
    refresh_token: "eyJ...",
    expires_in: 3600,
    token_type: "Bearer"
  }
  */

  return tokens;
}

// Refresh access token
export async function refreshAccessToken(refreshToken) {
  const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: OAUTH_CONFIG.clientId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
  }

  return await response.json();
}

// Generate random state for CSRF protection
function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}
```

---

### Step 4: Token Storage in IndexedDB

**File:** `src/utils/tokenStorage.js` (NEW)

```javascript
/**
 * Secure token storage using IndexedDB
 */

import { openDB } from 'idb';

const DB_NAME = 'quizmaster-auth';
const STORE_NAME = 'tokens';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    }
  });
}

export async function storeTokens(tokens) {
  const db = await getDB();

  // Add expiration timestamp
  const expiresAt = Date.now() + (tokens.expires_in * 1000);

  await db.put(STORE_NAME, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt,
    token_type: tokens.token_type || 'Bearer'
  }, 'claude_oauth');
}

export async function getAccessToken() {
  const db = await getDB();
  const tokens = await db.get(STORE_NAME, 'claude_oauth');

  if (!tokens) {
    return null;
  }

  // Check if token is expired
  if (Date.now() >= tokens.expires_at) {
    // Token expired, need to refresh
    return null;
  }

  return tokens.access_token;
}

export async function getRefreshToken() {
  const db = await getDB();
  const tokens = await db.get(STORE_NAME, 'claude_oauth');
  return tokens?.refresh_token || null;
}

export async function isTokenExpired() {
  const db = await getDB();
  const tokens = await db.get(STORE_NAME, 'claude_oauth');

  if (!tokens) {
    return true;
  }

  return Date.now() >= tokens.expires_at;
}

export async function clearTokens() {
  const db = await getDB();
  await db.delete(STORE_NAME, 'claude_oauth');
}

export async function hasValidTokens() {
  const accessToken = await getAccessToken();
  return accessToken !== null;
}
```

---

### Step 5: OAuth Callback Page

**File:** `src/views/OAuthCallbackView.js` (NEW)

```javascript
/**
 * OAuth Callback View
 * Handles the redirect from Claude OAuth authorization
 */

import { handleOAuthCallback } from '../utils/oauth.js';
import { storeTokens } from '../utils/tokenStorage.js';

export default class OAuthCallbackView {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4';
  }

  async render() {
    // Show loading state
    this.el.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div class="mb-4">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Completing Sign In...</h2>
        <p class="text-gray-600">Please wait while we securely connect your account.</p>
      </div>
    `;

    try {
      // Handle OAuth callback
      const tokens = await handleOAuthCallback();

      // Store tokens securely
      await storeTokens(tokens);

      // Show success message
      this.showSuccess();

      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = '#/';
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      this.showError(error.message);
    }
  }

  showSuccess() {
    this.el.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div class="mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Sign In Successful!</h2>
        <p class="text-gray-600">Redirecting you to QuizMaster...</p>
      </div>
    `;
  }

  showError(message) {
    this.el.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div class="mb-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Sign In Failed</h2>
        <p class="text-gray-600 mb-4">${message}</p>
        <button onclick="window.location.href='#/'"
                class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Return to Home
        </button>
      </div>
    `;
  }
}
```

---

### Step 6: Update Settings View with OAuth

**File:** `src/views/SettingsView.js` (MODIFIED)

Add OAuth login option alongside API key input:

```javascript
import { startOAuthFlow } from '../utils/oauth.js';
import { hasValidTokens, clearTokens } from '../utils/tokenStorage.js';

// In render() method, add OAuth section:
async render() {
  const hasOAuth = await hasValidTokens();

  this.setHTML(`
    <div class="settings-container">
      <h1>Settings</h1>

      <!-- OAuth Section -->
      <div class="setting-section">
        <h2>Authentication Method</h2>
        <p class="text-gray-600 mb-4">Choose how to authenticate with Claude API</p>

        ${hasOAuth ? `
          <!-- Connected with OAuth -->
          <div class="oauth-connected">
            <div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div class="flex-1">
                <p class="font-semibold text-green-800">Connected with OAuth</p>
                <p class="text-sm text-green-600">Your account is securely connected</p>
              </div>
              <button id="oauth-disconnect" class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                Disconnect
              </button>
            </div>
          </div>
        ` : `
          <!-- Not connected -->
          <button id="oauth-login" class="oauth-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Sign in with Claude (OAuth)
          </button>

          <div class="divider">OR</div>

          <!-- API Key Section (existing) -->
          <div class="api-key-section">
            <label for="api-key">Claude API Key</label>
            <input type="password" id="api-key" placeholder="sk-ant-api03-...">
            <button id="save-api-key">Save API Key</button>
          </div>
        `}
      </div>
    </div>
  `);

  this.attachEventListeners();
}

attachEventListeners() {
  const oauthLoginBtn = document.getElementById('oauth-login');
  if (oauthLoginBtn) {
    oauthLoginBtn.addEventListener('click', () => {
      startOAuthFlow();
    });
  }

  const oauthDisconnectBtn = document.getElementById('oauth-disconnect');
  if (oauthDisconnectBtn) {
    oauthDisconnectBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to disconnect your Claude account?')) {
        await clearTokens();
        this.render(); // Re-render to show login button
      }
    });
  }

  // ... existing API key handlers
}
```

---

### Step 7: Update API Client to Use OAuth Tokens

**File:** `src/api/api.real.js` (MODIFIED)

```javascript
import Anthropic from '@anthropic-ai/sdk';
import { getAccessToken, getRefreshToken, isTokenExpired } from '../utils/tokenStorage.js';
import { refreshAccessToken, storeTokens } from '../utils/oauth.js';

// Get API key or OAuth token
async function getAuthCredential() {
  // Check for OAuth token first
  const hasExpired = await isTokenExpired();

  if (!hasExpired) {
    const accessToken = await getAccessToken();
    if (accessToken) {
      return { type: 'oauth', value: accessToken };
    }
  } else {
    // Token expired, try to refresh
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        await storeTokens(newTokens);
        return { type: 'oauth', value: newTokens.access_token };
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Fall through to API key check
      }
    }
  }

  // Fall back to API key
  const apiKey = localStorage.getItem('anthropic_api_key');
  if (apiKey) {
    return { type: 'apiKey', value: apiKey };
  }

  throw new Error('No authentication credential available');
}

export async function generateQuestions(topic, gradeLevel) {
  const auth = await getAuthCredential();

  const response = await fetch('/.netlify/functions/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Pass auth credential to backend
      'X-Auth-Type': auth.type,
      'Authorization': `Bearer ${auth.value}`
    },
    body: JSON.stringify({ topic, gradeLevel })
  });

  // ... rest of implementation
}
```

**Note:** Backend functions would need to be updated to accept both API keys and OAuth tokens.

---

### Step 8: Register OAuth Callback Route

**File:** `src/main.js` (MODIFIED)

```javascript
import OAuthCallbackView from './views/OAuthCallbackView.js';

// Register route
router.addRoute('/oauth/callback', OAuthCallbackView);
```

---

### Step 9: Test OAuth Flow

**Local testing:**

1. Start dev server: `npm run dev`
2. Go to Settings
3. Click "Sign in with Claude (OAuth)"
4. Should redirect to `https://claude.ai/oauth/authorize`
5. (If OAuth not available, will show error)

**If OAuth works:**
- After login, redirects back to `/oauth/callback`
- Tokens stored in IndexedDB
- Can generate quizzes using OAuth tokens
- Tokens refresh automatically when expired

---

## OAuth Security Best Practices

### 1. PKCE (Proof Key for Code Exchange)
✅ **Always use PKCE** for OAuth in browser/mobile contexts
- Prevents authorization code interception
- Required for public clients (no client secret)

### 2. State Parameter
✅ **Always include state** for CSRF protection
- Random value stored before redirect
- Verified on callback

### 3. Token Storage
✅ **Use IndexedDB** for token storage (more secure than localStorage)
- Can't be accessed via XSS if properly configured
- Supports structured data

❌ **Avoid localStorage for tokens**
- Vulnerable to XSS attacks
- All scripts on page can access

### 4. Token Expiration
✅ **Always check token expiration** before using
✅ **Implement automatic refresh** when expired
✅ **Handle refresh failures** gracefully

### 5. HTTPS Only
✅ **Never use OAuth over HTTP** in production
- Tokens can be intercepted
- Redirect URIs must be HTTPS

---

## Comparison: Implementation Complexity

### API Key Approach (Phase 1)
**Complexity:** ⭐ Low

**Files to modify:** 1-2
- Settings view (input field)
- API client (use key)

**Time:** 30 minutes

---

### OAuth Approach (Phase 8)
**Complexity:** ⭐⭐⭐⭐ High

**Files to create/modify:** 8+
- OAuth utility (`oauth.js`)
- Token storage (`tokenStorage.js`)
- OAuth callback view
- Settings view (OAuth UI)
- API client (token handling)
- Router (callback route)
- Backend functions (accept tokens)
- Error handling

**Time:** 4-6 hours (first time)

---

## Troubleshooting

### OAuth Not Available
**Symptom:** 404 error on `https://claude.ai/oauth/authorize`

**Solution:**
- Anthropic OAuth may not be public yet
- Check documentation for beta access
- Use API key approach (Phase 1) instead

### Redirect Loop
**Symptom:** Keeps redirecting to OAuth page

**Solution:**
- Check redirect URI matches registration exactly
- Verify callback route is registered
- Check for errors in browser console

### Token Not Refreshing
**Symptom:** Token expires and can't be refreshed

**Solution:**
- Check refresh token is stored
- Verify token endpoint URL correct
- Check refresh_token grant type supported

---

## Success Criteria

**Phase 8 is complete when:**

- ✅ OAuth availability confirmed (or documented as unavailable)
- ✅ OAuth flow implemented (if available):
  - PKCE parameters generated correctly
  - Redirect to authorization page works
  - Callback handles authorization code
  - Tokens exchanged successfully
  - Tokens stored in IndexedDB
  - Token refresh works
- ✅ Settings page shows OAuth option
- ✅ API client uses OAuth tokens
- ✅ Fallback to API keys works
- ✅ Error handling robust
- ✅ Security best practices followed

**Verification (if OAuth available):**
```bash
# 1. Click "Sign in with Claude"
# 2. Redirected to Claude login
# 3. After login, redirected back to app
# 4. Tokens stored in IndexedDB
# 5. Can generate quizzes
# 6. Token refreshes when expired
```

---

## Cost & Availability Considerations

**As of November 2025:**
- ❓ Anthropic OAuth availability: Unknown
- ❓ OAuth endpoint URLs: Hypothetical
- ❓ Required scopes: Assumed

**Before implementing:**
1. Check Anthropic documentation
2. Contact Anthropic support for OAuth beta access
3. Verify endpoint URLs
4. Test with sample application

**If OAuth not available:**
- Document research in this phase
- Continue with API key approach
- Monitor for OAuth public release

---

## Alternative: Simplified OAuth (Backend-Only)

If full OAuth is too complex, consider **simplified approach:**

**Backend handles entire OAuth flow:**
```javascript
// Frontend just calls backend
const tokens = await fetch('/.netlify/functions/oauth-login', {
  method: 'POST'
}).then(r => r.json());

// Backend does:
// 1. Generate PKCE
// 2. Redirect to OAuth
// 3. Handle callback
// 4. Exchange for tokens
// 5. Return to frontend
```

**Pros:**
- Simpler frontend
- Backend manages secrets
- Less code in browser

**Cons:**
- Requires backend session management
- More complex backend
- Less standard OAuth flow

---

## Next Steps

**After completing Phase 8 (if OAuth works):**

**You'll have:**
- ✅ Dual authentication (API keys + OAuth)
- ✅ More secure token management
- ✅ Automatic token refresh
- ✅ Enterprise-grade auth pattern

**Future enhancements:**
- Multi-user support (each user has own OAuth)
- Team workspaces
- Admin dashboard
- Usage analytics per user

**Move to Future Epics:**
- Epic 4: Advanced features (builds on OAuth for user profiles)
- Epic 5: SaaS features (requires OAuth for multi-tenancy)

---

## References

- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE RFC](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Anthropic API Documentation](https://docs.anthropic.com/) (check for OAuth section)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## Related Documentation

- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 1 (Backend with API Keys): `docs/epic03_quizmaster_v2/PHASE1_BACKEND.md`
- Phase 3 (Settings UI): `docs/epic03_quizmaster_v2/PHASE3_UI_POLISH.md`

---

**Last Updated:** 2025-11-20
**Status:** Optional/Experimental - OAuth availability unconfirmed
**Recommendation:** Implement Phase 1 first, then explore Phase 8 if OAuth becomes available

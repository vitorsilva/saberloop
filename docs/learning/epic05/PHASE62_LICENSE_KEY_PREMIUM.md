# Phase 62: License Key Premium

**Status:** 📋 Planning
**Priority:** High (Primary Revenue Driver)
**Estimated Effort:** 2-3 days
**Created:** January 5, 2026
**Updated:** January 5, 2026

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-05 | **Plan Created** | No-backend premium unlock via license keys for RevOps break-even |

---

## Overview

Implement a premium tier using license keys that users purchase externally (via Gumroad/Lemon Squeezy) and enter in the app to unlock features. This approach requires **ZERO backend infrastructure** - everything is validated client-side.

**Motivation:**
- Primary revenue driver for €31.25/month break-even goal
- No user accounts or backend needed
- Simple to implement (2-3 days)
- Scales with user growth
- Provides clear value exchange: €9.99 → No ads + premium features

**Key Insight:** At small scale (50 MAU), license key sharing is negligible. Client-side validation with a simple algorithm is sufficient and requires no infrastructure.

**Revenue Projection:**
- 10% conversion: 5 users × €9.99 = €50/month ✅ Exceeds target
- 15% conversion: 7-8 users × €9.99 = €70-80/month ✅ Strong profitability
- 5% conversion: 2-3 users × €9.99 = €20-30/month ⚠️ Close but may fall short

**Target:** Achieve 10-15% conversion rate to hit break-even.

---

## What You'll Learn

### New Technologies & Concepts

1. **External Payment Processors** - Gumroad/Lemon Squeezy for no-backend payments
2. **License Key Generation** - Creating validation algorithms without backend
3. **Client-Side Validation** - Secure-enough validation in browser
4. **Feature Gating** - Conditional rendering based on premium status
5. **localStorage Persistence** - Storing premium status locally
6. **Digital Product Delivery** - Automated license key distribution
7. **Checksum Algorithms** - Simple validation patterns

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Phase 60 complete** - AdSense integration (ads to remove for premium)
- ✅ **Settings view** implemented
- ✅ **Feature flags system** in place
- ✅ Understanding of localStorage API
- ✅ Decision on external payment platform (Gumroad recommended)

---

## License Key Strategy

### Why Client-Side Validation Works at Small Scale

**At 50 MAU:**
- License sharing risk is low (users don't share with strangers)
- Even if 1-2 keys are shared, still profitable
- Cost of backend infrastructure > cost of occasional sharing
- Can upgrade to backend validation later if needed

### License Key Format

```
SABER-XXXX-YYYY-ZZZZ

Example: SABER-A3F9-K2L8-M5N4
```

**Components:**
- Prefix: `SABER-` (identifies product)
- 3 segments of 4 characters each
- Characters: A-Z, 0-9 (excluding O, 0, I, 1 for clarity)
- Checksum in final segment (validates key format)

### Validation Algorithm

Simple checksum approach (client-side):

```javascript
function validateLicenseKey(key) {
  // 1. Format check
  if (!key.match(/^SABER-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)) {
    return false;
  }

  // 2. Extract segments
  const segments = key.split('-').slice(1); // Remove SABER prefix
  const [seg1, seg2, checksum] = segments;

  // 3. Calculate expected checksum
  const expectedChecksum = calculateChecksum(seg1 + seg2);

  // 4. Validate
  return checksum === expectedChecksum;
}

function calculateChecksum(data) {
  // Simple algorithm: sum ASCII values, mod 26, convert to letters
  let sum = 0;
  for (let char of data) {
    sum += char.charCodeAt(0);
  }
  // Generate 4-character checksum
  return generateSegmentFromNumber(sum);
}
```

**Note:** This is not cryptographically secure, but sufficient for small scale. Can upgrade later.

---

## Payment Platform Comparison

### Gumroad (Recommended)

| Feature | Details |
|---------|---------|
| **Fees** | 10% + payment processing (~3%) |
| **Setup time** | 10 minutes |
| **Payout** | Weekly or monthly |
| **Features** | License keys, email delivery, EU VAT handling |
| **Dashboard** | Simple, sales tracking |

**Pros:**
- Automatic license key generation
- Handles EU VAT automatically
- Email delivery to customers
- No monthly fees

**Cons:**
- 10% platform fee
- Less control over checkout

### Lemon Squeezy

| Feature | Details |
|---------|---------|
| **Fees** | 5% + payment processing |
| **Setup time** | 15 minutes |
| **Payout** | Bi-weekly |
| **Features** | License keys, webhooks, affiliate program |
| **Dashboard** | Advanced, analytics |

**Pros:**
- Lower fees (5% vs 10%)
- Better API/webhooks
- More professional

**Cons:**
- More complex setup
- Stricter requirements

**Recommendation:** **Gumroad** for simplicity and automatic VAT handling.

---

## Implementation Plan

### 62.1 Set Up Payment Platform

**Time:** 15-30 minutes

**Steps:**

1. **Create Gumroad account**
   - Go to https://gumroad.com
   - Sign up with email
   - Complete profile

2. **Create product: "Saberloop Premium"**
   - Name: "Saberloop Premium"
   - Price: €9.99 (one-time)
   - Description:
     ```
     Unlock the full Saberloop experience:

     ✨ No ads
     🎯 Advanced quiz features (coming soon)
     📊 Detailed analytics (coming soon)
     🚀 Priority support

     One-time payment, lifetime access.

     After purchase, you'll receive a license key to enter in the app.
     ```

3. **Enable license key generation**
   - In product settings → License keys
   - Enable "Generate a unique license key"
   - Format: `SABER-[random]-[random]-[random]`

4. **Configure email delivery**
   - Gumroad automatically sends key to customer email
   - Customize email template (optional)

5. **Test purchase** (use test mode)
   - Verify license key is generated
   - Verify email is sent

**No commit needed** (external platform)

---

### 62.2 Create License Key Validator

**Time:** 1-2 hours

**File:** `src/services/license-service.js` (new)

```javascript
/**
 * License Key Service
 *
 * Handles premium license key validation and storage.
 * Uses client-side validation with checksum algorithm.
 */

const LICENSE_KEY_STORAGE_KEY = 'saberloop_license_key';
const PREMIUM_STATUS_KEY = 'saberloop_is_premium';

/**
 * Validate license key format and checksum
 */
export function validateLicenseKey(key) {
  if (!key || typeof key !== 'string') {
    return false;
  }

  // Normalize: uppercase, remove spaces
  const normalized = key.toUpperCase().replace(/\s/g, '');

  // Format: SABER-XXXX-YYYY-ZZZZ
  const pattern = /^SABER-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
  if (!pattern.test(normalized)) {
    return false;
  }

  // Extract segments
  const segments = normalized.split('-').slice(1);
  const [seg1, seg2, checksum] = segments;

  // Validate checksum
  const expectedChecksum = calculateChecksum(seg1 + seg2);
  return checksum === expectedChecksum;
}

/**
 * Calculate checksum for license key validation
 */
function calculateChecksum(data) {
  const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let sum = 0;

  for (let char of data) {
    sum += validChars.indexOf(char) + 1;
  }

  // Generate 4-character checksum from sum
  let checksum = '';
  let temp = sum;
  for (let i = 0; i < 4; i++) {
    checksum += validChars[temp % validChars.length];
    temp = Math.floor(temp / validChars.length);
  }

  return checksum;
}

/**
 * Activate premium with license key
 */
export function activatePremium(licenseKey) {
  if (!validateLicenseKey(licenseKey)) {
    return {
      success: false,
      error: 'Invalid license key format'
    };
  }

  // Store in localStorage
  try {
    localStorage.setItem(LICENSE_KEY_STORAGE_KEY, licenseKey);
    localStorage.setItem(PREMIUM_STATUS_KEY, 'true');

    return {
      success: true,
      message: 'Premium activated successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to save license key'
    };
  }
}

/**
 * Check if user has premium
 */
export function isPremium() {
  const status = localStorage.getItem(PREMIUM_STATUS_KEY);
  const key = localStorage.getItem(LICENSE_KEY_STORAGE_KEY);

  // Must have both status flag and valid key
  return status === 'true' && key && validateLicenseKey(key);
}

/**
 * Get stored license key
 */
export function getLicenseKey() {
  return localStorage.getItem(LICENSE_KEY_STORAGE_KEY);
}

/**
 * Deactivate premium (for testing or user request)
 */
export function deactivatePremium() {
  localStorage.removeItem(LICENSE_KEY_STORAGE_KEY);
  localStorage.removeItem(PREMIUM_STATUS_KEY);
}

/**
 * Get premium status details
 */
export function getPremiumStatus() {
  const premium = isPremium();
  const key = getLicenseKey();

  return {
    isPremium: premium,
    licenseKey: premium ? key : null,
    activatedAt: premium ? localStorage.getItem('premium_activated_at') : null
  };
}
```

**Commit:** `feat(premium): add license key validation service`

---

### 62.3 Add License Key Input to Settings

**Time:** 1-2 hours

**File:** `src/views/SettingsView.js`

**Changes:**

Add a new section for premium:

```javascript
import { isPremium, activatePremium, getPremiumStatus } from '../services/license-service.js';

// In renderSettingsView()

<div class="settings-section premium-section">
  <h2 class="settings-section-title">
    ${isPremium() ? '✨ ' : ''}${t('settings.premium.title')}
  </h2>

  ${isPremium() ? `
    <!-- Premium Active -->
    <div class="premium-active-card">
      <div class="premium-badge">
        <span class="badge-icon">✨</span>
        <span class="badge-text">${t('settings.premium.active')}</span>
      </div>

      <p class="premium-message">
        ${t('settings.premium.thankyou')}
      </p>

      <div class="premium-benefits">
        <h3>${t('settings.premium.benefits.title')}</h3>
        <ul>
          <li>✓ ${t('settings.premium.benefits.noAds')}</li>
          <li>✓ ${t('settings.premium.benefits.features')}</li>
          <li>✓ ${t('settings.premium.benefits.support')}</li>
        </ul>
      </div>

      <details class="premium-key-details">
        <summary>${t('settings.premium.showKey')}</summary>
        <code class="license-key-display">${getPremiumStatus().licenseKey}</code>
      </details>
    </div>
  ` : `
    <!-- Premium Upgrade -->
    <div class="premium-upgrade-card">
      <div class="premium-benefits">
        <h3>${t('settings.premium.upgrade.title')}</h3>
        <ul>
          <li>🚫 ${t('settings.premium.benefits.noAds')}</li>
          <li>📊 ${t('settings.premium.benefits.features')}</li>
          <li>🚀 ${t('settings.premium.benefits.support')}</li>
        </ul>
      </div>

      <div class="premium-pricing">
        <span class="price">€9.99</span>
        <span class="price-note">${t('settings.premium.pricing.onetime')}</span>
      </div>

      <a
        href="https://gumroad.com/l/saberloop-premium"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary btn-premium"
        data-testid="buy-premium-btn"
      >
        ${t('settings.premium.upgrade.button')}
      </a>

      <div class="divider">
        <span>${t('settings.premium.divider')}</span>
      </div>

      <div class="license-key-input-section">
        <p class="input-label">${t('settings.premium.haveKey')}</p>

        <input
          type="text"
          id="license-key-input"
          class="license-key-input"
          placeholder="SABER-XXXX-YYYY-ZZZZ"
          data-testid="license-key-input"
        />

        <button
          id="activate-license-btn"
          class="btn btn-secondary"
          data-testid="activate-license-btn"
        >
          ${t('settings.premium.activate')}
        </button>

        <div id="license-message" class="license-message" role="alert"></div>
      </div>
    </div>
  `}
</div>
```

**Event handlers:**

```javascript
// After rendering settings view
if (!isPremium()) {
  const input = document.getElementById('license-key-input');
  const button = document.getElementById('activate-license-btn');
  const messageEl = document.getElementById('license-message');

  button.addEventListener('click', () => {
    const key = input.value.trim();
    const result = activatePremium(key);

    if (result.success) {
      messageEl.className = 'license-message success';
      messageEl.textContent = result.message;

      // Reload page to reflect premium status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      messageEl.className = 'license-message error';
      messageEl.textContent = result.error;
    }
  });
}
```

**Commit:** `feat(premium): add license key input to settings`

---

### 62.4 Implement Feature Gating

**Time:** 1-2 hours

**Files to modify:**
- `src/utils/adManager.js` - Hide ads for premium users
- `src/views/ResultsView.js` - Show premium badge
- Future features as needed

**Changes:**

**1. Hide ads for premium users:**

```javascript
// In adManager.js
import { isPremium } from '../services/license-service.js';

canLoadAds() {
  // Don't load ads if user is premium
  if (isPremium()) {
    return false;
  }

  return navigator.onLine && typeof adsbygoogle !== 'undefined';
}
```

**2. Show premium badge:**

```javascript
// In any view where you want to show premium status
import { isPremium } from '../services/license-service.js';

${isPremium() ? '<span class="premium-badge">✨ Premium</span>' : ''}
```

**3. Feature flag helper:**

```javascript
// src/utils/features.js
import { isPremium } from '../services/license-service.js';

export function hasFeature(featureName) {
  const premiumFeatures = [
    'no-ads',
    'advanced-analytics', // Future
    'custom-quiz-templates', // Future
    'export-history', // Future
  ];

  if (premiumFeatures.includes(featureName)) {
    return isPremium();
  }

  return true; // Free feature
}
```

**Commit:** `feat(premium): implement feature gating for premium users`

---

### 62.5 Add i18n Translations

**Time:** 30 minutes

**Files:** `public/locales/*/translation.json`

**English (en):**
```json
{
  "settings": {
    "premium": {
      "title": "Premium",
      "active": "Premium Active",
      "thankyou": "Thank you for supporting Saberloop! You have access to all premium features.",
      "showKey": "Show license key",
      "upgrade": {
        "title": "Upgrade to Premium",
        "button": "Get Premium"
      },
      "benefits": {
        "title": "Premium Benefits",
        "noAds": "Ad-free experience",
        "features": "Advanced features (coming soon)",
        "support": "Priority support"
      },
      "pricing": {
        "onetime": "one-time payment"
      },
      "divider": "or",
      "haveKey": "Already have a license key?",
      "activate": "Activate",
      "errors": {
        "invalid": "Invalid license key. Please check and try again.",
        "failed": "Failed to activate. Please try again."
      },
      "success": {
        "activated": "Premium activated! Reloading..."
      }
    }
  }
}
```

**Portuguese (pt):**
```json
{
  "settings": {
    "premium": {
      "title": "Premium",
      "active": "Premium Ativo",
      "thankyou": "Obrigado por apoiar o Saberloop! Tem acesso a todas as funcionalidades premium.",
      "showKey": "Mostrar chave de licença",
      "upgrade": {
        "title": "Atualizar para Premium",
        "button": "Obter Premium"
      },
      "benefits": {
        "title": "Benefícios Premium",
        "noAds": "Experiência sem anúncios",
        "features": "Funcionalidades avançadas (em breve)",
        "support": "Suporte prioritário"
      },
      "pricing": {
        "onetime": "pagamento único"
      },
      "divider": "ou",
      "haveKey": "Já tem uma chave de licença?",
      "activate": "Ativar",
      "errors": {
        "invalid": "Chave de licença inválida. Verifique e tente novamente.",
        "failed": "Falha ao ativar. Tente novamente."
      },
      "success": {
        "activated": "Premium ativado! A recarregar..."
      }
    }
  }
}
```

**Commit:** `feat(i18n): add premium license translations`

---

### 62.6 Add Premium Styles

**Time:** 30-45 minutes

**File:** `src/styles/components/premium.css` (new)

```css
/* Premium Section */
.premium-section {
  border-top: 2px solid var(--border-color);
  padding-top: 2rem;
  margin-top: 2rem;
}

/* Premium Active Card */
.premium-active-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.badge-icon {
  font-size: 1.2em;
}

.premium-message {
  margin: 1rem 0;
  opacity: 0.95;
}

.premium-benefits {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
}

.premium-benefits h3 {
  margin-top: 0;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.premium-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.premium-benefits li {
  padding: 0.25rem 0;
}

.premium-key-details {
  margin-top: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.premium-key-details summary {
  cursor: pointer;
  user-select: none;
}

.license-key-display {
  display: block;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-family: monospace;
  letter-spacing: 1px;
}

/* Premium Upgrade Card */
.premium-upgrade-card {
  background: var(--card-background);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 2rem;
}

.premium-pricing {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.price-note {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.btn-premium {
  width: 100%;
  font-size: 1.1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.divider {
  text-align: center;
  margin: 2rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: var(--border-color);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: var(--background-color);
  padding: 0 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* License Key Input */
.license-key-input-section {
  margin-top: 1.5rem;
}

.input-label {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.license-key-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
}

.license-key-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.license-message {
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  display: none;
}

.license-message.success {
  display: block;
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.license-message.error {
  display: block;
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
}

/* Responsive */
@media (max-width: 640px) {
  .premium-active-card,
  .premium-upgrade-card {
    padding: 1.5rem;
  }

  .price {
    font-size: 2rem;
  }
}
```

**Commit:** `style(premium): add license key premium styles`

---

### 62.7 Testing

**Unit Tests** (1-2 hours)

File: `tests/unit/license-service.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateLicenseKey,
  activatePremium,
  isPremium,
  deactivatePremium
} from '../../src/services/license-service.js';

describe('License Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('validateLicenseKey', () => {
    it('accepts valid license key format', () => {
      const validKey = 'SABER-A3F9-K2L8-M5N4';
      expect(validateLicenseKey(validKey)).toBe(true);
    });

    it('rejects invalid prefix', () => {
      expect(validateLicenseKey('WRONG-A3F9-K2L8-M5N4')).toBe(false);
    });

    it('rejects invalid format', () => {
      expect(validateLicenseKey('SABER-123')).toBe(false);
    });

    it('rejects invalid checksum', () => {
      expect(validateLicenseKey('SABER-A3F9-K2L8-XXXX')).toBe(false);
    });

    it('normalizes input (lowercase, spaces)', () => {
      const key = 'saber-a3f9-k2l8-m5n4';
      expect(validateLicenseKey(key)).toBe(true);
    });
  });

  describe('activatePremium', () => {
    it('activates with valid key', () => {
      const result = activatePremium('SABER-A3F9-K2L8-M5N4');
      expect(result.success).toBe(true);
      expect(isPremium()).toBe(true);
    });

    it('fails with invalid key', () => {
      const result = activatePremium('INVALID-KEY');
      expect(result.success).toBe(false);
      expect(isPremium()).toBe(false);
    });
  });

  describe('isPremium', () => {
    it('returns false initially', () => {
      expect(isPremium()).toBe(false);
    });

    it('returns true after activation', () => {
      activatePremium('SABER-A3F9-K2L8-M5N4');
      expect(isPremium()).toBe(true);
    });

    it('returns false after deactivation', () => {
      activatePremium('SABER-A3F9-K2L8-M5N4');
      deactivatePremium();
      expect(isPremium()).toBe(false);
    });
  });
});
```

**E2E Tests** (1 hour)

File: `tests/e2e/premium.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Premium License', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage
    await page.goto('/settings');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows upgrade UI for non-premium users', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('[data-testid="buy-premium-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="license-key-input"]')).toBeVisible();
  });

  test('activates premium with valid key', async ({ page }) => {
    await page.goto('/settings');

    // Enter valid test key
    await page.fill('[data-testid="license-key-input"]', 'SABER-TEST-TEST-TEST');
    await page.click('[data-testid="activate-license-btn"]');

    // Should show success message
    await expect(page.locator('.license-message.success')).toBeVisible();

    // Page should reload and show premium status
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.premium-active-card')).toBeVisible();
  });

  test('rejects invalid license key', async ({ page }) => {
    await page.goto('/settings');

    await page.fill('[data-testid="license-key-input"]', 'INVALID-KEY');
    await page.click('[data-testid="activate-license-btn"]');

    await expect(page.locator('.license-message.error')).toBeVisible();
    await expect(page.locator('.premium-active-card')).not.toBeVisible();
  });

  test('hides ads for premium users', async ({ page }) => {
    // Activate premium first
    await page.goto('/settings');
    await page.evaluate(() => {
      localStorage.setItem('saberloop_license_key', 'SABER-TEST-TEST-TEST');
      localStorage.setItem('saberloop_is_premium', 'true');
    });

    // Start a quiz
    await page.goto('/');
    await page.fill('[data-testid="topic-input"]', 'Math');
    await page.click('[data-testid="start-quiz-btn"]');

    // Ad container should not be visible
    await expect(page.locator('.ad-container')).not.toBeVisible();
  });
});
```

**Commit:** `test(premium): add license key tests`

---

## Success Criteria

- [ ] Gumroad product created and tested
- [ ] License key validation working
- [ ] Settings UI shows upgrade/active state
- [ ] Premium users see no ads
- [ ] License keys persist across sessions
- [ ] Invalid keys are rejected with clear error
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Mobile UI tested and working
- [ ] Translations complete in all languages

---

## Revenue Tracking

**How to track sales:**

1. **Gumroad Dashboard**
   - Shows all sales in real-time
   - Export monthly reports (CSV)

2. **Manual tracking**
   - Add sales to RevOps spreadsheet
   - Track conversion rate: sales / MAU

3. **Key metrics to watch**
   - Conversion rate (target: 10-15%)
   - Average revenue per user (ARPU)
   - Monthly recurring revenue (from new users)

---

## Common Issues & Solutions

### Issue: Users can't find license key after purchase
**Solution:**
- Check Gumroad email delivery settings
- Add "Check your email" message in app
- Provide support email for manual key resend

### Issue: Key validation too strict/loose
**Solution:**
- Adjust checksum algorithm sensitivity
- Log validation failures for analysis
- Can upgrade to backend validation later

### Issue: Users want refunds
**Solution:**
- Gumroad handles refunds automatically
- Deactivated keys still in localStorage (acceptable)
- Consider grace period for genuine issues

---

## Future Enhancements (Out of Scope)

1. **Backend Validation** - API endpoint to validate keys (prevents sharing)
2. **Device Limits** - Restrict key to 2-3 devices
3. **Subscription Model** - Monthly recurring instead of one-time
4. **Tiered Pricing** - Basic (€4.99) vs Pro (€9.99)
5. **Trial Period** - 7-day premium trial
6. **Upgrade Prompts** - Gentle reminders to upgrade (not nagging)

---

## Integration with RevOps Strategy

This phase is **Part 3** (PRIMARY DRIVER) of the hybrid monetization strategy:

1. **Phase 60**: AdSense → €1-5/month
2. **Phase 61**: Donations → €5-15/month
3. **Phase 62 (This)**: License key premium → €30-50/month ✅ **PRIMARY**

**Combined target:** €36-70/month (exceeds €31.25 break-even)

**With 10% conversion at 50 MAU:**
- 5 premium users × €9.99 = €50/month
- AdSense: €5/month
- Donations: €5/month
- **Total: €60/month** ✅ Break-even achieved + 92% margin

---

## References

- [Gumroad Documentation](https://help.gumroad.com/)
- [Lemon Squeezy Docs](https://docs.lemonsqueezy.com/)
- [License Key Best Practices](https://www.gamasutra.com/blogs/DavidStaack/20180515/317925/License_key_generation_and_validation.php)
- [Client-Side Validation Tradeoffs](https://stackoverflow.com/questions/6567869/what-is-the-best-way-to-validate-a-license-key)

---

**Next Steps:** After implementing all three phases (60, 61, 62), monitor revenue in RevOps spreadsheet and adjust strategy based on actual conversion rates.

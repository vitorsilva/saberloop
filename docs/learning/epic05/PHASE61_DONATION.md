# Phase 61: Donation Support

**Status:** 📋 Planning
**Priority:** Medium (Supplemental Revenue)
**Estimated Effort:** 1-2 hours
**Created:** January 5, 2026
**Updated:** January 5, 2026

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2026-01-05 | **Plan Created** | Quick-win donation support for RevOps strategy |

---

## Overview

Add a simple donation button to allow users to support Saberloop's development. This is a low-effort, no-infrastructure addition that complements ad revenue (Phase 60) and premium features (Phase 62) in the hybrid monetization strategy.

**Motivation:**
- Zero infrastructure needed (use existing donation platforms)
- Some users prefer to support directly rather than see ads
- Quick win (30 minutes to implement)
- Builds community goodwill and engagement
- Unpredictable but potentially valuable revenue stream

**Key Insight:** Educational/learning apps have supportive user bases. A tasteful "Support Development" option can generate €5-15/month from passionate users.

**Revenue Projection:**
- Optimistic: 2-3 donations/month × €5 = €10-15/month
- Realistic: 1 donation/month × €5 = €5/month
- Conservative: €2-5/month average

---

## What You'll Learn

### New Technologies & Concepts

1. **Donation Platforms** - Ko-fi, Buy Me a Coffee, GitHub Sponsors comparison
2. **Call-to-Action Design** - Non-intrusive support requests
3. **Attribution Tracking** - Understanding which users donate (optional)
4. **Community Building** - Engaging users beyond product usage

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Settings view** implemented
- ✅ **About/Help page** available
- ✅ Understanding of basic UI component integration
- ✅ Decision on which donation platform to use

---

## Platform Comparison

### Ko-fi (Recommended)

| Feature | Details |
|---------|---------|
| **Fees** | 0% for one-time donations, 5% for memberships |
| **Setup time** | 5 minutes |
| **Payment methods** | PayPal, Stripe (cards) |
| **Minimum payout** | None (instant to PayPal) |
| **Features** | One-time donations, memberships, shop |
| **Link format** | `https://ko-fi.com/yourusername` |

**Pros:** Zero fees on donations, easy setup, supports both one-time and recurring
**Cons:** Requires PayPal for instant payout

### Buy Me a Coffee

| Feature | Details |
|---------|---------|
| **Fees** | 5% platform fee |
| **Setup time** | 5 minutes |
| **Payment methods** | Stripe (cards), PayPal |
| **Minimum payout** | €30 |
| **Features** | One-time donations, memberships, extras |
| **Link format** | `https://buymeacoffee.com/yourusername` |

**Pros:** Clean branding, popular platform
**Cons:** 5% fee on all transactions, €30 minimum payout

### GitHub Sponsors (If open-source)

| Feature | Details |
|---------|---------|
| **Fees** | 0% (GitHub covers fees) |
| **Setup time** | 10 minutes (requires approval) |
| **Payment methods** | Credit card, PayPal |
| **Minimum payout** | $100 |
| **Features** | Recurring only, tiers |
| **Link format** | `https://github.com/sponsors/yourusername` |

**Pros:** Zero fees, professional, GitHub integration
**Cons:** Requires public repo, $100 minimum, approval process

**Recommendation:** **Ko-fi** for fastest setup with zero fees.

---

## Implementation Plan

### 61.1 Create Donation Platform Account

**Time:** 5-10 minutes

**Steps:**

1. Go to https://ko-fi.com (or chosen platform)
2. Sign up with email
3. Choose username: `saberloop` (or similar)
4. Set up payment method (PayPal recommended for Ko-fi)
5. Customize profile:
   - Name: "Saberloop"
   - Description: "Support the development of Saberloop, a free quiz app"
   - Add logo/icon
6. Get your donation link: `https://ko-fi.com/saberloop`

**No commit needed** (external platform)

---

### 61.2 Add Donation Button to Settings

**Time:** 15-30 minutes

**File:** `src/views/SettingsView.js`

**Changes:**

Add a new section at the bottom of settings:

```javascript
// In renderSettingsView()

<div class="settings-section">
  <h2 class="settings-section-title">
    ${t('settings.support.title')}
  </h2>

  <div class="support-card">
    <p class="support-message">
      ${t('settings.support.message')}
    </p>

    <a
      href="https://ko-fi.com/saberloop"
      target="_blank"
      rel="noopener noreferrer"
      class="btn btn-support"
      data-testid="donation-link"
    >
      <span class="btn-icon">☕</span>
      ${t('settings.support.button')}
    </a>

    <p class="support-note">
      ${t('settings.support.note')}
    </p>
  </div>
</div>
```

**Styling notes:**
- Use subtle styling (not flashy/aggressive)
- Place at bottom of settings (non-intrusive)
- Clear but gentle call-to-action

**Commit:** `feat(monetization): add donation support link`

---

### 61.3 Add i18n Translations

**Time:** 15 minutes

**Files:** `public/locales/*/translation.json`

**English (en):**
```json
{
  "settings": {
    "support": {
      "title": "Support Development",
      "message": "Saberloop is free and open to all. If you find it helpful, consider supporting its development.",
      "button": "Buy Me a Coffee",
      "note": "Your support helps cover hosting and development costs. Thank you! ❤️"
    }
  }
}
```

**Portuguese (pt):**
```json
{
  "settings": {
    "support": {
      "title": "Apoiar o Desenvolvimento",
      "message": "O Saberloop é gratuito e aberto a todos. Se achar útil, considere apoiar o seu desenvolvimento.",
      "button": "Oferecer um Café",
      "note": "O seu apoio ajuda a cobrir custos de hospedagem e desenvolvimento. Obrigado! ❤️"
    }
  }
}
```

**Commit:** `feat(i18n): add donation support translations`

---

### 61.4 Add Donation Styles

**Time:** 15 minutes

**File:** `src/styles/components/support.css` (new)

```css
/* Support Section */
.support-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.support-message {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.btn-support {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-support:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 1.2em;
}

.support-note {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  margin-top: 1rem;
  font-style: italic;
}

/* Responsive */
@media (max-width: 640px) {
  .support-card {
    padding: 1rem;
  }

  .btn-support {
    width: 100%;
    justify-content: center;
  }
}
```

**Commit:** `style(monetization): add donation support styles`

---

### 61.5 Optional: Add to About/Help Page

**Time:** 10 minutes

**File:** `src/views/HelpView.js` or `src/views/AboutView.js`

Add a small mention at the bottom:

```javascript
<footer class="help-footer">
  <p>
    Enjoying Saberloop?
    <a href="https://ko-fi.com/saberloop" target="_blank" rel="noopener">
      Support development ☕
    </a>
  </p>
</footer>
```

**Commit:** `feat(monetization): add donation link to help page`

---

### 61.6 Testing

**Time:** 15 minutes

**Manual Testing:**
- [ ] Donation button visible in Settings
- [ ] Link opens Ko-fi page in new tab
- [ ] Button styling looks good on mobile
- [ ] Translations work in all languages
- [ ] Link uses `rel="noopener noreferrer"` for security

**E2E Test (Optional):**

File: `tests/e2e/donation.spec.js`

```javascript
test('donation link is visible in settings', async ({ page }) => {
  await page.goto('/settings');

  const donationLink = page.locator('[data-testid="donation-link"]');
  await expect(donationLink).toBeVisible();
  await expect(donationLink).toHaveAttribute('href', /ko-fi\.com/);
  await expect(donationLink).toHaveAttribute('target', '_blank');
});
```

**Commit:** `test(monetization): add donation link tests`

---

## Success Criteria

- [ ] Donation platform account created and configured
- [ ] Donation button visible in Settings page
- [ ] Link opens in new tab (security: `rel="noopener"`)
- [ ] Button styling is tasteful and non-intrusive
- [ ] Translations available in all supported languages
- [ ] Button works on mobile devices
- [ ] No console errors

---

## Best Practices

### Do's
✅ Keep messaging humble and appreciative
✅ Place in low-traffic areas (Settings, About)
✅ Make it optional and non-intrusive
✅ Thank donors publicly (with permission)
✅ Be transparent about what donations cover

### Don'ts
❌ Don't make it feel like begging
❌ Don't interrupt user flow with donation prompts
❌ Don't gate features behind donations
❌ Don't show donation prompts repeatedly
❌ Don't make users feel guilty for not donating

---

## Promoting Donations (Optional)

If you want to encourage donations without being pushy:

1. **Update landing page footer:**
   - Small text: "Support this project ☕"

2. **Add to GitHub README:**
   - "Like this project? [Buy me a coffee](https://ko-fi.com/saberloop)"

3. **Celebrate milestones:**
   - "Thanks to 10 supporters, we've covered hosting costs this month!"

4. **Show impact:**
   - In Settings: "5 supporters this month → Hosting costs covered ✅"

---

## Revenue Tracking

**How to track:**
1. Ko-fi dashboard shows donations
2. Export monthly reports
3. Add to RevOps spreadsheet manually

**Expected performance:**
- Month 1-2: €0-5 (slow start)
- Month 3-6: €5-10 (as user base grows)
- Month 6+: €10-20 (with 50+ MAU)

---

## Integration with RevOps Strategy

This phase is **Part 2** of the hybrid monetization strategy:

1. **Phase 60**: AdSense → €1-5/month
2. **Phase 61 (This)**: Donations → €5-15/month ✅
3. **Phase 62**: License key premium → €30-50/month

**Combined target:** €36-70/month (exceeds €31.25 break-even)

---

## Common Questions

**Q: Will this annoy users?**
A: Not if done tastefully. Keep it in Settings/About only, never interrupt user flow.

**Q: Should I offer perks to donors?**
A: Not necessary. Premium features should be via license key (Phase 62). Donations are pure support.

**Q: How much should I suggest?**
A: Ko-fi defaults to €3-5 "coffees". This is appropriate for a free app.

**Q: What if no one donates?**
A: That's OK! It's zero effort to maintain, and even €5/month helps. Focus on Phase 62 for reliable revenue.

---

## Future Enhancements (Out of Scope)

1. **Donor Recognition** - Optional "Supporters" page
2. **Progress Bar** - "€15/€31 monthly goal reached"
3. **Donation Tiers** - Different support levels with recognition
4. **Recurring Donations** - Monthly supporters (Ko-fi memberships)

---

## References

- [Ko-fi Documentation](https://help.ko-fi.com/)
- [Ethical Donation Requests](https://www.indiehackers.com/post/asking-for-donations-without-being-annoying)
- [Open Source Sustainability](https://opensource.guide/getting-paid/)

---

**Next Steps:** After completing Phase 61, proceed to Phase 62 (License Key Premium) for the primary revenue driver in the monetization strategy.

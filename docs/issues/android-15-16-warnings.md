# Android 15/16 Play Console Warnings Investigation

**Date:** 2025-12-19
**Status:** Documented - No Action Required (warnings only)
**Related Phase:** Epic 4, Phase 5 (Play Store Production)

---

## Summary

During closed testing (Dec 17-31, 2025), Google Play Console displays three warnings related to Android 15 (SDK 35) and Android 16 compatibility. These are **warnings, not blockers** - the app can proceed to production.

---

## Warnings Overview

### Warning 1: Edge-to-Edge Display May Not Work (Android 15)

**Original (PT):** "A funcionalidade de apresentação até às extremidades pode não ser apresentada para todos os utilizadores"

**What it means:**
- Starting with Android 15, apps targeting SDK 35 display edge-to-edge by default
- The app content extends behind the status bar and navigation bar
- Apps need to handle "insets" to avoid content being hidden behind system UI

**Technical Details:**
- Requires calling `enableEdgeToEdge()` (Kotlin) or `EdgeToEdge.enable()` (Java)
- This is native Android code, not something we control in PWA

**Impact on Saberloop:**
- Saberloop is a TWA (Trusted Web Activity) - a web app wrapped in Chrome
- Chrome handles the edge-to-edge display, not our code
- This warning applies to the PWABuilder-generated wrapper

---

### Warning 2: Deprecated APIs for Edge-to-Edge (Android 15)

**Original (PT):** "A sua app usa APIs ou parâmetros descontinuados para a funcionalidade de apresentação até às extremidades"

**What it means:**
- The app uses deprecated APIs/parameters for window presentation
- These were deprecated in Android 15

**Technical Details:**
- The deprecated APIs are in the PWABuilder/Bubblewrap generated code
- Not in our PWA source code

**Impact on Saberloop:**
- Requires regenerating the AAB with an updated PWABuilder version
- PWABuilder team is aware (GitHub issue #4863) but fix still in progress

---

### Warning 3: Resizing/Orientation Restrictions (Android 16)

**Original (PT):** "Remova as restrições de redimensionamento e orientação na sua app para que esta seja compatível com dispositivos com ecrãs grandes"

**What it means:**
- Android 16 will ignore orientation and resizing restrictions on large screens
- Apps locked to portrait mode may have issues on tablets/foldables

**Current Configuration:**
```javascript
// vite.config.js - PWA manifest
orientation: 'portrait-primary'
```

**Impact on Saberloop:**
- Our manifest requests portrait orientation
- On Android 16+ large screens, this will be ignored
- PWA is responsive, so it should adapt (but untested)

---

## Root Cause Analysis

### PWABuilder TWA Package

The warnings originate from the **PWABuilder-generated Android wrapper**, not our PWA code.

**PWABuilder GitHub Status:**
- Issue #4863 reported: Jan 6, 2025
- Status: Marked "Done" but users still report warnings (as of Mar 2025)
- Cause: Outdated Bubblewrap templates with deprecated APIs

**Current PWABuilder Template:**
- Appears to target SDK 35 but uses deprecated APIs
- Edge-to-edge handling not implemented in generated wrapper

### Our PWA Manifest

```javascript
// vite.config.js
manifest: {
    display: 'standalone',
    orientation: 'portrait-primary',  // <-- Android 16 warning source
    // ...
}
```

The `orientation: 'portrait-primary'` setting triggers Warning 3 but is correct for our mobile-first design.

---

## Recommendations

### Short Term (No Action Needed)

1. **These are warnings, not errors** - Production release can proceed
2. **Most users won't be affected** - Android 15/16 adoption is still growing
3. **Monitor user feedback** - If issues reported, investigate further

### Medium Term (Next App Update)

1. **Regenerate AAB with latest PWABuilder**
   - Check if PWABuilder has released a fix
   - Target SDK updates typically take 3-6 months for tools to catch up

2. **Test on Android 15 emulator**
   - Verify edge-to-edge display works correctly
   - Check if content is obscured by status/navigation bars

3. **Consider removing orientation lock**
   - Change `orientation: 'portrait-primary'` to `orientation: 'any'`
   - Would need to verify UI works in landscape
   - Benefit: Better tablet/foldable support

### Long Term (Future Consideration)

1. **Native TWA wrapper** - Build custom Android wrapper with full control
2. **Capacitor/Cordova** - Alternative to TWA with more native control
3. **Wait for PWABuilder fix** - Simplest, let tools catch up

---

## Testing Plan (Optional)

If you want to verify the app works on Android 15:

### Option A: Android Studio Emulator

1. Install Android Studio
2. Create emulator with Android 15 (API 35)
3. Install the APK: `adb install Saberloop.apk`
4. Test edge-to-edge display
5. Check status bar and navigation bar behavior

### Option B: Physical Device

1. If you have an Android 15 device
2. Install from Play Store (closed testing)
3. Verify display is correct

### What to Check

- [ ] Status bar doesn't overlap content
- [ ] Navigation bar doesn't overlap content
- [ ] App is usable in portrait mode
- [ ] (Bonus) App works in landscape on tablet

---

## Files Referenced

| File | Purpose |
|------|---------|
| `vite.config.js` | PWA manifest configuration (orientation setting) |
| `package/Saberloop.aab` | PWABuilder-generated Android App Bundle |
| `package/assetlinks.json` | Digital Asset Links for TWA verification |

---

## External Resources

- [PWABuilder GitHub Issue #4863](https://github.com/pwa-builder/PWABuilder/issues/4863) - Edge-to-edge warning
- [PWABuilder Android TWA Repository](https://github.com/pwa-builder/pwabuilder-android-twa)
- [Android 15 Edge-to-Edge Guide](https://droidbyme.medium.com/preparing-your-android-apps-for-android-15-target-sdk-35-798e2f0db997)
- [PWABuilder Documentation](https://docs.pwabuilder.com/#/builder/android)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-19 | Document warnings, no immediate action | Warnings don't block production; PWABuilder fix pending |
| 2025-12-19 | Keep portrait orientation | Mobile-first design; most users on phones |
| TBD | Regenerate AAB | When PWABuilder releases SDK 35 compatible version |

---

## Conclusion

The Android 15/16 warnings are **expected behavior** for TWA apps generated with current PWABuilder versions. They don't affect functionality for most users and don't block production release.

**Action:** Proceed with production release after closed testing completes. Revisit when:
1. PWABuilder releases updated templates
2. User feedback indicates display issues
3. Google requires SDK 35 targeting (expected Aug-Sep 2025)

---

**Last Updated:** 2025-12-19

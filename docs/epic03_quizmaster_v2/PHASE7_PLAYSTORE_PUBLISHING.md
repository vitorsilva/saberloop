# Phase 7: Google Play Store Publishing

## Overview

This phase covers publishing Saberloop to the Google Play Store using PWABuilder. PWAs can be packaged as Android apps using Trusted Web Activities (TWA), allowing distribution through the Play Store while maintaining all PWA benefits.

**Why Publish to Play Store?**
- **Discoverability** - Users find apps in the Play Store, not through web search
- **Credibility** - App store presence builds trust
- **Installation** - One-tap install, no browser prompts
- **Updates** - Web updates are instant (no app store review needed for content changes)

---

## Prerequisites

Before starting this phase, ensure:

- [x] **HTTPS hosting** - Saberloop deployed at https://osmeusapontamentos.com/quiz-generator/
- [x] **Valid manifest.json** with:
  - [x] App name: "Saberloop - Learn Through Quizzes"
  - [x] short_name: "Saberloop"
  - [x] Icons: 192x192 and 512x512 PNG
  - [x] start_url, display: "standalone"
  - [x] theme_color: "#FF6B35"
  - [x] background_color: "#1a1a2e"
- [x] **Service worker** for offline capability
- [ ] **Google Play Developer Account** ($25 one-time fee)

---

## Phase Structure

### 7.1 Google Play Developer Account Setup

**Time:** 30 minutes

**Steps:**
1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay the $25 registration fee (one-time)
4. Complete developer profile (name, address, etc.)
5. Wait for account approval (usually instant, can take 48 hours)

**Important Notes:**
- Use a personal or business Google account you control
- The $25 fee is non-refundable
- Account name will be visible to users

---

### 7.2 Generate Android Package with PWABuilder

**Time:** 15-30 minutes

**Steps:**

1. **Navigate to PWABuilder**
   - Go to https://www.pwabuilder.com
   - Enter your PWA URL: `https://osmeusapontamentos.com/quiz-generator/`
   - Click "Start"

2. **Review PWA Score**
   - PWABuilder analyzes your PWA
   - Review scores for manifest and service worker
   - Address any critical issues before proceeding

3. **Build Android Package**
   - Click "Build My PWA"
   - Select **Android** platform
   - Configure the following options:

**Package Configuration:**
```
Package ID:        com.saberloop.app
App name:          Saberloop
Short name:        Saberloop
Version name:      1.0.0
Version code:      1
Display mode:      Standalone
Status bar color:  #1a1a2e
Navigation bar:    #1a1a2e
```

4. **Signing Key Setup (CRITICAL)**
   - Select **"Generate new signing key"** (first release)
   - PWABuilder creates a signing key for you
   - Download the ZIP file

5. **Save the ZIP Contents**
   The ZIP contains:
   ```
   /output/
   ├── app-release-signed.apk     # For testing
   ├── app-release-signed.aab     # For Play Store upload
   ├── signing.keystore           # YOUR SIGNING KEY (CRITICAL!)
   └── signing-key-info.txt       # Key passwords and alias
   ```

**⚠️ CRITICAL: Keep the signing files safe!**
- `signing.keystore` and `signing-key-info.txt` are required for ALL future updates
- Store them securely (password manager, secure backup)
- Without these, you CANNOT update your app ever

---

### 7.3 Test APK on Android Device

**Time:** 15 minutes

**Prerequisites:**
- Android phone or tablet
- USB cable (or file transfer method)

**Steps:**

1. **Enable Developer Mode on Phone**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - You'll see "Developer mode enabled"

2. **Enable Unknown Sources**
   - Settings → Security → Unknown sources (or Apps from unknown sources)
   - Enable it for your file manager or browser

3. **Transfer and Install APK**
   - Transfer `app-release-signed.apk` to your phone
   - Open the APK file
   - Tap "Install"

4. **Test the App**
   - Open Saberloop from your app drawer
   - Test all features (quiz generation, offline, etc.)
   - **Note:** You'll see an address bar initially - this is normal and will disappear after Digital Asset Links verification

**Expected Behavior:**
- App opens in standalone mode (but with address bar)
- All features work as expected
- App icon appears correctly

---

### 7.4 Configure Digital Asset Links

Digital Asset Links prove ownership of both the website and the app, enabling true standalone mode (no address bar).

**Time:** 30 minutes

**Option A: Using Peter's Asset Link Tool (Easier)**

1. Install "Asset Link Tool" from Play Store on your test device
2. Open the tool and select your installed Saberloop APK
3. The tool generates the required JSON
4. Copy the generated JSON

**Option B: Manual Creation**

1. Find your SHA256 fingerprint in `signing-key-info.txt`
2. Create the following JSON:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.saberloop.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_FROM_SIGNING_KEY_INFO"]
  }
}]
```

**Deploy the Asset Links File:**

1. Create the directory on your VPS: `/quiz-generator/.well-known/`
2. Create file: `.well-known/assetlinks.json`
3. Paste your JSON content
4. Upload to your PHP VPS at `osmeusapontamentos.com`

**Verify Deployment:**
```
https://osmeusapontamentos.com/quiz-generator/.well-known/assetlinks.json
```

The file must be accessible at this exact path.

**Apache Configuration (if needed):**

If `.well-known` directory is not accessible, add to `.htaccess`:
```apache
<Directory ".well-known">
    Options -Indexes
    AllowOverride None
    Require all granted
</Directory>

<FilesMatch "assetlinks\.json$">
    Header set Content-Type "application/json"
    Header set Access-Control-Allow-Origin "*"
</FilesMatch>
```

Or ensure the directory is within the web root and properly served.

---

### 7.5 Prepare Play Store Listing Assets

**Time:** 1-2 hours

Before uploading to Play Store, prepare these required assets:

**Screenshots (Required):**
- **Phone screenshots:** At least 2, up to 8
  - Size: 1080x1920 (portrait) or 1920x1080 (landscape)
  - Show key features: home screen, quiz in progress, results

- **Tablet screenshots:** Optional but recommended
  - Size: 1920x1200 or similar

**Feature Graphic (Required):**
- Size: 1024x500 pixels
- Displayed at top of store listing
- Should showcase app branding

**App Icon (Required):**
- Size: 512x512 PNG
- Already have: `public/icons/icon-512x512.png`

**Text Content:**

| Field | Max Length | Content |
|-------|------------|---------|
| Title | 30 chars | Saberloop |
| Short Description | 80 chars | Learn any topic with AI-powered quizzes. Track progress and master subjects. |
| Full Description | 4000 chars | See template below |

**Full Description Template:**
```
Saberloop - The Fun Way to Learn Through Quizzes

📚 LEARN ANY TOPIC
Generate quizzes on any subject - from math and science to history and languages. Our AI creates personalized questions tailored to your learning level.

🎯 TRACK YOUR PROGRESS
See your quiz history, track scores, and watch your knowledge grow over time.

📱 WORKS OFFLINE
Study anywhere, even without internet. Your quizzes and progress are saved locally.

✨ KEY FEATURES
• AI-powered question generation
• Multiple difficulty levels
• Instant explanations for wrong answers
• Progress tracking and history
• Works offline
• No ads or tracking

🎓 PERFECT FOR
• Students preparing for exams
• Parents helping kids learn
• Anyone wanting to test their knowledge
• Self-directed learners

Built with privacy in mind - no tracking, no ads, no data collection.

Download now and start learning!
```

---

### 7.6 Submit to Google Play Store

**Time:** 30-60 minutes

**Steps:**

1. **Create App in Play Console**
   - Go to [Play Console](https://play.google.com/console)
   - Click "Create app"
   - Fill in:
     - App name: Saberloop
     - Default language: English
     - App or game: App
     - Free or paid: Free

2. **Complete Store Listing**
   - Upload all screenshots and graphics
   - Enter title, descriptions
   - Select category: Education
   - Add contact email

3. **Complete Content Rating**
   - Answer the IARC questionnaire
   - Saberloop should qualify for "Everyone" rating

4. **Set Up Pricing & Distribution**
   - Select: Free
   - Choose countries for distribution

5. **Upload AAB File**
   - Go to Release → Production → Create new release
   - Upload `app-release-signed.aab`

   **About Play App Signing:**
   - Google recommends using Play App Signing
   - If you use it, you'll need to add Google's signing key to your `assetlinks.json`
   - Alternatively, opt out to use only your key (simpler)

6. **Review and Submit**
   - Review all information
   - Click "Start rollout to Production"
   - App goes into review queue

**Review Timeline:**
- First submission: Usually 1-7 days
- Updates: Usually 1-3 days
- May take longer if flagged for manual review

---

### 7.7 Post-Publication: Digital Asset Links Update

**Important:** If you used Play App Signing, Google signs your app with their key. You'll need to:

1. Go to Play Console → Release → Setup → App integrity
2. Find the SHA256 fingerprint under "App signing key certificate"
3. Add this fingerprint to your `assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.saberloop.app",
    "sha256_cert_fingerprints": [
      "YOUR_UPLOAD_KEY_FINGERPRINT",
      "GOOGLE_PLAY_SIGNING_KEY_FINGERPRINT"
    ]
  }
}]
```

4. Upload updated `assetlinks.json` to your VPS
5. The address bar will disappear within hours once Google verifies

---

## Updating Your App

### Web Content Updates (Instant)
Changes to your PWA (UI, features, bug fixes) are **instant** - users get updates automatically when they open the app. No Play Store review needed!

### Play Store Metadata Updates
To update screenshots, description, or app info:
1. Go to Play Console
2. Make changes
3. Submit for review

### APK/AAB Updates (Version Bumps)
Only needed for:
- Android-specific changes
- Major version announcements
- Minimum SDK requirements changes

**To update the app package:**

1. Go to PWABuilder
2. In Signing key section, select **"Use mine"**
3. Upload your `signing.keystore` file
4. Enter credentials from `signing-key-info.txt`:
   - Key alias
   - Key password
   - Keystore password
5. **Increment version code** (e.g., 1 → 2)
6. Generate new AAB
7. Upload to Play Console

---

## Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| Google Play Developer Account | $25 | One-time |
| PWABuilder | Free | - |
| PHP VPS Hosting | Already covered | (existing VPS) |
| **Total to Start** | **$25** | **One-time** |

---

## Checklist

### Pre-Submission
- [ ] Google Play Developer account created and approved
- [ ] PWABuilder package generated
- [ ] APK tested on Android device
- [ ] Signing files backed up securely
- [ ] assetlinks.json deployed and accessible

### Store Listing
- [ ] App icon (512x512)
- [ ] Phone screenshots (2-8)
- [ ] Feature graphic (1024x500)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Category selected (Education)
- [ ] Content rating completed

### Submission
- [ ] AAB file uploaded
- [ ] Pricing set (Free)
- [ ] Countries selected
- [ ] App submitted for review

### Post-Publication
- [ ] App approved and live
- [ ] assetlinks.json updated with Play signing key (if applicable)
- [ ] Address bar removed (TWA verified)
- [ ] Test installation from Play Store

---

## Troubleshooting

### Address Bar Won't Disappear
- Verify `assetlinks.json` is accessible at `/.well-known/assetlinks.json`
- Check SHA256 fingerprint matches (both upload and Play signing keys if applicable)
- Wait 24-48 hours for Google verification
- Clear app data and reinstall

### App Rejected
Common reasons:
- Missing privacy policy (required for apps collecting any data)
- Screenshots show incorrect content
- Description doesn't match app functionality
- Metadata policy violations

### PWABuilder Issues
- Ensure manifest.json is valid (use PWABuilder's validator)
- Check service worker is registered correctly
- Verify HTTPS is working

---

## Success Criteria

- [ ] Saberloop listed on Google Play Store
- [ ] App installs successfully from Play Store
- [ ] No address bar (TWA verification complete)
- [ ] All features work in Android app
- [ ] At least "Everyone" content rating
- [ ] Signing files securely stored for future updates

---

## Future Enhancements

### Phase 7.5: Apple App Store (Optional)
PWABuilder also supports iOS packaging, though with more limitations:
- Requires Apple Developer account ($99/year)
- Uses Web Clips or PWA wrapper
- iOS PWA limitations apply

### AdMob Integration (Optional)
If monetization is desired:
- Create AdMob account
- Integrate AdMob SDK
- Update privacy policy
- Consider user experience impact

---

## References

- [PWABuilder Documentation](https://docs.pwabuilder.com/)
- [Trusted Web Activities Overview](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Digital Asset Links](https://developers.google.com/digital-asset-links/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [David Rousset's PWABuilder Guide](https://www.davrous.com/2020/02/07/publishing-your-pwa-in-the-play-store-in-a-couple-of-minutes-using-pwa-builder/)

---

**Ready to publish Saberloop to Google Play Store? Start with Section 7.1!**

# Phase 3.5: Branding & Identity

**Epic:** 3 - QuizMaster V2
**Status:** Not Started
**Estimated Time:** 2-3 sessions
**Prerequisites:** Phase 3 (UI Polish) complete

---

## Overview

Phase 3.5 transforms QuizMaster from a demo project into a branded product with its own identity. You'll brainstorm and choose a final app name, design visual identity (icons, colors), and remove all "demo-pwa-app" references from the codebase. Optionally, you'll create a landing page to showcase the app.

**What you'll build:**
- Final app name (brainstorming session)
- App icon design (192x192, 512x512)
- Visual identity (color scheme, theme)
- Updated branding throughout codebase
- Optional: Landing page

**Why this matters:**
- Professional identity before production launch
- Memorable name for users
- Visual appeal and recognition
- Clean break from "learning project" branding
- Marketing foundation

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Brainstorm product names systematically
- ✅ Evaluate names (memorability, availability, meaning)
- ✅ Design or generate app icons
- ✅ Update PWA manifest with branding
- ✅ Search and replace branding across codebase
- ✅ Consider landing page design
- ✅ Think like a product marketer
- ✅ Balance creativity with practicality

---

## Current State vs Target State

### Current State (Epic 02)

**App Name:**
- `demo-pwa-app` (repository name)
- "QuizMaster" (working title)
- Mixed references throughout code

**Visual Identity:**
- Generic PWA icons (placeholder)
- Default color scheme
- No cohesive branding

**Documentation:**
- References to "demo-pwa-app" everywhere
- Learning-focused language

### Target State (Epic 03 Phase 3.5)

**App Name:**
- Final product name chosen
- Consistent across all files
- Manifest, package.json, README updated

**Visual Identity:**
- Custom app icon (designed or AI-generated)
- Defined color palette
- Consistent theme

**Documentation:**
- All references updated to final name
- Product-focused language
- Optional landing page

---

## Implementation Steps

### Part 1: Name Brainstorming

#### Step 1: Define Naming Criteria

**Before brainstorming, establish criteria:**

1. **Memorable:** Easy to remember and spell
2. **Descriptive:** Hints at what the app does
3. **Available:** Domain name available (check namecheap.com)
4. **Unique:** Not conflicting with existing apps
5. **Positive:** Good connotations
6. **Short:** Ideally 2-3 syllables
7. **International:** Works across languages

**Questions to consider:**
- Who is the target audience? (Students, families, lifelong learners?)
- What's the core value proposition? (AI quizzes, learning, knowledge testing?)
- What tone? (Serious, playful, academic, friendly?)
- Any words to avoid? (Overused: "smart", "genius", "IQ")

---

#### Step 2: Brainstorming Categories

**Category A: Descriptive Names**
- QuizMaster (current)
- QuizCraft
- QuizForge
- StudyBot
- QuizAI
- TestMaker

**Category B: Learning-Focused**
- MindSpark
- BrainBurst
- LearnLoop
- KnowledgeQuest
- CurioTest
- WisdomWorks

**Category C: Playful/Friendly**
- Quizzy
- QuizPal
- SmartQuiz
- QuizGenie
- BrainyApp
- QuizWhiz

**Category D: Abstract/Unique**
- Astra (knowledge as stars)
- Lumina (illuminate knowledge)
- Nexus (connecting ideas)
- Elara (Greek: sparkling)
- Cognito (cognition + incognito)

**Category E: Compound Words**
- QuizFlow
- MindTest
- LearnQuest
- BrainCheck
- SmartStudy

**Category F: Made-Up Words**
- Quizzify
- Learnova
- Quizora
- Studify
- Testivo

---

#### Step 3: Evaluation Matrix

**For each candidate name, score 1-5:**

| Name | Memorable | Descriptive | Available | Unique | Positive | Short | Total |
|------|-----------|-------------|-----------|--------|----------|-------|-------|
| QuizMaster | 4 | 5 | ? | 3 | 4 | 4 | 20/30 |
| MindSpark | 5 | 4 | ? | 5 | 5 | 4 | 23/30 |
| ... | ... | ... | ... | ... | ... | ... | ... |

**Check domain availability:**
```bash
# Use whois or check online
# Example: https://www.namecheap.com/domains/registration/results/?domain=mindsparkapp.com
```

**Questions for Claude:**
- "What does this name evoke for you?"
- "Any negative connotations?"
- "How would you pronounce it?"

---

#### Step 4: Final Decision

**Make the call:**
- Review top 3 candidates
- Check domain + app store availability
- Get feedback from family/friends (30-second test: "Would you use an app called X?")
- Sleep on it (seriously, wait a day)
- Commit to the name

**Document the choice:**
```markdown
# Final App Name: [YOUR CHOICE]

**Reasoning:**
- [Why this name fits the criteria]

**Alternatives considered:**
- [List top alternatives and why they were rejected]

**Domain:** [Available/Purchased/Not needed]
**Trademark check:** [Basic search done - no conflicts]
```

---

### Part 2: Visual Identity

#### Step 5: Design App Icon

**Option A: Design Yourself**

**Tools:**
- Figma (free, online)
- Canva (templates available)
- GIMP (free, desktop)
- Inkscape (free, vector graphics)

**Icon Requirements:**
- 192x192 pixels (minimum)
- 512x512 pixels (high-res)
- Square with rounded corners (optional)
- Works at small sizes (recognizable as 48x48)
- Transparent or solid background

**Design Principles:**
- **Simple:** Readable at small sizes
- **Iconic:** One clear symbol (brain, lightbulb, book, question mark)
- **Colorful:** 2-3 colors max
- **Unique:** Not generic app icon

**Example concepts:**
- **Brain + Lightbulb:** Learning + ideas
- **Question mark in speech bubble:** Quiz conversation
- **Book with sparkles:** Magical learning
- **Lightning bolt + checkmark:** Fast correct answers
- **Owl:** Wisdom symbol (friendly)

---

**Option B: AI-Generated Icon**

**Use AI image generators:**
- DALL-E (via ChatGPT Plus)
- Midjourney (requires Discord)
- Stable Diffusion (free, local)
- Bing Image Creator (free)

**Prompt template:**
```
"App icon for [APP NAME], a quiz and learning application.
Clean, minimalist design with [SYMBOL: brain/lightbulb/book].
Gradient colors: [COLOR 1] to [COLOR 2].
Rounded square background.
Modern, friendly, professional style.
Vector-style illustration."
```

**Example prompt:**
```
"App icon for MindSpark, a quiz application.
Clean minimalist design with a glowing lightbulb and brain symbol.
Gradient colors: electric blue to purple.
Rounded square background.
Modern, friendly, professional style.
Vector-style illustration."
```

**After generation:**
- Upscale to 512x512
- Create 192x192 version (resize in Photopea or similar)
- Save as PNG with transparency (if applicable)

---

**Option C: Icon Generator Tools**

**Online icon generators:**
- https://icon.kitchen/ (PWA icon generator)
- https://realfavicongenerator.net/ (all sizes)
- https://www.favicon-generator.org/

**Process:**
1. Upload base image or emoji
2. Customize background color
3. Add text (optional)
4. Generate all required sizes
5. Download zip file

---

#### Step 6: Choose Color Scheme

**Define primary colors:**
- **Primary:** Main brand color (e.g., #4F46E5 - Indigo)
- **Secondary:** Accent color (e.g., #10B981 - Green for correct answers)
- **Error:** Error state (e.g., #EF4444 - Red for wrong answers)
- **Background:** Base color (e.g., #F9FAFB - Light gray)

**Color palette tools:**
- https://coolors.co/ (generator)
- https://paletton.com/ (color theory)
- https://mycolor.space/ (gradients)

**Accessibility check:**
- Contrast ratio: 4.5:1 for normal text (WCAG AA)
- Test with WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

**Apply colors:**
```css
/* Update styles.css or create theme.css */
:root {
  --color-primary: #4F46E5;
  --color-secondary: #10B981;
  --color-error: #EF4444;
  --color-success: #10B981;
  --color-background: #F9FAFB;
  --color-text: #1F2937;
}
```

---

#### Step 7: Update Manifest

**File:** `public/manifest.json`

**Update fields:**
```json
{
  "name": "[FINAL APP NAME]",
  "short_name": "[SHORT NAME]",
  "description": "AI-powered quiz application for learning any topic",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F9FAFB",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Replace icon files:**
```bash
# Save new icons as:
# public/icons/icon-192x192.png
# public/icons/icon-512x512.png
```

---

### Part 3: Remove Old Branding

#### Step 8: Search and Replace

**Find all "demo-pwa-app" references:**

**Search locations:**
1. `package.json` → `name` field
2. `manifest.json` → `name` and `short_name`
3. `README.md` → repository name references
4. `CLAUDE.md` → project overview
5. `index.html` → `<title>` tag
6. `vite.config.js` → build output names (if any)
7. `netlify.toml` → site name (if any)
8. Any learning notes that reference the old name

**Example changes:**

**Before (package.json):**
```json
{
  "name": "demo-pwa-app",
  "version": "2.0.0",
  "description": "Learning PWA project"
}
```

**After (package.json):**
```json
{
  "name": "mindsparkapp",
  "version": "2.0.0",
  "description": "AI-powered quiz application for learning"
}
```

**Before (index.html):**
```html
<title>QuizMaster - Demo PWA</title>
```

**After (index.html):**
```html
<title>MindSpark - Learn Through AI Quizzes</title>
```

---

#### Step 9: Update Documentation

**Update CLAUDE.md:**
- Change project overview description
- Update repository URL references (if renaming GitHub repo)
- Shift tone from "learning project" to "product"

**Update README.md (preview for Phase 5):**
- Use final app name in title
- Update description
- Update screenshots (will do in Phase 5)

**Keep learning documentation intact:**
- Epic 01, 02, 03 learning notes stay as-is
- They document the journey (historical record)
- Only update if the old name causes confusion

---

### Part 4: Landing Page (Optional)

#### Step 10: Design Landing Page Concept

**Purpose:**
- Introduce the app to new users
- Explain features and benefits
- Encourage installation
- Build credibility

**Landing page options:**

**Option A: Separate Landing Page**
- Hosted on GitHub Pages (separate branch or repo)
- Domain: `mindsparkapp.com` → Landing page
- Domain: `app.mindsparkapp.com` → Actual app
- Pros: Marketing-focused, separate from app
- Cons: Extra hosting setup

**Option B: App Home as Landing (No Auth)**
- Landing view at `/` (before any quiz creation)
- Install prompt prominent
- "Get Started" leads to topic input
- Pros: Simple, one deployment
- Cons: Mixed purpose (marketing + app)

**Option C: GitHub Pages Splash**
- Simple single-page site on GitHub Pages
- "Try the App" button → netlify app
- Pros: Free, easy to maintain
- Cons: Another URL to manage

---

#### Step 11: Landing Page Content (If Building)

**Recommended sections:**

**Hero:**
```html
<h1>[APP NAME]</h1>
<p>Learn anything with AI-generated quizzes</p>
<button>Get Started</button>
```

**Features (3-4 key points):**
- 🤖 AI-Generated Questions - Powered by Claude
- 📱 Works Offline - Progressive Web App
- 📊 Track Progress - See your improvement
- 🎯 Any Topic - From history to coding

**How It Works (3 steps):**
1. Enter a topic you want to learn
2. Answer AI-generated questions
3. Review explanations and improve

**Screenshots:**
- Home page
- Quiz in progress
- Results page
- Settings page

**Call to Action:**
- Install the app button
- GitHub link (optional, for open-source)
- Privacy statement ("No tracking, all local")

**Footer:**
- About
- Privacy Policy (basic)
- Contact/Feedback
- Built with Claude Code

---

#### Step 12: Simple Landing Page Template (Optional)

**File:** `landing.html` (separate from app)

**Minimal template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[APP NAME] - Learn with AI Quizzes</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      text-align: center;
    }
    .hero {
      padding: 4rem 1rem;
    }
    h1 {
      font-size: 3rem;
      margin: 0;
    }
    .tagline {
      font-size: 1.5rem;
      margin: 1rem 0 2rem;
      opacity: 0.9;
    }
    .cta {
      background: white;
      color: #4F46E5;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .features {
      background: white;
      color: #1F2937;
      padding: 4rem 1rem;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 2rem auto;
    }
    .feature {
      padding: 1.5rem;
    }
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <section class="hero">
    <h1>[APP NAME]</h1>
    <p class="tagline">Learn anything with AI-generated quizzes</p>
    <a href="./index.html" class="cta">Get Started</a>
  </section>

  <section class="features">
    <h2>Why [APP NAME]?</h2>
    <div class="feature-grid">
      <div class="feature">
        <div class="feature-icon">🤖</div>
        <h3>AI-Powered</h3>
        <p>Questions generated by Claude AI</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📱</div>
        <h3>Works Offline</h3>
        <p>Progressive Web App technology</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📊</div>
        <h3>Track Progress</h3>
        <p>See your improvement over time</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎯</div>
        <h3>Any Topic</h3>
        <p>From history to coding</p>
      </div>
    </div>
  </section>

  <footer style="padding: 2rem; background: #1F2937;">
    <p>Built with Claude Code | <a href="https://github.com/vitorsilva/demo-pwa-app" style="color: white;">GitHub</a></p>
  </footer>
</body>
</html>
```

**Decision:** Landing page is optional for MVP. Can be added post-launch.

---

## Success Criteria

### Phase 3.5 Complete When:

**Branding:**
- ✅ Final app name chosen and documented
- ✅ Name evaluation matrix completed
- ✅ Domain availability checked

**Visual Identity:**
- ✅ App icon designed (192x192, 512x512)
- ✅ Color scheme defined
- ✅ Icons saved in `public/icons/`
- ✅ Manifest updated with new name and icons

**Codebase Cleanup:**
- ✅ All "demo-pwa-app" references replaced
- ✅ `package.json` name updated
- ✅ `index.html` title updated
- ✅ `manifest.json` name updated
- ✅ CLAUDE.md reflects new branding
- ✅ No stale references remain

**Optional:**
- ✅ Landing page designed (or decided to skip)
- ✅ Screenshots captured for marketing

**Validation:**
- ✅ App builds successfully with new name
- ✅ PWA installs with new icon
- ✅ No broken references or 404s
- ✅ Visual identity feels cohesive

---

## Testing Checklist

### Visual Testing

**Test PWA icon:**
1. Build production app: `npm run build`
2. Serve locally: `npm run preview`
3. Open DevTools → Application → Manifest
4. Verify icon paths are correct
5. Install app to home screen (mobile/desktop)
6. Check icon appears correctly

**Test branding consistency:**
1. Check app title in browser tab
2. Check installed app name
3. Check manifest name vs short_name
4. Check splash screen (mobile PWA)

### Code Testing

**Search for old references:**
```bash
# Search entire codebase
grep -r "demo-pwa-app" .
grep -r "Demo PWA" .

# Should return no results (except in git history)
```

**Validate manifest:**
```bash
# Use Chrome DevTools
# Application → Manifest → "Add to Home Screen"
# Should show new name and icon
```

---

## Common Pitfalls

### Pitfall 1: Choosing a Name Too Quickly
**Problem:** Pick first name without evaluation
**Solution:** Use evaluation matrix, sleep on it, get feedback

### Pitfall 2: Icon Not Readable at Small Sizes
**Problem:** Complex icon looks blurry at 48x48
**Solution:** Test icon at multiple sizes before finalizing

### Pitfall 3: Missing References
**Problem:** Old "demo-pwa-app" name remains in code
**Solution:** Use grep/search to find all occurrences

### Pitfall 4: Icon Cache Issues
**Problem:** Old icon still shows after update
**Solution:** Clear browser cache, uninstall/reinstall PWA

### Pitfall 5: Overdesigning Landing Page
**Problem:** Spend too much time on landing page
**Solution:** Landing page is optional for MVP, defer if needed

---

## Questions to Reinforce Learning

**Q1: Why does branding matter for a learning project?**
<details>
<summary>Answer</summary>
Branding transforms a project from "demo" to "product." It creates identity, professionalism, and user confidence. Even for personal projects, good branding makes it feel real and polished.
</details>

**Q2: What makes a good app icon?**
<details>
<summary>Answer</summary>
Simple, recognizable at small sizes, distinct colors, memorable symbol, works in different contexts (light/dark backgrounds).
</details>

**Q3: Why update manifest.json during branding?**
<details>
<summary>Answer</summary>
Manifest defines how the PWA appears when installed (name, icon, colors). It's the primary branding touchpoint for installed apps.
</details>

**Q4: Should you rename the GitHub repository?**
<details>
<summary>Answer</summary>
Optional. Renaming breaks existing links and requires updating deployment URLs. Better to leave repo name as-is and update app branding only.
</details>

**Q5: When should you create a landing page?**
<details>
<summary>Answer</summary>
After MVP validation. If users love the app, invest in landing page. If still iterating, defer to save time.
</details>

---

## Documentation to Update

**During Phase 3.5:**
- ✅ `manifest.json` (name, short_name, icons)
- ✅ `package.json` (name, description)
- ✅ `index.html` (title tag)
- ✅ `CLAUDE.md` (project overview)
- ✅ Branding decision document (record rationale)

**In Phase 5 (Project Structure):**
- ✅ `README.md` (new product-focused README)
- ✅ `CONTRIBUTING.md` (references to app name)
- ✅ Screenshots (capture with new branding)

---

## Next Steps

After completing Phase 3.5, you'll have:
- ✅ Professional app name and identity
- ✅ Custom icon and visual branding
- ✅ Clean codebase (no "demo" references)
- ✅ Foundation for Phase 5 documentation

**Ready to move to Phase 4 (Observability)?** Say:
- **"Phase 3.5 done, what's next?"**
- **"Let's start Phase 4"**

Or continue refining branding if needed.

---

## Resources

**Name Brainstorming:**
- [Namelix](https://namelix.com/) - AI name generator
- [Namecheap](https://www.namecheap.com/) - Domain search
- [Behind the Name](https://www.behindthename.com/) - Name meanings

**Icon Design:**
- [Figma](https://www.figma.com/) - Design tool
- [Icon Kitchen](https://icon.kitchen/) - PWA icon generator
- [Flaticon](https://www.flaticon.com/) - Icon inspiration

**Color Schemes:**
- [Coolors](https://coolors.co/) - Color palette generator
- [Adobe Color](https://color.adobe.com/) - Color wheel
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility

**Landing Pages:**
- [Carrd](https://carrd.co/) - Simple landing page builder
- [Tailwind UI](https://tailwindui.com/components/marketing) - Templates

---

**Remember:** Branding is creative but also strategic. Choose a name you'll be proud to share with users. Make it memorable, make it yours.

🎨 **Ready to brand your app?**

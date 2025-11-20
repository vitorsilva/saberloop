# Parking Lot - Ideas to Explore

This folder contains **optional and experimental phases** that are interesting to explore but not required for the core QuizMaster V2 functionality.

---

## What is the Parking Lot?

The "parking lot" is a place to document ideas, experimental features, and optional enhancements that:
- ✅ Are well-defined and documented
- ✅ Could be implemented in the future
- ⚠️ Are not critical for core functionality
- ⚠️ May have uncertain feasibility
- ⚠️ Add significant complexity

**Think of this as:** "Nice to have" features we might revisit when relevant.

---

## Current Ideas

### [Phase 7: Azure Functions Migration](./PHASE7_AZURE_MIGRATION.md) ⭐ **Optional**

**Status:** Ready to implement (if desired)

**What it is:**
- Migrate serverless backend from Netlify Functions to Azure Functions
- Dual backend support (switch between Netlify/Azure via config)
- Application Insights monitoring

**Why it's optional:**
- ✅ Netlify Functions work perfectly (free tier: 125K requests/month)
- ✅ Current setup is simple and reliable
- ⚠️ Azure adds complexity without critical benefits

**Why you might want it:**
- 🎓 Learn Azure cloud platform
- 📈 Higher free tier (1M requests/month vs 125K)
- 🏢 Enterprise features (VNet, Azure AD, etc.)
- 💼 Resume value (Azure experience)
- 🔄 Platform portability

**When to revisit:**
- You want Azure experience
- Need higher request limits
- Building enterprise features

---

### [Phase 8: OAuth Integration](./PHASE8_OAUTH.md) ⭐ **Optional/Experimental**

**Status:** Experimental - OAuth availability unconfirmed

**What it is:**
- OAuth 2.0 authentication flow with Claude API
- PKCE implementation for security
- Token storage in IndexedDB
- Automatic token refresh logic

**Why it's optional:**
- ✅ API keys work perfectly (simpler)
- ⚠️ OAuth may not be publicly available yet
- ⚠️ Significantly more complex
- ⚠️ Requires backend token handling

**Why you might want it:**
- 🎓 Learn industry-standard OAuth patterns
- 🔒 More secure than storing API keys
- 👥 Foundation for multi-user support
- 🔄 Automatic token rotation
- 💼 Enterprise authentication experience

**When to revisit:**
- Anthropic announces public OAuth support
- Building multi-user features
- Want to eliminate static API keys

---

## How to Use This Folder

### If You're Planning Epic 3

1. **Focus on core phases first** (Phases 1-6 in Epic 3)
2. **Skip the parking lot** initially
3. **Return here** if you want extra challenges

### If You Want to Implement an Idea

1. **Read the phase document** thoroughly
2. **Verify prerequisites** are met (e.g., OAuth availability)
3. **Follow the implementation guide** in the phase doc
4. **Update Epic 3 plan** if you decide to include it

### If You Have a New Idea

1. **Document it** in a new markdown file here
2. **Explain why it's optional** (complexity, uncertainty, etc.)
3. **Provide implementation outline** (like existing phases)
4. **Update this README** to list the new idea

---

## Decision Framework

**Ask yourself:**

1. **Is it critical?** → No (otherwise it wouldn't be in parking lot)
2. **Do I want to learn this?** → Your choice!
3. **Does it add value?** → Depends on your goals
4. **Is it feasible right now?** → Check prerequisites

**If unsure:** Skip it! You can always come back later.

---

## Parking Lot vs Future Epics

**Parking Lot (this folder):**
- Optional enhancements to **Epic 3**
- Can be done anytime (before or after Epic 4)
- Well-defined, ready to implement
- Not blocking anything

**Future Epics (e.g., Epic 4, Epic 5):**
- Major new features (spaced repetition, multi-user, etc.)
- Build on completed Epic 3
- Significant scope (multiple phases)
- Planned roadmap

---

## Contributing Ideas

If you have ideas for optional features:

1. Create a phase document (like `PHASE7_AZURE_MIGRATION.md`)
2. Use this structure:
   - Overview
   - Why it's optional
   - Learning objectives
   - Implementation steps
   - Success criteria
   - Decision matrix
3. Add it to this README
4. Link from Epic 3 plan if relevant

---

## Summary

**The parking lot is for:**
- 🅿️ Ideas that are **interesting but not essential**
- 🅿️ Features that **might be revisited later**
- 🅿️ Experiments that **depend on external factors**

**Current count:** 2 ideas (Azure Functions, OAuth)

**Status:** Both documented and ready to implement when desired

---

**Last Updated:** 2025-11-20
**Location:** `docs/parking_lot/`
**Related:** [Epic 3 Plan](../epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md)

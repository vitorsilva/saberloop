# QuizMaster V1 - Complete Learning Plan

## Overview

This learning plan builds on your PWA fundamentals to create **QuizMaster V1** - an AI-powered quiz application that generates personalized questions using the Anthropic Claude API. You'll learn to build a real-world Single Page Application (SPA) with local data persistence, external API integration, and advanced JavaScript patterns.

**Project Goal**: Build a fully functional quiz app where users can:
- Enter any topic and get AI-generated questions
- Answer questions and receive immediate feedback
- Track their learning progress over time
- Use the app offline to review past sessions

---

## What You'll Learn

### New Technologies & Concepts

1. **IndexedDB** - Browser's powerful NoSQL database for structured data storage
2. **ES6 Modules** - Modern code organization with import/export
3. **Fetch API** - Making HTTP requests to external APIs
4. **Anthropic Claude API** - AI integration for content generation
5. **Single Page Application (SPA)** - Multi-view apps without page reloads
6. **Client-Side Routing** - Navigation using hash-based routing
7. **State Management** - Managing application state in vanilla JS
8. **Dynamic UI Rendering** - Building interfaces from data
9. **Error Handling** - Gracefully handling API failures and edge cases
10. **Prompt Engineering** - Crafting effective AI prompts for quality output
11. **Serverless Functions** - Building a simple backend for API proxying

---

## Phase Structure

### **Phase 1: Understanding the Architecture** ✅ (2-3 sessions)
Review the V1 specification, understand data flow, and plan the file structure using ES6 modules.

📄 [PHASE1_ARCHITECTURE.md](./PHASE1_ARCHITECTURE.md)

---

### **Phase 2: IndexedDB Fundamentals** ✅ (2-3 sessions)
Learn browser-based structured data storage. Understand databases, object stores, transactions, and CRUD operations.

📄 [PHASE2_INDEXEDDB.md](./PHASE2_INDEXEDDB.md)

---

### **Phase 3: API Integration with Anthropic Claude** ✅ (2-3 sessions)
Master external API integration. Learn the Fetch API, async/await patterns, and build mock API for development.

📄 [PHASE3_API_INTEGRATION.md](./PHASE3_API_INTEGRATION.md)

**Note**: Phase 3 uses mock API due to CORS restrictions. Real API integration happens in Phase 11.

---

### **Phase 4: ES6 Modules and Code Organization** (1-2 sessions)
Learn module patterns, imports/exports, and organize code into a clean architecture.

📄 [PHASE4_MODULES.md](./PHASE4_MODULES.md)

---

### **Phase 5: Building the Single Page Application** (3-4 sessions)
Create a multi-screen app without page reloads. Implement routing, state management, and dynamic rendering.

📄 [PHASE5_SPA.md](./PHASE5_SPA.md)

---

### **Phase 6: Implementing Core Features** (4-5 sessions)
Build the actual functionality: home screen, topic input, question generation, answer handling, results, and history.

📄 [PHASE6_FEATURES.md](./PHASE6_FEATURES.md)

---

### **Phase 7: PWA Integration** (1 session) ⚡ *Streamlined*
Adapt the PWA knowledge from Epic 01 to QuizMaster's SPA architecture. Focus on SPA-specific challenges only.

📄 [PHASE7_PWA.md](./PHASE7_PWA.md)

**Prerequisites from Epic 01**: Service workers, manifests, caching strategies already mastered

---

### **Phase 8: Testing QuizMaster Features** (1-2 sessions) ⚡ *Streamlined*
Write tests for QuizMaster features using existing test infrastructure. Focus on QuizMaster-specific testing, not setup.

📄 [PHASE8_TESTING.md](./PHASE8_TESTING.md)

**Prerequisites from Epic 01**: Vitest and Playwright setup already complete

---

### **Phase 9: Deployment** (30 minutes) ⚡ *Streamlined*
Quick deployment verification using existing GitHub Actions workflow.

📄 [PHASE9_DEPLOYMENT.md](./PHASE9_DEPLOYMENT.md)

**Prerequisites from Epic 01**: GitHub Actions CI/CD pipeline already configured

---

### **Phase 10: Validation and Learning Review** (Ongoing)
Run the beta test, gather feedback, iterate, and reflect on what you've learned.

📄 [PHASE10_VALIDATION.md](./PHASE10_VALIDATION.md)

---

### **Phase 11: Backend Integration** (2-3 sessions)
Build a serverless backend to enable real Claude API integration, bypassing CORS restrictions.

📄 [PHASE11_BACKEND.md](./PHASE11_BACKEND.md)

**Bonus Section 11.X**: Full-stack CI/CD pipeline combining Epic 01 and Epic 02 deployment knowledge

**Note**: This phase can be done after Phase 10 or integrated earlier if desired.

---

## Prerequisites

Before starting, you should have completed:
- ✅ **Epic 01: PWA Infrastructure** (All phases complete)
  - PWA fundamentals, service workers, build tools
  - Vitest unit testing, Playwright E2E testing
  - GitHub Actions CI/CD, deployment
- ✅ Understanding of HTML, CSS, JavaScript ES6+
- ✅ Comfortable with async/await patterns
- ✅ Git and command line basics

**Epic 02 builds on Epic 01** - many concepts are referenced rather than re-taught!

---

## Success Criteria

By the end of this learning journey, you will have:

✅ **Built QuizMaster V1** - A fully functional AI-powered quiz app
✅ **Mastered IndexedDB** - Store and query structured data in the browser
✅ **Integrated External APIs** - Work with Anthropic's Claude API via backend
✅ **Created a SPA** - Multi-screen app with routing and state management
✅ **Organized Code with Modules** - Clean, maintainable codebase structure
✅ **Adapted PWA Features** - Offline support for SPA architecture
✅ **Built a Serverless Backend** - Proxy API calls securely
✅ **Deployed Full-Stack App** - Frontend + backend with CI/CD
✅ **Validated with Users** - Real feedback from your family

---

## Estimated Timeline

**Time Savings from Epic 01**: ~5-7 sessions saved!

Phases 7, 8, and 9 are streamlined because you already learned the fundamentals in Epic 01.

**Total: ~13-17 learning sessions** (at your own pace)

| Phase | Sessions | Focus | Notes |
|-------|----------|-------|-------|
| Phase 1 | 2-3 | Architecture & Planning | New content |
| Phase 2 | 2-3 | IndexedDB Learning | New content |
| Phase 3 | 2-3 | API Integration (Mock) | New content |
| Phase 4 | 1-2 | ES6 Modules | New content |
| Phase 5 | 3-4 | SPA Foundation | New content |
| Phase 6 | 4-5 | Feature Implementation | New content |
| Phase 7 | **1** | PWA Adaptation | ⚡ Streamlined (was 1-2) |
| Phase 8 | **1-2** | Testing Features | ⚡ Streamlined (setup done) |
| Phase 9 | **0.5** | Quick Deploy | ⚡ Streamlined (was 1) |
| Phase 10 | Ongoing | User Validation | Beta testing |
| Phase 11 | 2-3 | Backend + CI/CD | Backend + bonus CI/CD |

**Phases 7-9 streamlined**: Leveraging Epic 01 knowledge saves ~4-5 sessions!

---

## Teaching Methodology

This learning plan follows the same **instructor-guided approach** as the original PWA learning:

**Claude's Role:**
- ✅ Explain concepts before showing code
- ✅ Provide commands/code as text for you to implement
- ✅ Wait for your confirmation after each step
- ✅ Ask questions to reinforce learning
- ✅ Break tasks into small, manageable steps
- ✅ Use read-only tools to understand the codebase

**Your Role:**
- ✅ Type all code yourself
- ✅ Run all commands
- ✅ Ask questions when unclear
- ✅ Confirm completion of each step
- ✅ Experiment and explore

**What Claude Will NOT Do:**
- ❌ Write or edit files automatically
- ❌ Run bash commands (except read-only when needed)
- ❌ Execute npm/build commands
- ❌ Make git commits
- ❌ Install packages

---

## V1 Feature Scope

### ✅ Included in V1

1. **Topic Input** - Enter any subject to practice
2. **AI Question Generation** - 5 multiple-choice questions via Claude API
3. **Interactive Quiz** - Answer questions with immediate feedback
4. **Results Summary** - Score display with color-coded performance
5. **Explanations** - AI-generated explanations for incorrect answers
6. **Session History** - Local storage of past quizzes and scores
7. **Progress Tracking** - View topics practiced and performance trends
8. **Settings** - API key configuration
9. **PWA Features** - Installable, offline history viewing
10. **Mobile-First Design** - Pre-built Tailwind CSS mockups
11. **Serverless Backend** - Secure API integration

### ❌ Deferred to V2

- Photo upload from textbooks
- Spaced repetition scheduling
- Multiple question types (only multiple-choice in V1)
- User profiles/multiple users
- Social features/sharing
- Advanced analytics
- Push notifications

---

## Development Approach

### Phases 1-10: Build with Mock API
- Develop full UI/UX using mock data
- Test all features without backend dependency
- Deploy frontend-only version

### Phase 11: Add Real API
- Build serverless backend
- Swap mock API for real integration
- Deploy full-stack version

**Why this approach?**
- ✅ Learn frontend concepts without backend complexity
- ✅ Develop faster without API costs
- ✅ Create stable test infrastructure
- ✅ Understand full-stack architecture incrementally

---

## Getting Help

If you get stuck during any phase:

1. **Ask Claude** - Explain what you're confused about
2. **Review Previous Phases** - Concepts build on each other
3. **Check Phase Notes** - Each phase has detailed learning notes
4. **Experiment** - Try things in the browser console
5. **Take Breaks** - Complex topics need time to absorb

---

## Ready to Start?

When you're ready to begin, say:
- **"Let's start Phase 1"** or
- **"What's next?"**

And we'll dive into understanding the architecture and planning your QuizMaster app!

---

**Note**: This is a **learning project**. The goal is not just to build QuizMaster, but to deeply understand the technologies and patterns used. Take your time, ask questions, and enjoy the journey!

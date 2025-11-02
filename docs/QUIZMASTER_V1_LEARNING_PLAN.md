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

---

## Phase Structure

### **Phase 1: Understanding the Architecture** (2-3 sessions)
Review the V1 specification, understand data flow, and plan the file structure using ES6 modules.

📄 [PHASE1_ARCHITECTURE.md](./PHASE1_ARCHITECTURE.md)

---

### **Phase 2: IndexedDB Fundamentals** (2-3 sessions)
Learn browser-based structured data storage. Understand databases, object stores, transactions, and CRUD operations.

📄 [PHASE2_INDEXEDDB.md](./PHASE2_INDEXEDDB.md)

---

### **Phase 3: API Integration with Anthropic Claude** (2-3 sessions)
Master external API integration. Learn the Fetch API, async/await patterns, and how to work with the Claude API.

📄 [PHASE3_API_INTEGRATION.md](./PHASE3_API_INTEGRATION.md)

---

### **Phase 4: ES6 Modules and Code Organization** (2-3 sessions)
Structure your codebase using modern JavaScript. Learn imports, exports, and modular architecture.

📄 [PHASE4_MODULES.md](./PHASE4_MODULES.md)

---

### **Phase 5: Building the Single Page Application** (2-3 sessions)
Create a multi-screen app without page reloads. Implement routing, state management, and dynamic rendering.

📄 [PHASE5_SPA.md](./PHASE5_SPA.md)

---

### **Phase 6: Implementing Core Features** (4-5 sessions)
Build the actual functionality: home screen, topic input, question generation, answer handling, results, and history.

📄 [PHASE6_FEATURES.md](./PHASE6_FEATURES.md)

---

### **Phase 7: PWA Integration** (1-2 sessions)
Make QuizMaster installable and offline-capable. Adapt the manifest and service worker for the new app.

📄 [PHASE7_PWA.md](./PHASE7_PWA.md)

---

### **Phase 8: Polish and Testing** (1-2 sessions)
Ensure quality through error handling, loading states, edge case handling, and thorough manual testing.

📄 [PHASE8_TESTING.md](./PHASE8_TESTING.md)

---

### **Phase 9: Deployment** (1 session)
Deploy to Netlify and make QuizMaster accessible to your family for testing.

📄 [PHASE9_DEPLOYMENT.md](./PHASE9_DEPLOYMENT.md)

---

### **Phase 10: Validation and Learning Review** (Ongoing)
Run the family beta test, gather feedback, iterate, and reflect on what you've learned.

📄 [PHASE10_VALIDATION.md](./PHASE10_VALIDATION.md)

---

## Prerequisites

Before starting, you should have completed:
- ✅ Original PWA Learning Plan (Phases 1-4)
- ✅ Understanding of HTML, CSS, JavaScript basics
- ✅ Service Worker concepts
- ✅ Async/await fundamentals

---

## Success Criteria

By the end of this learning journey, you will have:

✅ **Built QuizMaster V1** - A fully functional AI-powered quiz app
✅ **Mastered IndexedDB** - Store and query structured data in the browser
✅ **Integrated External APIs** - Work with Anthropic's Claude API
✅ **Created a SPA** - Multi-screen app with routing and state management
✅ **Organized Code with Modules** - Clean, maintainable codebase structure
✅ **Implemented PWA Features** - Offline support and installation
✅ **Deployed to Production** - Live app on Netlify
✅ **Validated with Users** - Real feedback from your family

---

## Estimated Timeline

**Total: ~15-20 learning sessions** (at your own pace)

| Phase | Sessions | Focus |
|-------|----------|-------|
| Phase 1 | 2-3 | Architecture & Planning |
| Phase 2 | 2-3 | IndexedDB Learning |
| Phase 3 | 2-3 | API Integration |
| Phase 4 | 2-3 | ES6 Modules |
| Phase 5 | 2-3 | SPA Foundation |
| Phase 6 | 4-5 | Feature Implementation |
| Phase 7 | 1-2 | PWA Setup |
| Phase 8 | 1-2 | Testing & Polish |
| Phase 9 | 1 | Deployment |
| Phase 10 | Ongoing | Validation |

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

### ❌ Deferred to V2

- Photo upload from textbooks
- Spaced repetition scheduling
- Multiple question types (only multiple-choice in V1)
- User profiles/multiple users
- Social features/sharing
- Advanced analytics
- Push notifications

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

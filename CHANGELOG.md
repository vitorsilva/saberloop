# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 5: Repository reorganization and documentation
  - New `docs/architecture/` with system documentation
  - New `docs/developer-guide/` with installation and configuration guides
  - Reorganized `src/` into `core/`, `features/`, and `utils/`
  - Professional README, CONTRIBUTING, and CHANGELOG files
  - Moved learning docs to `docs/learning/`

## [2.0.0] - 2025-12-10

### Added
- Real Claude API integration via OpenRouter
- Production offline capabilities with Vite PWA Plugin
- Settings page with API key management
- Dynamic home page with real quiz history from IndexedDB
- Structured logging and observability (loglevel, web-vitals)
- Error tracking and performance monitoring
- Simplified navigation (Home, Settings)
- Form validation for settings
- Statistics dashboard on home page
- Empty states for better UX
- About section with version info
- Welcome/onboarding flow for new users
- Sample quizzes for offline demo
- Tailwind CSS build via PostCSS (removed CDN)

### Changed
- Backend architecture: Mock API to Real API with serverless functions
- Offline strategy: Basic to Production-ready with Workbox
- Navigation: 3 items to 2 items (removed unused Topics link)
- Documentation: Learning-focused to Production-focused
- Error handling: Console logs to Structured logging
- Service worker: Manual to Auto-generated (Vite PWA Plugin)

### Improved
- Lighthouse PWA score: 100/100
- Performance monitoring with Core Web Vitals (LCP, INP, CLS)
- User experience with loading and empty states
- Code organization and project structure
- Security with API key validation and sanitization

### Fixed
- Production build offline functionality
- Service worker caching for Vite hashed filenames
- CORS handling for API requests

## [1.0.0] - 2025-11-08

### Added
- Initial QuizMaster V1 release
- Mock API for quiz generation
- IndexedDB for data persistence
- SPA architecture with hash routing
- Basic PWA features (manifest, basic service worker)
- Quiz creation and completion flow
- Results page with score calculation
- Question answering with immediate feedback
- Basic offline support (dev mode)

### Features
- Topic-based quiz generation (mock data)
- Multiple choice questions
- Immediate answer feedback
- Score tracking
- Session history storage
- Responsive mobile-first design
- Material Design icons
- Tailwind CSS styling

## [0.1.0] - 2025-10-XX (Epic 01)

### Added
- PWA fundamentals implementation
- Service worker with cache-first strategy
- PWA manifest
- Vite build configuration
- GitHub Actions CI/CD pipeline
- Vitest unit testing setup
- Playwright E2E testing setup
- GitHub Pages deployment
- Local HTTPS development environment

---

[Unreleased]: https://github.com/vitorsilva/demo-pwa-app/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/vitorsilva/demo-pwa-app/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/vitorsilva/demo-pwa-app/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/vitorsilva/demo-pwa-app/releases/tag/v0.1.0

# Phase 60: Translation Expansion - Learning Notes

## Session: 2026-01-04

### Completed
- Added Norwegian (no), Russian (ru), and Italian (it) language support
- Created missing translation files for Spanish (es), French (fr), and German (de)
- Updated 3 code files to support new languages
- Created 6 new translation files (~240 keys each)

### Commits Made (10 atomic commits)
1. `feat(i18n): add Norwegian to translate CLI` - scripts/translate.js
2. `feat(i18n): add Norwegian and Russian to supported languages` - src/core/i18n.js
3. `feat(api): add Norwegian and Russian to LLM language names` - src/api/api.real.js
4. `feat(i18n): add Spanish translations` - public/locales/es.json
5. `feat(i18n): add French translations` - public/locales/fr.json
6. `feat(i18n): add German translations` - public/locales/de.json
7. `feat(i18n): add Norwegian translations` - public/locales/no.json
8. `feat(i18n): add Russian translations` - public/locales/ru.json
9. `feat(i18n): add Italian to supported languages` - src/core/i18n.js, src/api/api.real.js
10. `feat(i18n): add Italian translations` - public/locales/it.json

### Difficulties & Solutions

#### Problem: OpenRouter API credits insufficient
- **Error**: "This request requires more credits... You requested up to 4096 tokens, but can only afford 1333"
- **Cause**: The translate CLI script uses OpenRouter API which has token limits on free tier
- **Fix**: Generated translations directly using Claude Code instead of the CLI tool
- **Learning**: The CLI tool is useful for incremental updates but for bulk generation, direct translation may be more practical when API credits are limited

#### Problem: Environment variable not persisting
- **Error**: `OPENROUTER_API_KEY environment variable not set`
- **Cause**: Environment variables set in PowerShell don't persist to npm child processes in Git Bash
- **Attempted**: Setting `$env:OPENROUTER_API_KEY` in PowerShell
- **Fix**: Would need to use inline env vars like `OPENROUTER_API_KEY=xxx npm run translate` or pass directly
- **Learning**: Cross-shell environment variable handling can be tricky on Windows

### Key Discovery: Broken Language Support

During planning, discovered that **3 languages were listed in the UI but had no translation files**:
- Spanish (es) - listed in `SUPPORTED_LANGUAGES` but no `es.json`
- French (fr) - listed in `SUPPORTED_LANGUAGES` but no `fr.json`
- German (de) - listed in `SUPPORTED_LANGUAGES` but no `de.json`

Users selecting these languages would see English fallback text without any error. This was a hidden bug that the phase fixed.

### Files Changed

| File | Lines | Change |
|------|-------|--------|
| `scripts/translate.js` | +1 | Add Norwegian to LANGUAGE_NAMES |
| `src/core/i18n.js` | +2 | Add Norwegian and Russian to SUPPORTED_LANGUAGES |
| `src/api/api.real.js` | +2 | Add Norwegian and Russian to LANGUAGE_NAMES |
| `public/locales/es.json` | +240 | New Spanish translations |
| `public/locales/fr.json` | +240 | New French translations |
| `public/locales/de.json` | +240 | New German translations |
| `public/locales/no.json` | +240 | New Norwegian translations |
| `public/locales/ru.json` | +240 | New Russian translations |
| `public/locales/it.json` | +240 | New Italian translations |

### Gotchas for Future Reference

1. **Three places need language updates**: When adding a new language, update:
   - `scripts/translate.js` - LANGUAGE_NAMES (for CLI tool)
   - `src/core/i18n.js` - SUPPORTED_LANGUAGES (for UI dropdown)
   - `src/api/api.real.js` - LANGUAGE_NAMES (for LLM prompts)

2. **Translation keys must match exactly**: All translation files must have the same structure as `en.json`. Missing keys fall back to English silently.

3. **Interpolation variables**: Must preserve `{{variable}}` syntax in translations (e.g., `{{count}}`, `{{topic}}`, `{{score}}`).

4. **Russian uses Cyrillic**: No special handling needed - browsers handle Cyrillic fonts natively. Just ensure UTF-8 encoding.

5. **Norwegian variant**: Used Bokmål (most common written form). Code is `no`, not `nb`.

### Validation Status

- [x] Build passes
- [x] All 8 languages have translation files
- [x] Code supports all 8 languages
- [x] Deployed to production
- [x] PR merged to main
- [ ] Manual UI testing (pending)
- [ ] Quiz generation in new languages (pending)

---

## Languages Now Supported

| Language | Code | Flag | Status |
|----------|------|------|--------|
| English | en | 🇬🇧 | Complete (baseline) |
| Portuguese | pt-PT | 🇵🇹 | Complete (manual) |
| Spanish | es | 🇪🇸 | Complete (new) |
| French | fr | 🇫🇷 | Complete (new) |
| German | de | 🇩🇪 | Complete (new) |
| Italian | it | 🇮🇹 | Complete (new) |
| Norwegian | no | 🇳🇴 | Complete (new) |
| Russian | ru | 🇷🇺 | Complete (new) |

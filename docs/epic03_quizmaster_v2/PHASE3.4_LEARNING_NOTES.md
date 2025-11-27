# Phase 3.4: PHP VPS Migration - Learning Notes

**Epic:** 3 - QuizMaster V2
**Phase:** 3.4 - PHP VPS Migration
**Status:** 🔄 In Progress
**Started:** 2025-11-27
**Reason:** Netlify credit constraints requiring cost-effective hosting solution

---

## Why This Phase Became Necessary

**Problem:** Netlify Functions free tier (125K requests/month) credits running out

**Solution:** Migrate to PHP API on existing VPS (zero additional cost)

**Benefits:**
- 💰 No usage limits or additional costs
- 🚀 No cold starts (always-warm server)
- 🔧 Full infrastructure control
- 🎓 Learn traditional server architecture and PHP backend development
- 📊 Server-side logging and analytics capabilities

---

## Prerequisites Checklist

Before starting implementation:

**VPS Requirements:**
- [ ] VPS access confirmed (SSH)
- [ ] PHP 8.1+ installed and verified
- [ ] Apache or Nginx installed and running
- [ ] Domain/subdomain configured (DNS records)
- [ ] SSH access working with keys configured
- [ ] Sudo/root access available for server configuration

**Local Setup:**
- [ ] VPS IP address/hostname documented
- [ ] SSH keys configured and tested
- [ ] Domain DNS configured (if using subdomain)
- [ ] Backup of current Netlify setup (in case rollback needed)

**Knowledge Check:**
- [ ] Understand current Netlify Functions architecture
- [ ] Know where API endpoints are called in frontend
- [ ] Familiar with CORS and why it's needed
- [ ] Understand environment variable management

---

## Session 1 - 2025-11-27

### Planning & Documentation Reorganization

**Tasks Completed:**
- [x] Moved PHASE10_PHP_MIGRATION.md from parking_lot to epic03_quizmaster_v2
- [x] Renamed to PHASE3.4_PHP_MIGRATION.md
- [x] Updated file header metadata (phase number, status, rationale)
- [x] Added Phase 3.4 to Epic 3 master plan (EPIC3_QUIZMASTER_V2_PLAN.md)
- [x] Updated timeline table with Phase 3.4
- [x] Updated CLAUDE.md current status
- [x] Created this learning notes file

**Key Decision:**
Phase 3.4 moved from "optional parking lot" to "required active phase" due to practical cost constraints. This is a great real-world example of how project requirements can change based on operational needs!

### Next Steps

**Ready to begin implementation when you:**
1. Confirm VPS access and prerequisites
2. Decide on domain/subdomain strategy
3. Choose between Apache or Nginx (if both available)
4. Verify you have the Anthropic API key for .env configuration

---

## Implementation Phases

### Phase 1: VPS Infrastructure Setup
- [ ] Verify PHP version and extensions
- [ ] Confirm Apache/Nginx installation
- [ ] Test SSH access
- [ ] Document server specifications

### Phase 2: Domain Configuration
- [ ] Choose subdomain or path-based routing
- [ ] Configure DNS A record
- [ ] Verify DNS propagation
- [ ] Test domain accessibility

### Phase 3: Web Server Configuration
- [ ] Create virtual host configuration
- [ ] Configure document root
- [ ] Enable required Apache/Nginx modules
- [ ] Test basic web server response

### Phase 4: SSL Certificate
- [ ] Install Certbot
- [ ] Obtain Let's Encrypt certificate
- [ ] Configure HTTPS redirect
- [ ] Verify SSL certificate validity
- [ ] Test auto-renewal

### Phase 5: PHP Application Setup
- [ ] Create directory structure
- [ ] Configure .env file
- [ ] Implement core PHP classes (Config, CORS, ErrorHandler)
- [ ] Implement Anthropic API client
- [ ] Create API endpoints

### Phase 6: Deployment & Testing
- [ ] Deploy PHP code to VPS
- [ ] Set file permissions
- [ ] Test each endpoint individually
- [ ] Test CORS configuration
- [ ] Verify error handling

### Phase 7: Frontend Integration
- [ ] Create/update API configuration in frontend
- [ ] Add dual backend support (Netlify/PHP switching)
- [ ] Test frontend with PHP backend
- [ ] Update environment variables

### Phase 8: Production Verification
- [ ] Full end-to-end testing
- [ ] Performance verification
- [ ] Error logging verification
- [ ] Security audit (API key protection, CORS, HTTPS)
- [ ] Documentation update

---

## Architecture Overview

### Current State (Netlify)
```
Frontend (Netlify Static Site)
    ↓ HTTPS
Netlify Functions (Serverless)
    ↓ API Call
Anthropic Claude API
```

### Target State (PHP VPS)
```
Frontend (Netlify Static Site)
    ↓ HTTPS
PHP API (Your VPS)
    ↓ API Call
Anthropic Claude API
```

### Dual Backend Support
```
Frontend
    ↓
Environment Variable (VITE_API_PROVIDER)
    ↓
   ┌─────────┴─────────┐
   ↓                   ↓
Netlify Functions   PHP VPS API
   ↓                   ↓
      Claude API
```

---

## Questions & Answers

*This section will track key learning moments as they arise*

**Q:** Why PHP instead of keeping Node.js for consistency with Netlify Functions?

**A:** (To be discussed - relates to VPS availability, PHP ecosystem, learning goals)

---

## Issues Encountered

*This section will track any problems and solutions discovered during implementation*

---

## Key Learnings

*This section will capture main concepts learned throughout Phase 3.4*

### Concepts to Master

1. **REST API Design**
   - HTTP methods (GET, POST, OPTIONS)
   - Status codes (200, 400, 404, 500)
   - Request/response formats (JSON)

2. **CORS (Cross-Origin Resource Sharing)**
   - Why browsers block cross-origin requests
   - Preflight OPTIONS requests
   - Allowed origins configuration

3. **Environment Variables**
   - .env file format
   - Secure storage practices
   - Never commit secrets to git

4. **PHP Specifics**
   - file_get_contents('php://input') for request body
   - json_decode/json_encode
   - header() function for response headers
   - cURL for HTTP requests

5. **Apache/Nginx Configuration**
   - Virtual hosts
   - Rewrite rules
   - SSL configuration
   - Security headers

6. **SSL/TLS**
   - Let's Encrypt certificates
   - Certbot automation
   - HTTPS enforcement
   - Certificate renewal

---

## Testing Checklist

### Unit Testing
- [ ] No changes needed (frontend tests are backend-agnostic)
- [ ] Verify all existing tests still pass

### Integration Testing
- [ ] Health check endpoint returns correct JSON
- [ ] Generate questions endpoint creates 5 questions
- [ ] Generate explanation endpoint returns helpful text
- [ ] CORS headers present in all responses
- [ ] Error handling returns proper JSON errors

### E2E Testing
- [ ] Frontend can switch between Netlify/PHP backends
- [ ] Full quiz flow works with PHP backend
- [ ] Offline mode still works (with cached data)
- [ ] API errors handled gracefully

### Security Testing
- [ ] API key not exposed in responses
- [ ] CORS only allows configured origins
- [ ] HTTPS enforced (no HTTP access)
- [ ] Input validation prevents injection
- [ ] Error messages don't leak sensitive info

---

## Cost Analysis

### Before (Netlify Functions)
- **Free Tier:** 125K requests/month
- **After Free Tier:** $25/month for 2M requests
- **Current Status:** Approaching/exceeding free tier limits

### After (PHP VPS)
- **Additional Cost:** $0 (using existing VPS)
- **VPS Cost:** (Already paid - hosts multiple projects)
- **Bandwidth:** Included in VPS plan
- **SSL Certificate:** Free (Let's Encrypt)
- **Total Savings:** $25+/month (if exceeding free tier)

---

## Performance Considerations

### Netlify Functions
- **Cold Starts:** 500ms - 2s (first request after idle)
- **Warm Response:** ~100-300ms
- **Global CDN:** Yes

### PHP VPS
- **Cold Starts:** None (always warm)
- **Response Time:** ~50-200ms (depending on server location)
- **Global CDN:** No (single server location)

**For QuizMaster:** PHP VPS likely faster for most requests due to no cold starts.

---

## Success Criteria

**Phase 3.4 complete when:**

✅ **Infrastructure:**
- VPS configured with PHP 8.1+ and web server
- SSL certificate installed and auto-renewing
- Domain/subdomain pointing to VPS

✅ **API Implementation:**
- Three PHP endpoints working (generate-questions, generate-explanation, health-check)
- CORS configured correctly
- Environment variables secured
- Error handling robust
- Logging functional

✅ **Frontend Integration:**
- Frontend can call PHP backend successfully
- Dual backend support implemented (can switch between Netlify/PHP)
- All tests passing

✅ **Production Ready:**
- Full quiz flow works end-to-end
- No API key exposed
- HTTPS enforced
- Documentation updated
- Zero additional hosting costs achieved

---

## References

- **Phase 3.4 Plan:** `docs/epic03_quizmaster_v2/PHASE3.4_PHP_MIGRATION.md`
- **Phase 1 (Netlify):** `docs/epic03_quizmaster_v2/PHASE1_BACKEND.md`
- **Epic 3 Plan:** `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`

**External Resources:**
- [PHP Manual](https://www.php.net/manual/en/)
- [Apache mod_rewrite](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

---

**Last Updated:** 2025-11-27
**Next Session:** VPS prerequisites verification and domain configuration

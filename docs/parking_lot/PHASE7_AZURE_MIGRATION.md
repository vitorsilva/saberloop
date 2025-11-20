# Phase 7: Azure Functions Migration (Optional)

**Epic:** 3 - QuizMaster V2
**Status:** Optional / Nice to Have
**Estimated Time:** 2-3 sessions
**Prerequisites:** Phase 1 (Netlify Functions) complete

---

## Overview

Phase 7 is an **optional enhancement** that migrates QuizMaster's serverless backend from Netlify Functions to Azure Functions. This phase explores Azure's serverless ecosystem and demonstrates the portability of serverless code.

**What you'll build:**
- Azure Functions App with HTTP triggers
- Same functionality as Netlify (generate questions, explanations, health check)
- Azure-specific features (Application Insights, Key Vault)
- Dual deployment support (can run both!)

**Why this is optional:**
- ✅ Netlify Functions work perfectly for QuizMaster
- ✅ Free tier is sufficient for current needs
- ✅ Adds complexity without critical benefits

**Why you might want it:**
- 🎓 Learn Azure ecosystem
- 📈 Higher free tier limits (1M requests/month vs 125K)
- 🏢 Enterprise features (VNet, private endpoints, Azure AD)
- 🔧 Advanced triggers (queues, timers, events)
- 💼 Resume/portfolio (Azure experience)

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand Azure Functions architecture
- ✅ Create Azure Functions App in Azure Portal
- ✅ Migrate serverless functions between platforms
- ✅ Configure Azure-specific features (App Settings, CORS)
- ✅ Use Azure Application Insights for monitoring
- ✅ (Optional) Integrate Azure Key Vault for secrets
- ✅ Deploy via Git, CLI, or VS Code
- ✅ Compare Netlify vs Azure serverless offerings

---

## Current State vs Target State

### Current State (Phase 1 - Netlify)
```
Backend: Netlify Functions
├── ✅ generate-questions.js (Claude API)
├── ✅ generate-explanation.js (Claude API)
├── ✅ health-check.js (uptime monitoring)
├── ✅ CORS configured
├── ✅ Environment variables (Netlify UI)
├── ✅ Automatic deployment (Git push)
└── ✅ Free tier: 125K requests/month

Frontend:
├── Calls: https://quizmaster.netlify.app/.netlify/functions/*
```

### Target State (Phase 7 - Azure Functions)
```
Backend: Azure Functions (Consumption Plan)
├── ✅ generateQuestions (HTTP trigger)
├── ✅ generateExplanation (HTTP trigger)
├── ✅ healthCheck (HTTP trigger)
├── ✅ CORS configured globally
├── ✅ Environment variables (Azure App Settings)
├── ✅ Application Insights (monitoring)
├── ✅ (Optional) Key Vault integration
├── ✅ Deployment: Git, CLI, or VS Code
└── ✅ Free tier: 1M requests/month

Frontend:
├── Calls: https://quizmaster.azurewebsites.net/api/*
├── OR: Can switch between Netlify/Azure via config
```

---

## Architecture

### Dual Backend Support

```
┌─────────────────────────────────────────────────────┐
│              QuizMaster Frontend                    │
│              (Netlify Static Site)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  API Configuration (src/config/api.js)              │
│  ┌───────────────────────────────────────────────┐  │
│  │ const API_PROVIDER = 'netlify' | 'azure'      │  │
│  │                                               │  │
│  │ if (API_PROVIDER === 'netlify') {             │  │
│  │   BASE_URL = '/.netlify/functions'            │  │
│  │ } else {                                      │  │
│  │   BASE_URL = 'https://quizmaster.azure...net' │  │
│  │ }                                             │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│  Netlify Functions   │    │   Azure Functions    │
│                      │    │                      │
│ • generate-questions │    │ • generateQuestions  │
│ • generate-explanation│   │ • generateExplanation│
│ • health-check       │    │ • healthCheck        │
│                      │    │                      │
│ Anthropic Claude API │    │ Anthropic Claude API │
└──────────────────────┘    └──────────────────────┘
```

---

## Implementation Steps

### Step 1: Azure Account Setup

**Create Azure account:**
1. Go to https://azure.microsoft.com/free/
2. Sign up (requires credit card, but won't charge for free tier)
3. Verify account

**Free tier includes:**
- 1,000,000 requests/month
- 400,000 GB-seconds compute
- No time limit (doesn't expire after 12 months)

**Install Azure CLI (optional but recommended):**
```bash
# Windows (via winget)
winget install Microsoft.AzureCLI

# macOS
brew install azure-cli

# Login
az login
```

---

### Step 2: Create Azure Functions App

**Via Azure Portal (easiest for first time):**

1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Function App"
4. Click "Create"

**Configuration:**
```
Basics:
  Subscription: Free Trial (or your subscription)
  Resource Group: Create new → "quizmaster-rg"
  Function App name: quizmaster-functions (must be globally unique)
  Runtime stack: Node.js
  Version: 20 LTS
  Region: East US (or closest to you)
  Operating System: Linux
  Plan type: Consumption (Serverless)

Hosting:
  Storage account: Create new (auto-generated name)

Networking:
  Enable public access: Yes

Monitoring:
  Enable Application Insights: Yes
  Application Insights: Create new → "quizmaster-insights"

Deployment:
  Continuous deployment: Disable (configure later)

Review + create → Create
```

**Wait 2-3 minutes for deployment...**

---

### Step 3: Project Structure

**Create Azure Functions project locally:**

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create new directory for Azure functions
mkdir azure-functions
cd azure-functions

# Initialize Azure Functions project
func init --worker-runtime node --language javascript
```

**Project structure:**
```
azure-functions/
├── .funcignore              # Files to ignore on deploy
├── .gitignore
├── host.json                # Global function config
├── local.settings.json      # Local environment variables
├── package.json
├── generateQuestions/       # HTTP trigger function
│   ├── function.json        # Function config (bindings, triggers)
│   └── index.js             # Function code
├── generateExplanation/
│   ├── function.json
│   └── index.js
└── healthCheck/
    ├── function.json
    └── index.js
```

---

### Step 4: Create HTTP Trigger Functions

**Generate function scaffolding:**
```bash
# In azure-functions directory
func new --name generateQuestions --template "HTTP trigger" --authlevel anonymous
func new --name generateExplanation --template "HTTP trigger" --authlevel anonymous
func new --name healthCheck --template "HTTP trigger" --authlevel anonymous
```

**Auth levels explained:**
- `anonymous`: No authentication (use for public APIs)
- `function`: Requires function key (basic security)
- `admin`: Requires admin key (highest security)

For QuizMaster: Use `anonymous` (CORS is our security)

---

### Step 5: Implement generateQuestions Function

**File:** `azure-functions/generateQuestions/function.json`

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "generate-questions"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

**File:** `azure-functions/generateQuestions/index.js`

```javascript
const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function (context, req) {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers,
      body: ''
    };
    return;
  }

  try {
    // Validate request
    if (req.method !== 'POST') {
      context.res = {
        status: 405,
        headers,
        body: { error: 'Method not allowed' }
      };
      return;
    }

    const { topic, gradeLevel = 'High School' } = req.body;

    if (!topic || topic.trim() === '') {
      context.res = {
        status: 400,
        headers,
        body: { error: 'Topic is required' }
      };
      return;
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      context.log.error('ANTHROPIC_API_KEY not configured');
      context.res = {
        status: 500,
        headers,
        body: { error: 'Server configuration error' }
      };
      return;
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey });

    // Build prompt
    const prompt = `Generate 5 multiple-choice quiz questions about ${topic} for ${gradeLevel} level students.

For each question, provide:
1. The question text
2. Four answer options (A, B, C, D)
3. The correct answer (letter only)

Format your response as a JSON array of objects with this structure:
[
  {
    "question": "Question text here?",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "A"
  }
]

Make the questions appropriately challenging for ${gradeLevel} students.
Ensure all questions are factually accurate.`;

    context.log('Calling Claude API for topic:', topic);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract text content
    const responseText = message.content[0].text;

    // Parse questions
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid question format');
    }

    context.log('Successfully generated', questions.length, 'questions');

    context.res = {
      status: 200,
      headers,
      body: { questions }
    };

  } catch (error) {
    context.log.error('Error generating questions:', error);

    context.res = {
      status: 500,
      headers,
      body: {
        error: 'Failed to generate questions',
        message: error.message
      }
    };
  }
};
```

**Key differences from Netlify:**
- `context, req` parameters (instead of `event, context`)
- `req.method` (instead of `event.httpMethod`)
- `req.body` (already parsed, not a string!)
- `context.res = { ... }` (instead of `return { ... }`)
- `context.log()` (structured logging, integrates with Application Insights)

---

### Step 6: Implement generateExplanation Function

**File:** `azure-functions/generateExplanation/function.json`

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post", "options"],
      "route": "generate-explanation"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

**File:** `azure-functions/generateExplanation/index.js`

```javascript
const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function (context, req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers, body: '' };
    return;
  }

  try {
    if (req.method !== 'POST') {
      context.res = {
        status: 405,
        headers,
        body: { error: 'Method not allowed' }
      };
      return;
    }

    const { question, correctAnswer, userAnswer } = req.body;

    if (!question || !correctAnswer || !userAnswer) {
      context.res = {
        status: 400,
        headers,
        body: { error: 'Missing required fields' }
      };
      return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      context.log.error('ANTHROPIC_API_KEY not configured');
      context.res = {
        status: 500,
        headers,
        body: { error: 'Server configuration error' }
      };
      return;
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `A student answered a quiz question incorrectly. Provide a clear, concise explanation.

Question: ${question}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

Explain in 2-3 sentences:
1. Why the correct answer is right
2. Why the student's answer is wrong (if applicable)

Be encouraging and educational.`;

    context.log('Generating explanation for question');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const explanation = message.content[0].text.trim();

    context.log('Successfully generated explanation');

    context.res = {
      status: 200,
      headers,
      body: { explanation }
    };

  } catch (error) {
    context.log.error('Error generating explanation:', error);

    context.res = {
      status: 500,
      headers,
      body: {
        error: 'Failed to generate explanation',
        message: error.message
      }
    };
  }
};
```

---

### Step 7: Implement healthCheck Function

**File:** `azure-functions/healthCheck/function.json`

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "options"],
      "route": "health-check"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

**File:** `azure-functions/healthCheck/index.js`

```javascript
module.exports = async function (context, req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers, body: '' };
    return;
  }

  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

  context.res = {
    status: 200,
    headers,
    body: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'azure',
      apiKeyConfigured: hasApiKey,
      version: '2.0.0'
    }
  };
};
```

---

### Step 8: Configure Environment Variables

**Local development:**

**File:** `azure-functions/local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "ANTHROPIC_API_KEY": "sk-ant-your-key-here"
  },
  "Host": {
    "CORS": "*"
  }
}
```

⚠️ **Add to `.gitignore`:**
```
local.settings.json
```

**Production (Azure Portal):**

1. Go to Azure Portal → Function App → quizmaster-functions
2. Settings → Configuration → Application settings
3. Click "+ New application setting"
4. Name: `ANTHROPIC_API_KEY`
5. Value: `sk-ant-your-actual-key`
6. Click "OK" → "Save"

---

### Step 9: Configure CORS Globally

**File:** `azure-functions/host.json`

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "extensions": {
    "http": {
      "routePrefix": "api"
    }
  }
}
```

**CORS configuration (in Azure Portal):**

1. Function App → Settings → CORS
2. Add allowed origins:
   - `https://quizmaster.netlify.app`
   - `http://localhost:3000` (for development)
   - Or use `*` for testing (not recommended for production)
3. Save

---

### Step 10: Install Dependencies

**File:** `azure-functions/package.json`

```json
{
  "name": "quizmaster-azure-functions",
  "version": "2.0.0",
  "description": "QuizMaster serverless backend on Azure Functions",
  "scripts": {
    "start": "func start",
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.1"
  },
  "devDependencies": {
    "@azure/functions": "^4.0.0"
  }
}
```

**Install:**
```bash
cd azure-functions
npm install
```

---

### Step 11: Test Locally

**Start Azure Functions locally:**
```bash
npm start
```

**Output:**
```
Azure Functions Core Tools
Core Tools Version: 4.x
Function Runtime Version: 4.x

Functions:

  generateQuestions: [POST] http://localhost:7071/api/generate-questions

  generateExplanation: [POST] http://localhost:7071/api/generate-explanation

  healthCheck: [GET] http://localhost:7071/api/health-check
```

**Test health check:**
```bash
curl http://localhost:7071/api/health-check
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T...",
  "platform": "azure",
  "apiKeyConfigured": true,
  "version": "2.0.0"
}
```

**Test question generation:**
```bash
curl -X POST http://localhost:7071/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic": "JavaScript", "gradeLevel": "High School"}'
```

---

### Step 12: Deploy to Azure

**Option 1: Deploy via VS Code (easiest)**

1. Install Azure Functions extension in VS Code
2. Open `azure-functions` folder
3. Azure icon in sidebar → Sign in
4. Click "Deploy to Function App"
5. Select your function app: `quizmaster-functions`
6. Confirm deployment
7. Wait 1-2 minutes...

**Option 2: Deploy via Azure CLI**

```bash
# Login
az login

# Deploy
cd azure-functions
func azure functionapp publish quizmaster-functions
```

**Option 3: Deploy via Git (CI/CD)**

1. Azure Portal → Function App → Deployment Center
2. Source: GitHub
3. Authorize GitHub
4. Select repository and branch
5. Save
6. Push to trigger deployment

---

### Step 13: Update Frontend Configuration

**Create API provider config:**

**File:** `src/config/api.js` (NEW)

```javascript
/**
 * API Provider Configuration
 * Switch between Netlify Functions and Azure Functions
 */

// Toggle between 'netlify' and 'azure'
const API_PROVIDER = import.meta.env.VITE_API_PROVIDER || 'netlify';

const API_ENDPOINTS = {
  netlify: {
    baseUrl: '/.netlify/functions',
    generateQuestions: '/.netlify/functions/generate-questions',
    generateExplanation: '/.netlify/functions/generate-explanation',
    healthCheck: '/.netlify/functions/health-check'
  },
  azure: {
    baseUrl: 'https://quizmaster-functions.azurewebsites.net/api',
    generateQuestions: 'https://quizmaster-functions.azurewebsites.net/api/generate-questions',
    generateExplanation: 'https://quizmaster-functions.azurewebsites.net/api/generate-explanation',
    healthCheck: 'https://quizmaster-functions.azurewebsites.net/api/health-check'
  }
};

export const API_CONFIG = {
  provider: API_PROVIDER,
  ...API_ENDPOINTS[API_PROVIDER]
};

export function getApiUrl(endpoint) {
  return API_CONFIG[endpoint] || API_CONFIG.baseUrl + '/' + endpoint;
}
```

**Update API calls:**

**File:** `src/services/api.js`

```javascript
import { getApiUrl } from '../config/api.js';

export async function generateQuestions(topic, gradeLevel) {
  const response = await fetch(getApiUrl('generateQuestions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, gradeLevel })
  });

  if (!response.ok) {
    throw new Error('Failed to generate questions');
  }

  const data = await response.json();
  return data.questions;
}

export async function generateExplanation(question, correctAnswer, userAnswer) {
  const response = await fetch(getApiUrl('generateExplanation'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, correctAnswer, userAnswer })
  });

  if (!response.ok) {
    throw new Error('Failed to generate explanation');
  }

  const data = await response.json();
  return data.explanation;
}

export async function healthCheck() {
  const response = await fetch(getApiUrl('healthCheck'));
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}
```

**Environment variable (.env):**

```bash
# Use Netlify (default)
VITE_API_PROVIDER=netlify

# Or use Azure
# VITE_API_PROVIDER=azure
```

---

### Step 14: Test Production Deployment

**Test Azure Functions:**

```bash
# Health check
curl https://quizmaster-functions.azurewebsites.net/api/health-check

# Generate questions
curl -X POST https://quizmaster-functions.azurewebsites.net/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic": "React Hooks", "gradeLevel": "College"}'
```

**Test from frontend:**

1. Update `.env`: `VITE_API_PROVIDER=azure`
2. Restart dev server: `npm run dev`
3. Test quiz generation
4. Verify calls go to Azure (check Network tab)

---

## Advanced Features (Optional)

### Application Insights Monitoring

**View telemetry in Azure Portal:**

1. Function App → Application Insights
2. See:
   - Request rate and response times
   - Failure rate
   - Dependency calls (Claude API)
   - Custom logs from `context.log()`

**Query logs:**
```kusto
traces
| where message contains "Successfully generated"
| project timestamp, message
| order by timestamp desc
```

### Azure Key Vault Integration

**Store API key in Key Vault (more secure):**

1. Create Key Vault: Azure Portal → Key Vaults → Create
2. Add secret: `ANTHROPIC-API-KEY` → value
3. Function App → Identity → Enable system-assigned
4. Key Vault → Access policies → Add → Select function app
5. Update function code:

```javascript
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

// In function
const vaultUrl = process.env.KEY_VAULT_URL;
const client = new SecretClient(vaultUrl, new DefaultAzureCredential());
const secret = await client.getSecret('ANTHROPIC-API-KEY');
const apiKey = secret.value;
```

### Scheduled Functions (Cron Jobs)

**Example: Daily analytics aggregation**

```javascript
// scheduledAnalytics/index.js
module.exports = async function (context, myTimer) {
  context.log('Running daily analytics at', new Date().toISOString());

  // Aggregate quiz stats from database
  // Send summary email
  // Clear old cache entries
};
```

**Configuration:**
```json
// scheduledAnalytics/function.json
{
  "bindings": [
    {
      "name": "myTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 0 0 * * *"
    }
  ]
}
```
`0 0 0 * * *` = Every day at midnight

---

## Comparison: Netlify vs Azure

### Feature Comparison

| Feature | Netlify Functions | Azure Functions |
|---------|-------------------|-----------------|
| **Free Tier** | 125K requests/month | 1M requests/month ✨ |
| **Deployment** | Automatic (Git push) | Manual/Git/CLI |
| **Setup Complexity** | Very simple ⭐⭐⭐⭐⭐ | Moderate ⭐⭐⭐ |
| **Monitoring** | Basic logs | Application Insights ✨ |
| **Triggers** | HTTP, scheduled | HTTP, timers, queues, events ✨ |
| **Languages** | Node.js, Go | Node, Python, C#, Java, Go ✨ |
| **Enterprise Features** | Limited | VNet, private endpoints, AD ✨ |
| **Best For** | JAMstack apps | Enterprise apps, microservices |

### Cost Comparison (Beyond Free Tier)

**Netlify Functions:**
- $25/month for 2M requests
- Simple pricing

**Azure Functions (Consumption Plan):**
- $0.20 per 1M executions
- $0.000016 per GB-second
- More complex but potentially cheaper at scale

**For QuizMaster:** Both free tiers are sufficient

### Code Migration Effort

**Time to migrate:** 2-3 hours

**Changes needed:**
1. Update function signatures
2. Change response format
3. Update deployment config
4. Configure Azure resources
5. Update frontend API URLs

**Code similarity:** ~95% identical

---

## Decision Matrix: Should You Migrate?

### ✅ Migrate to Azure if:

- [ ] You want to learn Azure ecosystem
- [ ] You need more free tier requests (>125K/month)
- [ ] You want advanced monitoring (Application Insights)
- [ ] You need enterprise features (VNet, AD)
- [ ] You're building a microservices architecture
- [ ] You want to add non-HTTP triggers (queues, timers)
- [ ] Your company uses Azure
- [ ] Resume/portfolio enhancement

### ❌ Stay with Netlify if:

- [x] Current setup works perfectly
- [x] You want simplest possible setup
- [x] You prefer automatic Git deployment
- [x] 125K requests/month is enough
- [x] You don't need advanced triggers
- [x] You want zero Azure learning curve
- [x] You prefer JAMstack architecture

**For QuizMaster learning project:** Netlify is perfect! Azure is optional enhancement.

---

## Success Criteria

**Phase 7 is complete when:**

- ✅ Azure Functions App created in Azure Portal
- ✅ All three functions deployed:
  - `generateQuestions` (HTTP trigger)
  - `generateExplanation` (HTTP trigger)
  - `healthCheck` (HTTP trigger)
- ✅ CORS configured correctly
- ✅ Environment variables (API key) configured
- ✅ Local testing successful (`func start`)
- ✅ Production deployment successful
- ✅ Frontend can switch between Netlify/Azure via config
- ✅ Application Insights collecting telemetry
- ✅ All API calls work from deployed frontend
- ✅ (Optional) Key Vault integration for secrets

**Verification checklist:**
```bash
# Test Azure endpoints
curl https://quizmaster-functions.azurewebsites.net/api/health-check
# → Should return: {"status": "healthy", "platform": "azure"}

# Test from frontend
# 1. Set VITE_API_PROVIDER=azure
# 2. Generate quiz
# 3. Check Network tab → calls go to azurewebsites.net

# Check Application Insights
# → See request telemetry in Azure Portal
```

---

## Cost Estimate

**Monthly cost (assuming moderate usage):**

**Free Tier (0-1M requests):**
- $0.00 ✅

**If you exceed 1M requests:**
- 1-5M requests: ~$0.80/month
- Storage: ~$0.05/month
- Application Insights: Free tier (5GB/month)
- **Total: ~$1/month** (very cheap!)

**Comparison to Netlify:**
- Netlify: $25/month after 125K
- Azure: $1/month after 1M
- **Azure is 25x cheaper at scale**

**For QuizMaster:** Will stay in free tier

---

## Next Steps

### After Completing Phase 7

**You'll have:**
- ✅ Dual backend support (Netlify + Azure)
- ✅ Azure Functions experience
- ✅ Advanced monitoring (Application Insights)
- ✅ Enterprise-grade serverless setup
- ✅ Portfolio-worthy architecture

**Move to Phase 8 (if created):**
- Or return to Epic 3 main path
- Continue with Phase 2 (Offline), 3 (UI), 4 (Observability), 5 (Documentation), 6 (Validation)

**Future enhancements:**
- Add queue-based processing (Azure Storage Queue)
- Implement rate limiting (Azure API Management)
- Add caching layer (Azure Cache for Redis)
- Multi-region deployment
- A/B testing between providers

---

## References

- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Azure Functions JavaScript Guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/)
- [Consumption Plan Pricing](https://azure.microsoft.com/en-us/pricing/details/functions/)
- [Netlify vs Azure Comparison](https://www.netlify.com/blog/2021/03/11/netlify-functions-vs-aws-lambda/)

---

## Troubleshooting

### Function App Not Starting
**Symptom:** "Application Error" when visiting Azure Functions URL

**Fix:**
1. Check Application Insights → Failures
2. Verify `ANTHROPIC_API_KEY` configured
3. Check `package.json` dependencies installed
4. Redeploy: `func azure functionapp publish quizmaster-functions`

### CORS Errors
**Symptom:** "Access blocked by CORS policy"

**Fix:**
1. Azure Portal → Function App → CORS
2. Add frontend origin: `https://quizmaster.netlify.app`
3. Save and wait 1-2 minutes

### Environment Variables Not Working
**Symptom:** `process.env.ANTHROPIC_API_KEY` is undefined

**Fix:**
1. Azure Portal → Configuration → Application settings
2. Verify `ANTHROPIC_API_KEY` exists
3. Click "Save" and restart function app
4. Check: Settings → Overview → Restart

### Cold Start Latency
**Symptom:** First request takes 5-10 seconds

**Why:** Consumption Plan has cold starts (spins down when idle)

**Solutions:**
- Accept it (free tier limitation)
- Or: Upgrade to Premium Plan ($75/month, always warm)
- Or: Use Durable Functions to keep warm

---

## FAQ

**Q: Can I run both Netlify and Azure simultaneously?**
A: Yes! The frontend config supports switching. You could even implement automatic fallback.

**Q: Will this increase costs?**
A: No, both have generous free tiers. QuizMaster will stay free.

**Q: Is Azure more complex than Netlify?**
A: Yes, more configuration options but more powerful. Worth learning for enterprise jobs.

**Q: Can I migrate back to Netlify?**
A: Yes! Code is 95% identical, easy to switch.

**Q: Should I do this phase?**
A: Only if you want Azure experience. Netlify works perfectly for QuizMaster.

---

**Related Documentation:**
- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 1 (Netlify Functions): `docs/epic03_quizmaster_v2/PHASE1_BACKEND.md`
- Phase 2 (Offline): `docs/epic03_quizmaster_v2/PHASE2_OFFLINE.md`
- Epic 2 Phase 7 (PWA): `docs/epic02_quizmaster_v1/PHASE7_LEARNING_NOTES.md`

---

**Last Updated:** 2025-11-20
**Status:** Optional Phase - Implement if you want Azure experience

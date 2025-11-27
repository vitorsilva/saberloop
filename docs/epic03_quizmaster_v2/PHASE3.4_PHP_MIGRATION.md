# Phase 3.4: PHP VPS Migration

**Epic:** 3 - QuizMaster V2
**Phase:** 3.4 - PHP VPS Migration
**Status:** 🔄 In Progress (Active - Cost Requirement)
**Estimated Time:** 3-4 sessions
**Prerequisites:** Phase 1 (Netlify Functions) complete

---

## Overview

Phase 3.4 migrates QuizMaster's serverless backend from Netlify Functions to a PHP-based API running on your own VPS. **This phase became necessary due to Netlify credit constraints**, making it a cost-effective solution for continued development. This also provides valuable experience with traditional server architecture and backend portability.

**What you'll build:**
- PHP REST API with three endpoints (generate questions, explanations, health check)
- Apache/Nginx configuration with CORS support
- Environment-based configuration (`.env` file)
- PHP error handling and logging
- Optional: Composer for dependencies, PHPUnit for testing

**Why this phase is now required:**
- 💰 **Netlify credit constraints** - Free tier limits being reached
- ✅ **Zero additional cost** - Using existing VPS eliminates hosting fees
- 🚀 **No cold starts** - Always-on server provides faster response times

**Additional benefits:**
- 💰 **Cost savings** - You already have a VPS (zero additional cost)
- 🎓 **Learn PHP backend development** - REST API design, error handling
- 🔧 **Full server control** - Custom caching, rate limiting, monitoring
- 📊 **Server-side analytics** - Log analysis, request tracking
- 🌐 **Multi-service hosting** - Host other projects on same VPS
- 💼 **Resume value** - PHP backend + VPS management experience
- 🚀 **No cold starts** - Always-on server (faster response times)

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand PHP REST API architecture
- ✅ Configure Apache/Nginx for API hosting
- ✅ Implement CORS in PHP
- ✅ Manage environment variables securely (`.env` files)
- ✅ Handle HTTP methods (GET, POST, OPTIONS)
- ✅ Implement input validation and error handling in PHP
- ✅ Deploy PHP applications to a VPS
- ✅ Configure SSL/HTTPS for API endpoints
- ✅ Update frontend to call PHP backend
- ✅ Modify CI/CD pipeline for new architecture
- ✅ Compare serverless vs traditional server architectures

---

## Current State vs Target State

### Current State (Phase 1 - Netlify)
```
Backend: Netlify Functions (Serverless)
├── ✅ generate-questions.js (Node.js)
├── ✅ generate-explanation.js (Node.js)
├── ✅ health-check.js (Node.js)
├── ✅ CORS configured
├── ✅ Environment variables (Netlify UI)
├── ✅ Automatic deployment (Git push)
├── ✅ Free tier: 125K requests/month
└── ✅ Cold start latency: 500ms-2s

Frontend:
├── Calls: https://quizmaster.netlify.app/.netlify/functions/*
```

### Target State (Phase 3.4 - PHP VPS)
```
Backend: PHP API on VPS (Traditional Server)
├── ✅ generate-questions.php (HTTP endpoint)
├── ✅ generate-explanation.php (HTTP endpoint)
├── ✅ health-check.php (HTTP endpoint)
├── ✅ CORS configured (Apache/.htaccess or Nginx)
├── ✅ Environment variables (.env file)
├── ✅ API key validation middleware
├── ✅ Structured error handling
├── ✅ Request logging (access.log, error.log)
├── ✅ No cold starts (always warm)
├── ✅ Manual deployment (Git pull, rsync, or CI/CD)
└── ✅ Cost: $0 (using existing VPS)

Frontend:
├── Calls: https://api.yourdomain.com/v1/*
├── OR: Can switch between Netlify/PHP via config
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
│  │ const API_PROVIDER = 'netlify' | 'php'        │  │
│  │                                               │  │
│  │ if (API_PROVIDER === 'netlify') {             │  │
│  │   BASE_URL = '/.netlify/functions'            │  │
│  │ } else if (API_PROVIDER === 'php') {          │  │
│  │   BASE_URL = 'https://api.yourdomain.com/v1'  │  │
│  │ }                                             │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          ↓                            ↓
┌──────────────────────┐    ┌──────────────────────┐
│  Netlify Functions   │    │   PHP API (VPS)      │
│  (Serverless)        │    │   (Traditional)      │
│                      │    │                      │
│ • generate-questions │    │ • generate-questions │
│ • generate-explanation│   │ • generate-explanation│
│ • health-check       │    │ • health-check       │
│                      │    │                      │
│ Node.js Runtime      │    │ PHP 8.1+ Runtime     │
│ Anthropic Claude API │    │ Anthropic Claude API │
└──────────────────────┘    └──────────────────────┘
```

### VPS Server Structure

```
VPS Server (Your Domain)
├── Apache/Nginx Web Server
├── PHP 8.1+ (with cURL, JSON extensions)
├── SSL Certificate (Let's Encrypt)
│
└── /var/www/quizmaster-api/
    ├── public/                 # Public web root
    │   ├── .htaccess           # Apache config (CORS, routing)
    │   ├── index.php           # API router
    │   └── v1/                 # API version 1
    │       ├── generate-questions.php
    │       ├── generate-explanation.php
    │       └── health-check.php
    │
    ├── src/                    # Application code
    │   ├── config.php          # Configuration loader
    │   ├── cors.php            # CORS handler
    │   ├── error-handler.php   # Error handling
    │   └── anthropic-client.php # Claude API client
    │
    ├── logs/                   # Application logs
    │   ├── api.log
    │   └── error.log
    │
    ├── .env                    # Environment variables (NEVER commit)
    ├── .env.example            # Example environment file
    ├── .gitignore
    └── composer.json           # PHP dependencies (optional)
```

---

## Implementation Steps

### Step 1: VPS Prerequisites Check

**Verify your VPS has:**
- ✅ PHP 8.1 or higher
- ✅ Apache or Nginx
- ✅ SSL certificate (HTTPS required for PWA)
- ✅ SSH access
- ✅ Domain name (or subdomain)

**Check PHP version:**
```bash
ssh your-vps
php -v
# Should show: PHP 8.1.x or higher

# Check required extensions
php -m | grep -E "(curl|json|mbstring)"
# Should show: curl, json, mbstring
```

**If PHP not installed or too old:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php8.1 php8.1-curl php8.1-json php8.1-mbstring

# Check Apache/Nginx
systemctl status apache2   # or: systemctl status nginx
```

---

### Step 2: Create Project Directory on VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Create project directory
sudo mkdir -p /var/www/quizmaster-api
sudo chown $USER:$USER /var/www/quizmaster-api
cd /var/www/quizmaster-api

# Create directory structure
mkdir -p public/v1 src logs
```

---

### Step 3: Configure Domain/Subdomain

**Option 1: Subdomain (recommended)**
- Point `api.yourdomain.com` to your VPS IP
- Create DNS A record: `api.yourdomain.com` → `your.vps.ip.address`

**Option 2: Path-based**
- Use existing domain: `yourdomain.com/api/v1/`

**Verify DNS propagation:**
```bash
# Wait 5-60 minutes after DNS change
nslookup api.yourdomain.com
# Should return your VPS IP
```

---

### Step 4: Configure Apache Virtual Host

**Create Apache config file:**

**File:** `/etc/apache2/sites-available/quizmaster-api.conf`

```apache
<VirtualHost *:80>
    ServerName api.yourdomain.com
    DocumentRoot /var/www/quizmaster-api/public

    <Directory /var/www/quizmaster-api/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Logging
    ErrorLog /var/www/quizmaster-api/logs/apache-error.log
    CustomLog /var/www/quizmaster-api/logs/apache-access.log combined

    # Environment (don't expose PHP version)
    ServerSignature Off
    ServerTokens Prod
</VirtualHost>
```

**Enable site and modules:**
```bash
# Enable site
sudo a2ensite quizmaster-api.conf

# Enable required modules
sudo a2enmod rewrite headers

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

**Alternative: Nginx Configuration**

**File:** `/etc/nginx/sites-available/quizmaster-api`

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    root /var/www/quizmaster-api/public;
    index index.php;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # API routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Logging
    access_log /var/www/quizmaster-api/logs/nginx-access.log;
    error_log /var/www/quizmaster-api/logs/nginx-error.log;
}
```

**Enable Nginx site:**
```bash
sudo ln -s /etc/nginx/sites-available/quizmaster-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache  # For Apache
# OR
sudo apt install certbot python3-certbot-nginx   # For Nginx

# Get certificate
sudo certbot --apache -d api.yourdomain.com      # Apache
# OR
sudo certbot --nginx -d api.yourdomain.com       # Nginx

# Certbot will:
# 1. Verify domain ownership
# 2. Issue SSL certificate
# 3. Auto-configure HTTPS redirect
# 4. Setup auto-renewal

# Test auto-renewal
sudo certbot renew --dry-run
```

**Verify HTTPS:**
```bash
curl https://api.yourdomain.com
# Should respond (even if 404 for now)
```

---

### Step 6: Create Environment Configuration

**File:** `/var/www/quizmaster-api/.env`

```bash
# Environment
APP_ENV=production
APP_DEBUG=false

# API Keys
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here

# CORS
CORS_ALLOWED_ORIGINS=https://quizmaster.netlify.app,http://localhost:3000
CORS_ALLOW_CREDENTIALS=false

# Claude API Configuration
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_MAX_TOKENS=2048
CLAUDE_TEMPERATURE=0.7

# Rate Limiting (optional)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60

# Logging
LOG_LEVEL=info
LOG_FILE=/var/www/quizmaster-api/logs/api.log
```

**File:** `/var/www/quizmaster-api/.env.example`

```bash
# Copy this file to .env and fill in your values
APP_ENV=production
APP_DEBUG=false
ANTHROPIC_API_KEY=your-api-key-here
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

**Secure the .env file:**
```bash
chmod 600 /var/www/quizmaster-api/.env
```

**File:** `/var/www/quizmaster-api/.gitignore`

```
.env
logs/*.log
vendor/
composer.lock
```

---

### Step 7: Create Core PHP Files

**File:** `/var/www/quizmaster-api/src/config.php`

```php
<?php
/**
 * Configuration Loader
 * Loads environment variables from .env file
 */

class Config {
    private static $config = [];

    public static function load($envPath) {
        if (!file_exists($envPath)) {
            throw new Exception('.env file not found');
        }

        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                self::$config[$key] = $value;
                putenv("$key=$value");
            }
        }
    }

    public static function get($key, $default = null) {
        return self::$config[$key] ?? $default;
    }

    public static function isDebug() {
        return self::get('APP_DEBUG', 'false') === 'true';
    }
}
```

**File:** `/var/www/quizmaster-api/src/cors.php`

```php
<?php
/**
 * CORS Handler
 * Handles Cross-Origin Resource Sharing
 */

class CORS {
    public static function handle() {
        $allowedOrigins = explode(',', Config::get('CORS_ALLOWED_ORIGINS', '*'));
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Check if origin is allowed
        if (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
        }

        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        header("Access-Control-Max-Age: 86400"); // 24 hours

        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
```

**File:** `/var/www/quizmaster-api/src/error-handler.php`

```php
<?php
/**
 * Error Handler
 * Centralized error handling and logging
 */

class ErrorHandler {
    public static function jsonError($statusCode, $message, $details = null) {
        http_response_code($statusCode);
        header('Content-Type: application/json');

        $response = ['error' => $message];

        if ($details && Config::isDebug()) {
            $response['details'] = $details;
        }

        echo json_encode($response, JSON_PRETTY_PRINT);

        // Log error
        self::log('ERROR', $message, $details);

        exit;
    }

    public static function jsonSuccess($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }

    public static function log($level, $message, $context = null) {
        $logFile = Config::get('LOG_FILE', '/var/www/quizmaster-api/logs/api.log');
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = $context ? ' | ' . json_encode($context) : '';

        $logLine = "[$timestamp] [$level] $message$contextStr\n";
        file_put_contents($logFile, $logLine, FILE_APPEND);
    }
}
```

**File:** `/var/www/quizmaster-api/src/anthropic-client.php`

```php
<?php
/**
 * Anthropic API Client
 * Wrapper for Claude API calls
 */

class AnthropicClient {
    private $apiKey;
    private $model;
    private $baseUrl = 'https://api.anthropic.com/v1';

    public function __construct() {
        $this->apiKey = Config::get('ANTHROPIC_API_KEY');
        if (!$this->apiKey) {
            throw new Exception('ANTHROPIC_API_KEY not configured');
        }
        $this->model = Config::get('CLAUDE_MODEL', 'claude-sonnet-4-20250514');
    }

    public function sendMessage($prompt, $maxTokens = null, $temperature = null) {
        $maxTokens = $maxTokens ?? (int)Config::get('CLAUDE_MAX_TOKENS', 2048);
        $temperature = $temperature ?? (float)Config::get('CLAUDE_TEMPERATURE', 0.7);

        $data = [
            'model' => $this->model,
            'max_tokens' => $maxTokens,
            'temperature' => $temperature,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ]
        ];

        $ch = curl_init($this->baseUrl . '/messages');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01',
                'content-type: application/json'
            ],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("cURL error: $error");
        }

        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMsg = $errorData['error']['message'] ?? 'API request failed';
            throw new Exception("Claude API error ($httpCode): $errorMsg");
        }

        $responseData = json_decode($response, true);
        if (!$responseData || !isset($responseData['content'][0]['text'])) {
            throw new Exception('Invalid response from Claude API');
        }

        return $responseData['content'][0]['text'];
    }
}
```

---

### Step 8: Implement API Endpoints

**File:** `/var/www/quizmaster-api/public/.htaccess`

```apache
# Enable rewrite engine
RewriteEngine On

# Redirect to HTTPS (if not already)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Route all requests to index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

**File:** `/var/www/quizmaster-api/public/index.php`

```php
<?php
/**
 * API Router
 * Routes requests to appropriate endpoint handlers
 */

// Load dependencies
require_once '../src/config.php';
require_once '../src/cors.php';
require_once '../src/error-handler.php';
require_once '../src/anthropic-client.php';

// Load configuration
try {
    Config::load(__DIR__ . '/../.env');
} catch (Exception $e) {
    http_response_code(500);
    die('Configuration error');
}

// Handle CORS
CORS::handle();

// Get request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Parse URI (remove query string)
$uri = parse_url($requestUri, PHP_URL_PATH);

// Route to appropriate handler
if (preg_match('#^/v1/generate-questions$#', $uri)) {
    require __DIR__ . '/v1/generate-questions.php';
} elseif (preg_match('#^/v1/generate-explanation$#', $uri)) {
    require __DIR__ . '/v1/generate-explanation.php';
} elseif (preg_match('#^/v1/health-check$#', $uri)) {
    require __DIR__ . '/v1/health-check.php';
} else {
    ErrorHandler::jsonError(404, 'Endpoint not found');
}
```

**File:** `/var/www/quizmaster-api/public/v1/generate-questions.php`

```php
<?php
/**
 * Generate Questions Endpoint
 * POST /v1/generate-questions
 */

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ErrorHandler::jsonError(405, 'Method not allowed');
}

// Parse JSON body
$input = file_get_contents('php://input');
$body = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    ErrorHandler::jsonError(400, 'Invalid JSON in request body');
}

// Validate input
$topic = $body['topic'] ?? '';
$gradeLevel = $body['gradeLevel'] ?? 'High School';

if (empty($topic) || !is_string($topic)) {
    ErrorHandler::jsonError(400, 'Topic is required and must be a string');
}

if (strlen(trim($topic)) < 2) {
    ErrorHandler::jsonError(400, 'Topic must be at least 2 characters');
}

if (strlen($topic) > 200) {
    ErrorHandler::jsonError(400, 'Topic must be less than 200 characters');
}

// Build prompt
$prompt = <<<EOT
You are an expert educational content creator. Generate exactly 5 multiple-choice questions about "$topic" appropriate for $gradeLevel students.

LANGUAGE REQUIREMENT (CRITICAL):
- Detect the language of the topic "$topic"
- Generate ALL questions and ALL answer options in the SAME language as the topic
- For example:
  - If topic is "Digestive System" → questions in English (EN-US)
  - If topic is "Sistema Digestivo" → questions in Portuguese (PT-PT)
  - If topic is "Système Digestif" → questions in French (FR-FR)
- Do NOT mix languages - everything must be consistent
- If the topic language is ambiguous, default to English (EN-US)

Requirements:
- Each question should have 4 answer options (A, B, C, D)
- Only one correct answer per question
- Include a mix of difficulty: 2 easy, 2 medium, 1 challenging
- Questions should test understanding, not just memorization
- Use clear, concise language appropriate for $gradeLevel
- Avoid ambiguous phrasing
- No trick questions

Return your response as a JSON object with this exact structure:
{
    "language": "XX-XX",
    "questions": [
        {
            "question": "The question text here?",
            "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
            "correct": 0,
            "difficulty": "easy"
        }
    ]
}

IMPORTANT:
- The "correct" field must be a NUMBER (0 for first option, 1 for second, 2 for third, 3 for fourth)
- ALL text must be in the same language as the topic
- The "language" field must be a locale code (e.g., "EN-US", "PT-PT", "ES-ES", "FR-FR")
- Return ONLY the JSON object, no other text before or after.
EOT;

try {
    // Call Claude API
    ErrorHandler::log('INFO', "Generating questions for topic: $topic");

    $client = new AnthropicClient();
    $response = $client->sendMessage($prompt);

    // Parse response
    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        ErrorHandler::log('ERROR', 'Failed to parse Claude response', ['response' => $response]);
        ErrorHandler::jsonError(500, 'Invalid response format from API');
    }

    // Validate structure
    if (!isset($data['questions']) || !is_array($data['questions']) || count($data['questions']) !== 5) {
        ErrorHandler::log('ERROR', 'Invalid questions structure', $data);
        ErrorHandler::jsonError(500, 'Invalid response format from API');
    }

    ErrorHandler::log('INFO', 'Successfully generated questions', ['count' => count($data['questions'])]);

    // Return success
    ErrorHandler::jsonSuccess([
        'language' => $data['language'] ?? 'EN-US',
        'questions' => $data['questions']
    ]);

} catch (Exception $e) {
    ErrorHandler::log('ERROR', 'Exception generating questions', ['message' => $e->getMessage()]);
    ErrorHandler::jsonError(500, 'Failed to generate questions', $e->getMessage());
}
```

**File:** `/var/www/quizmaster-api/public/v1/generate-explanation.php`

```php
<?php
/**
 * Generate Explanation Endpoint
 * POST /v1/generate-explanation
 */

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ErrorHandler::jsonError(405, 'Method not allowed');
}

// Parse JSON body
$input = file_get_contents('php://input');
$body = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    ErrorHandler::jsonError(400, 'Invalid JSON in request body');
}

// Validate input
$question = $body['question'] ?? '';
$correctAnswer = $body['correctAnswer'] ?? '';
$userAnswer = $body['userAnswer'] ?? '';

if (empty($question) || empty($correctAnswer) || empty($userAnswer)) {
    ErrorHandler::jsonError(400, 'Missing required fields: question, correctAnswer, userAnswer');
}

// Build prompt
$prompt = <<<EOT
A student answered a quiz question incorrectly. Provide a clear, concise explanation.

Question: $question
Correct Answer: $correctAnswer
Student's Answer: $userAnswer

Explain in 2-3 sentences:
1. Why the correct answer is right
2. Why the student's answer is wrong (if applicable)

Be encouraging and educational.
EOT;

try {
    ErrorHandler::log('INFO', 'Generating explanation');

    $client = new AnthropicClient();
    $explanation = $client->sendMessage($prompt, 500);

    ErrorHandler::log('INFO', 'Successfully generated explanation');

    ErrorHandler::jsonSuccess(['explanation' => trim($explanation)]);

} catch (Exception $e) {
    ErrorHandler::log('ERROR', 'Exception generating explanation', ['message' => $e->getMessage()]);
    ErrorHandler::jsonError(500, 'Failed to generate explanation', $e->getMessage());
}
```

**File:** `/var/www/quizmaster-api/public/v1/health-check.php`

```php
<?php
/**
 * Health Check Endpoint
 * GET /v1/health-check
 */

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ErrorHandler::jsonError(405, 'Method not allowed');
}

$hasApiKey = !empty(Config::get('ANTHROPIC_API_KEY'));

ErrorHandler::jsonSuccess([
    'status' => 'healthy',
    'timestamp' => date('c'),
    'platform' => 'php-vps',
    'phpVersion' => PHP_VERSION,
    'apiKeyConfigured' => $hasApiKey,
    'version' => '2.0.0'
]);
```

---

### Step 9: Deploy to VPS

**Option 1: Git Deployment (Recommended)**

```bash
# On your VPS, initialize git
cd /var/www/quizmaster-api
git init
git remote add origin https://github.com/yourusername/quizmaster-api.git

# Create .gitignore
echo ".env
logs/*.log
vendor/" > .gitignore

# Initial commit
git add .
git commit -m "Initial PHP API implementation"
git push -u origin main

# For updates:
git pull origin main
```

**Option 2: Manual Deployment (rsync)**

```bash
# From your local machine
rsync -avz --exclude '.env' --exclude 'logs/' \
  /local/path/to/api/ user@your-vps:/var/www/quizmaster-api/
```

**After deployment:**

```bash
# Set proper permissions
cd /var/www/quizmaster-api
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod 600 .env
sudo chmod 755 logs
```

---

### Step 10: Test PHP API

**Test health check:**
```bash
curl https://api.yourdomain.com/v1/health-check
```

**Expected response:**
```json
{
    "status": "healthy",
    "timestamp": "2025-11-26T12:00:00+00:00",
    "platform": "php-vps",
    "phpVersion": "8.1.12",
    "apiKeyConfigured": true,
    "version": "2.0.0"
}
```

**Test question generation:**
```bash
curl -X POST https://api.yourdomain.com/v1/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"topic": "PHP Arrays", "gradeLevel": "College"}'
```

**Test CORS:**
```bash
curl -X OPTIONS https://api.yourdomain.com/v1/generate-questions \
  -H "Origin: https://quizmaster.netlify.app" \
  -v
# Should return 200 with Access-Control-Allow-Origin header
```

---

### Step 11: Update Frontend Configuration

**Create/Update API provider config:**

**File:** `src/config/api.js`

```javascript
/**
 * API Provider Configuration
 * Switch between Netlify Functions, Azure Functions, and PHP VPS
 */

// Toggle between 'netlify', 'azure', 'php'
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
  },
  php: {
    baseUrl: 'https://api.yourdomain.com/v1',
    generateQuestions: 'https://api.yourdomain.com/v1/generate-questions',
    generateExplanation: 'https://api.yourdomain.com/v1/generate-explanation',
    healthCheck: 'https://api.yourdomain.com/v1/health-check'
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

**Environment variable (.env):**

```bash
# Use Netlify (default)
VITE_API_PROVIDER=netlify

# Or use PHP VPS
# VITE_API_PROVIDER=php

# Or use Azure
# VITE_API_PROVIDER=azure
```

**Test frontend with PHP backend:**

```bash
# Update .env
echo "VITE_API_PROVIDER=php" > .env

# Restart dev server
npm run dev

# Test in browser:
# 1. Open http://localhost:3000
# 2. Generate a quiz
# 3. Check Network tab → should call api.yourdomain.com
```

---

## Testing Changes

### Unit Tests - No Changes Required

**Good news:** Frontend unit tests don't need changes!
- Tests mock API calls, don't care about backend implementation
- Test behavior, not infrastructure

**Verify:**
```bash
npm test
# All tests should still pass
```

---

### E2E Tests - Backend URL Configuration

**Update Playwright config for testing:**

**File:** `playwright.config.js`

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    env: {
      // Use mock API for E2E tests (faster, no API costs)
      VITE_USE_REAL_API: 'false'
    }
  },
  // ... rest of config
});
```

**For testing with real PHP backend:**

```bash
# Set environment variable before running E2E
VITE_API_PROVIDER=php npm run test:e2e

# Or update .env temporarily
echo "VITE_API_PROVIDER=php" > .env
npm run test:e2e
```

**Add PHP backend smoke tests:**

**File:** `tests/e2e/php-backend.spec.js` (NEW)

```javascript
import { test, expect } from '@playwright/test';

test.describe('PHP Backend Health Check', () => {
  test('should connect to PHP API', async ({ request }) => {
    const response = await request.get('https://api.yourdomain.com/v1/health-check');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.platform).toBe('php-vps');
    expect(data.apiKeyConfigured).toBe(true);
  });

  test('should handle CORS correctly', async ({ request }) => {
    const response = await request.post('https://api.yourdomain.com/v1/generate-questions', {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://quizmaster.netlify.app'
      },
      data: {
        topic: 'Test Topic',
        gradeLevel: 'High School'
      }
    });

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
  });
});
```

**Run backend tests:**
```bash
npx playwright test php-backend.spec.js
```

---

## Deployment Changes

### CI/CD Pipeline Updates

**Current:** GitHub Actions → Netlify (automatic)

**With PHP VPS:** Two deployment strategies

#### Strategy 1: Separate Deployments (Recommended)

**Frontend:** Keep current Netlify deployment (no changes)

**Backend:** Manual or scripted deployment to VPS

**File:** `.github/workflows/deploy-php-api.yml` (NEW)

```yaml
name: Deploy PHP API to VPS

on:
  push:
    branches: [main]
    paths:
      - 'php-api/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/quizmaster-api
            git pull origin main
            sudo chown -R www-data:www-data .
            sudo chmod 600 .env
            sudo systemctl reload apache2
            echo "Deployment complete!"
```

**Add GitHub Secrets:**
1. Go to GitHub repo → Settings → Secrets
2. Add:
   - `VPS_HOST` - Your VPS IP or domain
   - `VPS_USER` - SSH username
   - `VPS_SSH_KEY` - Your private SSH key

#### Strategy 2: Combined Deployment

**Option:** Deploy frontend to VPS too (instead of Netlify)

**Pros:**
- ✅ Single server (simpler)
- ✅ No Netlify dependency
- ✅ Full control

**Cons:**
- ❌ No CDN (slower for global users)
- ❌ No automatic SSL renewal via Netlify
- ❌ More server management

---

### Local Development Workflow

**Before (with Netlify):**
```bash
npm run dev  # Starts Vite + Netlify Functions
```

**After (with PHP VPS):**

**Option 1: Use production PHP API**
```bash
# .env file
VITE_API_PROVIDER=php

npm run dev  # Frontend calls production PHP API
```

**Option 2: Run PHP locally**
```bash
# Terminal 1: PHP development server
cd php-api/public
php -S localhost:8080

# Terminal 2: Frontend dev server
VITE_API_PROVIDER=php npm run dev
```

**Option 3: Use mock API (fastest)**
```bash
# .env file
VITE_USE_REAL_API=false

npm run dev  # Uses mock data
```

---

## Security Considerations

### API Key Protection

**✅ DO:**
- Store API key in `.env` file (never in code)
- Set `.env` permissions to `600` (owner read/write only)
- Add `.env` to `.gitignore`
- Use environment variables (`Config::get()`)

**❌ DON'T:**
- Commit `.env` to git
- Expose API key in error messages
- Log API key values
- Store API key in database

### CORS Configuration

**Production CORS (strict):**

```php
// In .env
CORS_ALLOWED_ORIGINS=https://quizmaster.netlify.app,https://yourdomain.com
```

**Development CORS (permissive):**

```php
// In .env.local
CORS_ALLOWED_ORIGINS=*
```

### Input Validation

**Always validate:**
- ✅ Content type (JSON)
- ✅ Required fields present
- ✅ Field types (string, int, etc.)
- ✅ String lengths (min/max)
- ✅ No SQL injection (even if not using DB)
- ✅ No XSS attacks

### HTTPS Enforcement

**Ensure all traffic uses HTTPS:**

```apache
# In .htaccess
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Rate Limiting (Optional)

**Prevent abuse:**

**File:** `src/rate-limiter.php` (NEW)

```php
<?php
class RateLimiter {
    private static $file = '/tmp/rate-limit.json';

    public static function check($ip, $maxRequests = 100, $windowSeconds = 60) {
        if (!Config::get('RATE_LIMIT_ENABLED', 'false') === 'true') {
            return true;
        }

        $data = file_exists(self::$file) ? json_decode(file_get_contents(self::$file), true) : [];
        $now = time();
        $windowStart = $now - $windowSeconds;

        // Clean old entries
        $data[$ip] = array_filter($data[$ip] ?? [], fn($t) => $t > $windowStart);

        // Check limit
        if (count($data[$ip]) >= $maxRequests) {
            return false;
        }

        // Record request
        $data[$ip][] = $now;
        file_put_contents(self::$file, json_encode($data));

        return true;
    }
}
```

**Use in endpoints:**

```php
// In generate-questions.php
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($ip, 100, 60)) {
    ErrorHandler::jsonError(429, 'Rate limit exceeded. Please try again later.');
}
```

---

## Monitoring and Logging

### Server Logs

**Apache/Nginx access logs:**
```bash
tail -f /var/www/quizmaster-api/logs/apache-access.log
# Shows: IP, timestamp, endpoint, response code, response time
```

**Apache/Nginx error logs:**
```bash
tail -f /var/www/quizmaster-api/logs/apache-error.log
# Shows: PHP errors, warnings, notices
```

**Application logs:**
```bash
tail -f /var/www/quizmaster-api/logs/api.log
# Shows: Custom application logs from ErrorHandler::log()
```

### Log Analysis

**Find errors:**
```bash
grep ERROR /var/www/quizmaster-api/logs/api.log
```

**Count requests by endpoint:**
```bash
awk '{print $7}' /var/www/quizmaster-api/logs/apache-access.log | sort | uniq -c
```

**Find slow requests (>2s):**
```bash
awk '$NF > 2000000 {print}' /var/www/quizmaster-api/logs/apache-access.log
```

### Log Rotation

**Prevent logs from filling disk:**

**File:** `/etc/logrotate.d/quizmaster-api`

```
/var/www/quizmaster-api/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload apache2 > /dev/null 2>&1 || true
    endscript
}
```

### Uptime Monitoring

**Use existing services:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Monitor:**
- `https://api.yourdomain.com/v1/health-check` (every 5 min)
- Alert if down for >5 minutes

### Performance Monitoring (Optional)

**Install New Relic or similar:**
```bash
# Track: response times, error rates, throughput
```

---

## Comparison: Netlify vs Azure vs PHP VPS

### Feature Comparison

| Feature | Netlify Functions | Azure Functions | PHP VPS |
|---------|-------------------|-----------------|---------|
| **Cost** | 125K free/month | 1M free/month | $0 (existing VPS) ✨ |
| **Setup Complexity** | Very simple ⭐⭐⭐⭐⭐ | Moderate ⭐⭐⭐ | Complex ⭐⭐ |
| **Deployment** | Auto (Git push) ✨ | Manual/Git/CLI | Manual/Script ⭐⭐ |
| **Cold Starts** | 500ms-2s | 500ms-2s | None (always warm) ✨ |
| **Monitoring** | Basic logs | App Insights ✨ | Manual (logs) ⭐⭐ |
| **Scalability** | Automatic ✨ | Automatic ✨ | Manual (upgrade VPS) |
| **Control** | Limited | Moderate | Full control ✨ |
| **Maintenance** | None ✨ | None ✨ | Server updates, security |
| **Global CDN** | Yes ✨ | Optional | No (single location) |
| **Languages** | Node, Go | Multi ✨ | PHP |
| **Best For** | JAMstack | Enterprise | Cost-conscious, PHP devs |

### Cost Comparison (Beyond Free Tier)

**Netlify Functions:**
- Free: 125K requests/month
- Paid: $25/month for 2M requests
- Simple pricing

**Azure Functions:**
- Free: 1M requests/month
- Paid: $0.20 per 1M executions
- More complex pricing

**PHP VPS:**
- Free: Unlimited (if VPS already paid for)
- **Caveat:** VPS costs $5-20/month (but hosts multiple apps)
- **Cost per request:** $0.00 ✨

**For QuizMaster:** PHP VPS = $0 additional cost (best value)

### Migration Effort

**Time to migrate:**
- Netlify → PHP: 3-4 hours
- Netlify → Azure: 2-3 hours

**Changes needed:**
1. ✅ Rewrite functions (Node.js → PHP)
2. ✅ Setup VPS infrastructure
3. ✅ Configure web server (Apache/Nginx)
4. ✅ Setup SSL certificate
5. ✅ Update frontend API URLs
6. ✅ Update deployment workflow

**Code similarity:** ~70% identical logic

---

## Decision Matrix: Should You Migrate to PHP VPS?

### ✅ Migrate to PHP VPS if:

- [x] You already have a VPS (zero additional cost)
- [ ] You want to learn PHP backend development
- [ ] You want full server control
- [ ] You need no cold starts (always-warm server)
- [ ] You're comfortable with server administration
- [ ] You want to host multiple services on same VPS
- [ ] You prefer traditional server architecture
- [ ] You don't need global CDN distribution
- [ ] Cost is primary concern (beyond free tier)

### ❌ Stay with Netlify if:

- [x] Current setup works perfectly
- [x] You want zero maintenance
- [x] You prefer automatic scaling
- [x] You want simplest possible setup
- [x] You don't have a VPS
- [x] 125K requests/month is enough
- [x] You prefer serverless architecture
- [x] You want global CDN (faster worldwide)

**For QuizMaster learning project:**
- **Netlify** is perfect for simplicity
- **Azure** is great for enterprise learning
- **PHP VPS** is ideal if you have VPS and want to learn traditional backends

---

## Success Criteria

**Phase 3.4 is complete when:**

- ✅ VPS configured with PHP 8.1+
- ✅ Apache/Nginx configured with SSL (HTTPS)
- ✅ All three PHP endpoints implemented:
  - `generate-questions.php`
  - `generate-explanation.php`
  - `health-check.php`
- ✅ CORS configured correctly
- ✅ Environment variables (`.env`) configured securely
- ✅ API key protected (permissions, not in git)
- ✅ Local testing successful
- ✅ Production deployment successful
- ✅ Frontend can switch between Netlify/PHP via config
- ✅ All API calls work from deployed frontend
- ✅ Logs working (Apache, application logs)
- ✅ SSL certificate valid and auto-renewing
- ✅ (Optional) Rate limiting implemented
- ✅ (Optional) Automated deployment via GitHub Actions

**Verification checklist:**
```bash
# Test PHP endpoints
curl https://api.yourdomain.com/v1/health-check
# → Should return: {"status": "healthy", "platform": "php-vps"}

# Test from frontend
# 1. Set VITE_API_PROVIDER=php
# 2. Generate quiz
# 3. Check Network tab → calls go to api.yourdomain.com

# Check logs
tail -f /var/www/quizmaster-api/logs/api.log
# → Should show request logs

# Verify SSL
curl -I https://api.yourdomain.com/v1/health-check | grep -i "HTTP/2 200"
```

---

## Cost Estimate

**Monthly cost (assuming VPS already exists):**

**If VPS already paid:**
- Additional cost: **$0.00** ✨
- Bandwidth: Included in VPS plan
- SSL: Free (Let's Encrypt)
- **Total: $0/month**

**If buying new VPS:**
- DigitalOcean Droplet: $6/month (1GB RAM)
- Linode: $5/month (1GB RAM)
- Vultr: $6/month (1GB RAM)
- SSL: Free (Let's Encrypt)
- **Total: $5-6/month** (can host multiple apps)

**Comparison:**
- Netlify: $25/month after 125K requests
- Azure: ~$1/month after 1M requests
- PHP VPS: $0/month (if VPS exists) or $5/month (new VPS)

**For QuizMaster:** PHP VPS is most cost-effective long-term

---

## Next Steps

### After Completing Phase 3.4

**You'll have:**
- ✅ Multi-backend architecture (Netlify + PHP VPS)
- ✅ PHP backend development experience
- ✅ VPS management skills
- ✅ Zero additional hosting costs
- ✅ Always-warm server (no cold starts)
- ✅ Full infrastructure control

**Continue Epic 3:**
- Return to main path: Phase 2 (Offline), 3 (UI), 4 (Observability), 5 (Documentation), 6 (Validation)

**Future enhancements:**
- Add Redis caching layer
- Implement database for analytics
- Add Elasticsearch for logging
- Setup load balancer (if scaling)
- Add monitoring dashboard (Grafana)
- Implement queue system (for async processing)

---

## Troubleshooting

### PHP Errors

**Symptom:** "500 Internal Server Error"

**Fix:**
```bash
# Check PHP error log
tail -f /var/log/php8.1-fpm.log

# Check Apache error log
tail -f /var/www/quizmaster-api/logs/apache-error.log

# Enable debug mode temporarily
# In .env:
APP_DEBUG=true
```

### CORS Errors

**Symptom:** "Access blocked by CORS policy"

**Fix:**
```php
// Check .env CORS configuration
CORS_ALLOWED_ORIGINS=https://quizmaster.netlify.app

// Verify origin in src/cors.php
// Check Apache headers module enabled:
sudo a2enmod headers
sudo systemctl restart apache2
```

### SSL Certificate Issues

**Symptom:** "Certificate not valid"

**Fix:**
```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Force renewal (if near expiry)
sudo certbot renew --force-renewal
```

### Permission Errors

**Symptom:** "Permission denied" when writing logs

**Fix:**
```bash
cd /var/www/quizmaster-api
sudo chown -R www-data:www-data logs/
sudo chmod 755 logs/
sudo chmod 644 logs/*.log
```

### Slow API Responses

**Symptom:** Requests take >5 seconds

**Check:**
```bash
# Check server load
top
htop

# Check Claude API response time
# Add timing to logs in anthropic-client.php

# Check PHP memory limit
php -i | grep memory_limit
# Increase if needed in /etc/php/8.1/fpm/php.ini
```

---

## FAQ

**Q: Can I run both Netlify and PHP simultaneously?**
A: Yes! The frontend config supports switching. You could even implement automatic fallback.

**Q: Will this increase costs?**
A: No, if you already have a VPS. Otherwise, VPS costs $5-6/month but can host many apps.

**Q: Is PHP harder to deploy than Netlify?**
A: Yes, more initial setup (server config, SSL, etc.), but once configured, updates are simple.

**Q: Can I migrate back to Netlify?**
A: Yes! Keep both backends running and switch via environment variable.

**Q: Should I do this phase?**
A: Only if you have a VPS and want to learn traditional backend development. Netlify works great.

**Q: What about Azure vs PHP?**
A: Azure is serverless (like Netlify), PHP is traditional server. Azure = easier, PHP = more control + cheaper.

**Q: Do I need Composer?**
A: No, this implementation has zero dependencies. Composer is optional for future enhancements.

**Q: Can I use this with Docker?**
A: Absolutely! Dockerizing the PHP API would make deployment even easier.

---

## Related Documentation

- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 1 (Netlify Functions): `docs/epic03_quizmaster_v2/PHASE1_BACKEND.md`
- Phase 7 (Azure Migration): `docs/parking_lot/PHASE7_AZURE_MIGRATION.md`
- Testing Guide: `docs/epic03_quizmaster_v2/TESTING_AND_DEPLOYMENT_GUIDE.md`

---

## Additional Resources

**PHP Documentation:**
- [PHP Manual](https://www.php.net/manual/en/)
- [PHP cURL](https://www.php.net/manual/en/book.curl.php)
- [PHP JSON](https://www.php.net/manual/en/book.json.php)

**Server Configuration:**
- [Apache mod_rewrite](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [Nginx PHP FastCGI](https://www.nginx.com/resources/wiki/start/topics/examples/phpfcgi/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)

**VPS Providers:**
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Linode Guides](https://www.linode.com/docs/)
- [Vultr Documentation](https://www.vultr.com/docs/)

---

**Last Updated:** 2025-11-26
**Status:** Optional Phase - Implement if you have a VPS and want backend PHP experience

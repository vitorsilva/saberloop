Does openrouter have an api to create new accounts? I would like to integrate the creation of openroute accounts into a mobile app so that a user can start using the llms provided by openroute easily

Looking into this for you, Vitor.Based on my research, here's what I found:

**OpenRouter does NOT have an API to create new user accounts programmatically.** However, they offer a solution that achieves what you're looking for through a different approach.

## What OpenRouter Provides

### OAuth PKCE Flow (Recommended for Your Use Case)

Users can connect to OpenRouter in one click using Proof Key for Code Exchange (PKCE). To start the PKCE flow, send your user to OpenRouter's `/auth` URL with a `callback_url` parameter pointing back to your site. Your user will be prompted to log in to OpenRouter and authorize your app. After authorization, they will be redirected back to your site with a code parameter in the URL.

This means your mobile app can:
1. Open a browser/webview to OpenRouter's auth page
2. The user creates an account or logs in directly on OpenRouter
3. They authorize your app
4. They're redirected back to your app with an authorization code
5. Your app exchanges that code for an API key

Then use it to make an API call to `https://openrouter.ai/api/v1/auth/keys` to exchange the code for a user-controlled API key. Store the API key securely within the user's browser or in your own database, and use it to make OpenRouter requests.

### Provisioning API Keys (For Your Own Sub-Keys)

OpenRouter provides endpoints to programmatically manage your API keys, enabling key creation and management for applications that need to distribute or rotate keys automatically. Provisioning keys cannot be used to make API calls to OpenRouter's completion endpoints - they are exclusively for key management operations.

This is for creating sub-keys under **your own account**, not for creating new user accounts.

## Recommended Approach for Your Mobile App

The OAuth PKCE flow is what you want. It's the standard pattern for mobile apps integrating with OpenRouter, as highlighted by a problem with building small LLM-based applications and demos. With credit-limited API keys, we can ask the user to provide us with an API key with the limit of their choosing (say, $1 or even $0.10), and they can be sure that we won't cost them any more than that.

Would you like me to outline the implementation steps for integrating the PKCE flow into a mobile app?

Does openroute have some kind of affiliates program to promote adding new users to openroute?

Based on my research, **OpenRouter does not appear to have a public affiliate or referral program** for promoting new user sign-ups.

## What I Found

There's no mention of an affiliate or referral program in OpenRouter's official documentation, FAQ, or website. The search results only show third-party integration platforms (like Pabbly and Pipedream) that have their own affiliate programs, not OpenRouter itself.

## OpenRouter's Business Model

OpenRouter operates as a B2B API platform with a usage-based monetization model, taking a 5% commission on all inference spend that flows through its router. Their revenue comes directly from API usage rather than from acquiring new users through affiliates.

## Alternative Approaches for Your Mobile App

Since there's no affiliate program, here are some options to consider:

1. **Use OAuth PKCE** (as discussed earlier) to let users sign up/log in directly through OpenRouter and get an API key. This gives them a seamless experience even without you earning commission.

2. **Contact OpenRouter directly** — Given their recent funding (in February 2025, the company raised a $12.5 million seed round led by Andreessen Horowitz, followed by a $28 million Series A round in April 2025 led by Menlo Ventures), they may be open to partnership discussions for apps that would drive significant volume. You could reach out via their Discord or email.

3. **Enterprise partnership** — As spend reaches $100s of thousands, OpenRouter can help you find discounts on inference, via their relationships with 50+ providers. If your app drives significant traffic, you might negotiate a custom arrangement.

Would you like help drafting a partnership inquiry to OpenRouter?

I've noticed that openroute provides access to some free llms and my goal is to use that as the basis for the users to start using the app without having to pay for the llm. I'm not thinking of doing that to monetize my app that revenue will probably have to come from other places like in app ads (which i dont really like).
Do you think openrouter free tiers would suffice for moderate usage? How lfar would it take the hser in their journey using the app. 
And what other monetization alternatives would you imagine?

Great question, Vitor. Let me dig into OpenRouter's free tier limitations and then we can brainstorm monetization strategies that align with your values.Now I have a clear picture. Let me summarize this for you.

## OpenRouter Free Tier Analysis

### Rate Limits

| User Type | Daily Requests | Per Minute |
|-----------|---------------|------------|
| Free users (no purchase) | 50 requests/day | 20 requests/minute |
| Users with $10+ credits | 1000 requests/day | 20 requests/minute |

### Important Caveats

Free-tier usage of popular models is subject to rate limiting by the provider, especially during peak times. When this happens, you'll typically see a 429 Too Many Requests error. Failed attempts still count toward your daily quota.

Using Free Models REQUIRES Opting-In to Data Training. This is something you'd need to disclose to your users.

### Available Free Models

The free tier includes surprisingly capable models: beloved models such as DeepSeek V3 and DeepSeek R1 will continue to be available under similar free conditions for the foreseeable future. There's also Llama 4 Maverick (400B parameters, 256K context), Mistral Small 3.1 (24B parameters, multimodal), and various Google Gemini models.

---

## Would 50 Requests/Day Suffice?

**It depends heavily on your app's use case:**

| Use Case | Requests/Session | Days of Usage |
|----------|-----------------|---------------|
| Simple Q&A chatbot | 5-10 | ~5-10 days |
| Writing assistant | 10-20 | ~2-5 days |
| Code helper with iterations | 20-50 | 1-2 days |
| Agentic workflows | 50+ | Less than 1 day |

**Realistic assessment:** 50 requests/day is enough for a user to *try* your app and see value, but not enough for regular daily use. It's essentially a trial tier. A moderately engaged user would hit the limit within their first or second session.

The 1000 requests/day tier (requiring a $10 purchase on OpenRouter) is much more usable for regular engagement.

---

## Monetization Alternatives (Beyond Ads)

Since you mentioned not liking in-app ads, here are alternatives that might fit better:

### 1. **Freemium with Credit Purchases**
Let users start free, then offer in-app purchases for OpenRouter credits. You'd use the OAuth PKCE flow, and users would add credits directly to their OpenRouter account. Your app becomes a nice interface, and users pay OpenRouter directly. You earn nothing directly but have no costs either.

### 2. **Premium Features (Not LLM Access)**
Keep the LLM free, but charge for:
- Conversation history sync across devices
- Export features (PDF, markdown)
- Custom prompts/personas library
- Offline mode (cached responses)
- Priority support

### 3. **Subscription for Higher Limits**
You subsidize OpenRouter credits:
- Free: 50 requests/day (OpenRouter free tier)
- €2.99/month: 500 requests/day (you buy credits in bulk)
- €7.99/month: Unlimited (within reason)

### 4. **One-Time Purchase**
"Lifetime" or "Pro" version for €9.99-19.99 that unlocks premium features. Works well for productivity apps.

### 5. **Tip Jar / Patronage**
Add a "Buy me a coffee" style option. Works surprisingly well for indie apps with engaged users, especially if you're transparent about being a solo developer.

### 6. **Affiliate Revenue from OpenRouter**
Even though OpenRouter doesn't have a formal affiliate program, you could negotiate one directly given that you'd be driving users to their platform. Worth reaching out.

### 7. **White-Label or B2B**
If the app solves a specific problem well, license it to businesses or offer a white-label version.

---

## My Recommendation

Given your situation, I'd suggest a hybrid approach:

1. **Start with pure free tier** — Let users authenticate via OAuth PKCE and use OpenRouter's free models with their own account
2. **Add premium features** (not LLM credits) as your monetization
3. **Be transparent** about the data training requirement for free models
4. **Consider a tip jar** for users who want to support you

This keeps your costs at zero, doesn't require ads, and lets users who want more either pay OpenRouter directly for credits or pay you for enhanced app features.

What kind of app are you building? Knowing the use case would help me refine these suggestions.

https://github.com/vitorsilva/demo-pwa-app/blob/main/product_info%2Fquiz-generator-exploration.md

Here is the description of the app i'm developing

Let me try fetching the raw content directly:I'm having trouble accessing the GitHub repository content. Could you paste the content of the `quiz-generator-exploration.md` file directly here? Or share the key points about your app concept?

From what I can infer from the filename, it seems like you're building a **quiz generator app** as a PWA. If that's the case, I can already start thinking about how this fits with the OpenRouter free tier:

**Quiz generation** would typically require:
- 1 LLM call per quiz generated (or per batch of questions)
- Possibly additional calls for explanations or hints

This could actually work quite well with the 50 requests/day limit if users generate a few quizzes per session rather than having constant back-and-forth chat.

But please share the document content so I can give you more specific feedback!

Why can you access? What error do you get? The repository is public...


You're right to question that. Let me try again and show you exactly what's happening:The error says: **"This URL cannot be fetched because it was not provided by the user nor did it appear in any search/fetch results"**

This is a restriction on my web_fetch tool — it can only fetch URLs that either:
1. The user explicitly provided in their message, OR
2. Appeared in search results

The issue is that your original URL had `%2F` (URL-encoded slash) in it:
```
https://github.com/vitorsilva/demo-pwa-app/blob/main/product_info%2Fquiz-generator-exploration.md
```

And I'm trying to fetch it with a normal slash:
```
https://github.com/vitorsilva/demo-pwa-app/blob/main/product_info/quiz-generator-exploration.md
```

The tool sees these as two different URLs, so it blocks my attempt. Let me try with the exact URL you provided:Now I can fetch it, but the problem is different: GitHub's blob view pages are heavily JavaScript-rendered, so the tool only gets the HTML shell, not the actual markdown content. The file content isn't in what was returned.

Let me try fetching the raw version using the exact format from your URL:No luck — the raw.githubusercontent.com domain wasn't in your original message, so it's blocked.

**Could you either:**
1. Paste the content directly here, or
2. Send me the raw URL: `https://raw.githubusercontent.com/vitorsilva/demo-pwa-app/main/product_info/quiz-generator-exploration.md`


Excellent! This is a very well-thought-out document, Vitor. Let me now give you a much more specific analysis based on your actual app concept.

---

## OpenRouter Free Tier Fit for QuizMaster

### LLM Requests Per User Session

Based on your V1 spec:

| Action | API Calls |
|--------|-----------|
| Generate 5 questions | 1 call |
| Generate explanation (per wrong answer) | 0-5 calls |
| **Typical session** | **2-4 calls** |

A user taking 2-3 quizzes per day would use **6-12 requests/day** — well within the 50/day limit.

### Verdict: The Free Tier Could Work Well

Unlike a chatbot with endless back-and-forth, your app has **discrete, bounded interactions**. This is actually a great fit for the free tier constraints:

- **Casual user** (1 quiz/day): ~3 requests → ✅ 50/day is plenty
- **Active student** (3-5 quizzes/day): ~15-25 requests → ✅ Still comfortable
- **Heavy cramming session** (10+ quizzes): ~30-50 requests → ⚠️ Might hit limits

The 1000/day tier (with $10 credit purchase) would cover even the most intense study sessions.

---

## How This Changes Your Architecture

Your current spec uses **BYOK (Bring Your Own Key)** with direct Anthropic API calls. Here's how OpenRouter OAuth would differ:

| Aspect | BYOK (Current) | OpenRouter OAuth |
|--------|----------------|------------------|
| **Onboarding friction** | High (get API key, paste it) | Low (OAuth login, one click) |
| **Target users** | Technical users | Anyone |
| **User cost** | Pay Anthropic directly | Free tier + optional credits |
| **Your cost** | Zero | Zero |
| **Model flexibility** | Anthropic only | 400+ models |
| **Privacy** | User controls key | Data may be used for training (free tier) |

**My recommendation:** Support both options:
1. **OpenRouter OAuth** as the default (low friction, free tier for testing)
2. **BYOK** as an advanced option for privacy-conscious users

---

## Monetization Ideas Specific to QuizMaster

Given your app structure and the fact that you don't want ads:

### 1. **Freemium Features** (Best Fit)

Free tier (OpenRouter free):
- 5 quizzes/day
- Basic topics
- Session history (local)

Premium (one-time €4.99 or €2.99/month):
- Unlimited quizzes
- Photo upload (V2)
- Spaced repetition scheduling
- Export quiz history (PDF/CSV)
- Cross-device sync
- Multiple user profiles (for your kids)

### 2. **Subject Packs** (Future V2+)

- "GCSE Physics Prep" — €1.99
- "Portuguese History" — €1.99
- Curated, high-quality question banks that supplement AI generation

### 3. **Family Plan**

Since your primary users are your kids:
- €9.99 one-time for "Family Edition"
- Multiple profiles, shared progress dashboard for parents

### 4. **Tip Jar**

Add a simple "Support the developer" option:
- "If QuizMaster helped your kids study, consider buying me a coffee"
- Works surprisingly well for indie educational apps

---

## Addressing Your Open Questions

### "What makes this different from just using Claude directly?"

Your document already nails this, but for the OpenRouter context:

1. **Structure** — Persistent progress tracking vs. ephemeral chat
2. **Automation** — Spaced repetition happens without user effort
3. **Focus** — Purpose-built UI vs. general chat interface
4. **Lower friction** — OpenRouter OAuth means no API key setup
5. **Free access** — Users can start without paying anything

### "How do we prevent gaming the assessment?"

The free tier actually helps here — if someone is gaming, they're burning through their 50 requests/day on meaningless quizzes. Real learners will use it more thoughtfully.

---

## Suggested Technical Changes

```
Current: Browser → Anthropic API (BYOK)

Proposed: Browser → OpenRouter API
          ├── OAuth PKCE for auth
          ├── Free tier models (DeepSeek, Llama, Gemini)
          └── Fallback to Claude if user adds credits
```

### Model Selection Strategy

For quiz generation, you don't necessarily need Claude Sonnet. Consider:

| Model | Cost | Quality for Quiz Gen |
|-------|------|---------------------|
| DeepSeek V3 (free) | $0 | Excellent for structured JSON output |
| Llama 4 Maverick (free) | $0 | Good general purpose |
| Gemini 2.0 Flash (free) | $0 | Fast, good for simple quizzes |
| Claude Sonnet | ~$3/M tokens | Premium quality |

You could default to free models and let users upgrade to Claude for "premium quiz quality."

---

## Summary Recommendation

1. **Keep your V1 simple** — Use OpenRouter with free models instead of BYOK
2. **OAuth onboarding** — Much lower friction than API key setup
3. **Free tier is sufficient** — 50 requests/day covers casual to moderate use
4. **Monetize with features, not LLM access** — Premium features like photo upload, spaced repetition, family profiles
5. **Support BYOK as advanced option** — For power users who want privacy or specific models

Would you like me to sketch out the OAuth integration flow for your PWA, or help you think through the prompt templates for quiz generation with free models?

I'm storing the quizzes locally so that i can replay them without having to consume additional tokens and also to allow for offline usage. Do i need to take in consideration anything related to copyright laws as i'm reusing content that was generated by other machines/services

Great question, Vitor. This touches on an area that's still evolving legally, but let me break down what we know.

## The Short Answer

For your use case — **storing AI-generated quizzes locally for personal replay** — you're almost certainly fine. But let me explain the nuances.

---

## Copyright & AI-Generated Content

### Who Owns AI Output?

This varies by jurisdiction, but the general trend:

**United States:** The US Copyright Office has ruled that purely AI-generated content without meaningful human creative input cannot be copyrighted. This means:
- The AI provider (OpenRouter, Anthropic, OpenAI) doesn't own the output
- But neither do you automatically own copyright on raw AI output
- Human creative contribution (your prompts, curation, editing) may establish your rights

**European Union:** Similar uncertainty. The EU generally requires human authorship for copyright protection. AI-generated content falls into a grey area.

**Practical implication:** The quiz content exists in a sort of public domain limbo — nobody clearly owns it, which means nobody can really sue you for reusing it.

---

## What the Terms of Service Say

This is more relevant than copyright law for your situation:

### OpenRouter's Terms

OpenRouter is a pass-through service. The terms that matter are from the underlying model providers. Generally:

- **You own your outputs** — Most providers (Anthropic, OpenAI, Meta, Google) grant you rights to use the outputs
- **No restrictions on storage** — Storing for personal/commercial use is allowed
- **No restrictions on replay** — Re-displaying content you generated is fine

### Anthropic's Terms (for reference)

Anthropic's usage policy explicitly states that users retain rights to their outputs and can use them for commercial purposes.

---

## Specific Concerns for QuizMaster

### 1. **Storing and Replaying Your Own Generated Content**

✅ **No issue.** You prompted the model, you received the output, you're storing it for your own app's users. This is the intended use case.

### 2. **The Content Itself (Facts, Questions)**

Quiz questions about "Portuguese history" or "photosynthesis" are based on factual information. Facts themselves aren't copyrightable — only the specific creative expression of them.

- "What year did Portugal join the EU?" — Not copyrightable (fact)
- A unique, creatively-worded explanation — Potentially copyrightable, but you/the AI generated it

### 3. **If the AI Reproduces Copyrighted Material**

This is the one edge case to consider. If you ask the AI to generate a quiz about a specific copyrighted work (e.g., "Quiz me on Harry Potter"), the AI might:
- Generate questions that are fine (testing comprehension)
- Accidentally reproduce copyrighted text (direct quotes)

**Mitigation:** Your prompts should ask for original questions, not reproduction of source material. For educational fair use, quiz questions *about* copyrighted works are generally fine.

---

## What You Should Do

### 1. **Add a Simple Disclaimer** (Optional but Professional)

In your app's about/settings page:

> "Quiz content is generated by AI and stored locally on your device. Questions are for educational purposes only."

### 2. **Don't Worry About Model Provider Copyright Claims**

None of the major providers (Anthropic, OpenAI, Google, Meta, DeepSeek) claim copyright over outputs or restrict storage/replay.

### 3. **Be Careful with Verbatim Reproduction Requests**

If users can input topics, avoid generating quizzes that might reproduce copyrighted content verbatim. Your current prompt strategy (generating original questions) is already safe.

### 4. **Consider Attribution for Free Models**

Some free models on OpenRouter (especially experimental/cloaked ones) have terms that data may be logged for training. This doesn't affect your right to store the output — just be aware that your prompts might be seen by the provider.

---

## Summary

| Concern | Risk Level | Action Needed |
|---------|------------|---------------|
| Storing AI-generated quizzes locally | ✅ None | None |
| Replaying without new API calls | ✅ None | None |
| Offline usage of stored content | ✅ None | None |
| Copyright on the quiz content | ✅ Very low | None (facts aren't copyrightable) |
| AI reproducing copyrighted text | ⚠️ Low | Prompt design (ask for original content) |
| Terms of Service compliance | ✅ None | You're using outputs as intended |

**Bottom line:** Store away. Your architecture decision is sound both technically and legally. The AI providers *want* you to use the outputs — that's the whole point of the service.

Is there a specific scenario you're worried about, like quizzes based on specific textbooks or copyrighted educational materials?

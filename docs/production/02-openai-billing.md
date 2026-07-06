# OpenAI Billing — Setup Guide

## Current Status
- **OpenAI API key**: Valid ✅ (key authenticates correctly)
- **Quota**: Exceeded ❌ (returns `429 insufficient_quota`)
- **Fallback**: Working ✅ — AI Assistant replies with graceful fallback messages when quota exceeded
- **AI tests**: 14/14 pass with fallback replies

## Steps to Activate Live AI Responses

### 1. Log In to OpenAI Platform
- Go to https://platform.openai.com
- Use the account associated with the API key

### 2. Navigate to Billing
- https://platform.openai.com/settings/organization/billing
- Or: Click your profile icon (top-right) → **Organization** → **Billing**

### 3. Add Payment Method
- Click **Add payment method**
- Enter credit card details
- Recommended: Set up **Usage alerts** ($10, $50, $100 thresholds) to avoid surprises

### 4. Add Credits or Set Up Auto-recharge
- **Pay-as-you-go**: No minimum commit; you're billed monthly for usage
- **Prepaid**: Add credits manually (good for controlled spending)
- Recommendation: Add $20–$50 to start; at ~$0.15/1M input tokens + $0.60/1M output tokens (gpt-4o-mini), this covers thousands of conversations

### 5. Verify Activation
After billing is set up (may take 1–2 minutes to propagate):
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'
```
Expected: `200 OK` with a response. Previously: `429 insufficient_quota`.

### 6. Restart Dev Server
```bash
# The app caches OpenAI availability; restart to recheck
npm run dev
```

### 7. Test Live AI Assistant
- Visit any product page
- Open the AI chat widget (bottom-right)
- Ask: "Tell me about this product"
- Expected: Context-aware response using product data from Sanity + Prisma

## Cost Estimates (gpt-4o-mini)
- **Input**: $0.15 per 1M tokens (~750K words)
- **Output**: $0.60 per 1M tokens (~750K words)
- **Average conversation**: ~2K tokens → ~$0.001 per chat
- **10,000 conversations/month**: ~$10

## Fallback Behavior
If billing is not set up:
- AI Assistant still functions — returns contextual fallback messages
- Handoff detection (pre-AI) still works — detects trigger phrases like "talk to support"
- Product suggestions still render in chat widget
- No errors or broken UI

## Relevant Files
- `src/lib/ai/client.ts` — OpenAI client with fallback
- `src/lib/ai/config.ts` — Model/config settings
- `src/app/api/ai/chat/route.ts` — Chat endpoint with pre-AI handoff + fallback
- `src/components/ai/ai-chat-widget-wrapper.tsx` — Chat widget integration

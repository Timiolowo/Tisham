# Groq AI Integration Setup Guide

## Overview
Teacher Copilot now uses Groq AI for real-time chat responses, lesson generation, and content simplification. Groq provides ultra-fast LLM inference with the Llama 3.3 model.

## Features Powered by Groq AI
- ✅ **Copilot Chat** - Real-time conversational AI assistance
- 🔄 **Lesson Generation** - AI-powered lesson plans (coming soon)
- 📝 **Content Simplification** - Translate and simplify content (coming soon)
- 🎯 **Quiz Generation** - Create assessments automatically (coming soon)

## Setup Instructions

### Step 1: Get Your Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account (no credit card required)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your API key (starts with `gsk_...`)

### Step 2: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace `your_groq_api_key_here` with your actual API key:

```env
VITE_GROQ_API_KEY=gsk_your_actual_key_here
```

3. Save the file

### Step 3: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Testing the Integration

### 1. Test the Copilot Chat

1. Navigate to the **Teacher Dashboard**
2. Click on **Copilot Chat** in the sidebar
3. Try these test prompts:
   - "Explain photosynthesis to JSS 2 students"
   - "Create a lesson plan about Nigerian independence"
   - "Suggest 3 activities for teaching algebra"

### 2. Expected Behavior

**✅ Success:**
- AI responds within 2-3 seconds
- Responses are contextual and educational
- Nigerian examples are included
- Format includes emojis and clear structure

**❌ Error - API Key Not Configured:**
- You'll see: "⚠️ AI service is not configured..."
- Solution: Check your `.env` file has the correct API key

**❌ Error - Network Issue:**
- You'll see: "I'm having trouble connecting..."
- Solution: Check your internet connection

## Available AI Functions

The integration provides several functions in `/lib/groq.ts`:

### 1. `generateTeachingResponse()`
Main chat function with Nigerian education context.

```typescript
const response = await generateTeachingResponse(
  "Explain robotics",
  conversationHistory
);
```

### 2. `generateLessonPlan()`
Create full lesson plans.

```typescript
const lesson = await generateLessonPlan(
  "Photosynthesis",
  "Biology",
  "JSS 3",
  40, // duration in minutes
  "Focus on local plants"
);
```

### 3. `simplifyContent()`
Simplify or translate educational content.

```typescript
const simplified = await simplifyContent(
  content,
  'simple',
  'Hausa'
);
```

### 4. `generateQuiz()`
Create assessment questions.

```typescript
const quiz = await generateQuiz(
  "Nigerian History",
  5, // number of questions
  'medium'
);
```

### 5. `explainConcept()`
Explain concepts for students.

```typescript
const explanation = await explainConcept(
  "Algebra",
  "JSS 3"
);
```

## Model Information

**Default Model:** `llama-3.3-70b-versatile`
- Ultra-fast inference (500+ tokens/second)
- High-quality responses
- Strong reasoning capabilities
- Optimized for educational content

**Alternative Models Available:**
- `llama-3.1-8b-instant` - Fastest, good for simple queries
- `mixtral-8x7b-32768` - Larger context window
- `gemma2-9b-it` - Good for creative tasks

## Rate Limits (Free Tier)

- **Requests:** 30 requests/minute
- **Tokens:** 6,000 tokens/minute
- **Daily:** 14,400 requests/day

This is more than sufficient for typical classroom use!

## Customization

### Adjust AI Temperature
In `/lib/groq.ts`, modify the temperature parameter:

```typescript
temperature: 0.7  // Default (balanced)
// 0.3 - More focused and deterministic
// 0.9 - More creative and varied
```

### Change System Prompt
Edit the system prompt in `generateTeachingResponse()` to customize AI behavior:

```typescript
const systemPrompt = {
  role: 'system',
  content: `Your custom instructions here...`
};
```

## Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'VITE_GROQ_API_KEY')"
**Solution:**
- Create the `.env` file in your project root (same folder as App.tsx)
- Make sure the file is named exactly `.env` (not `.env.txt`)
- Restart your development server completely
- Clear browser cache and reload

### Issue: "API key is not configured"
**Solution:** 
- Check `.env` file exists in project root
- Verify API key is correct (starts with `gsk_`)
- Restart dev server after changes
- Use the exact format: `VITE_GROQ_API_KEY=gsk_your_key_here` (no spaces, no quotes)

### Issue: "Failed to get AI response"
**Solution:**
- Check internet connection
- Verify API key is valid (not expired)
- Check Groq service status at [status.groq.com](https://status.groq.com)

### Issue: Slow responses
**Solution:**
- Check your internet speed
- Try a faster model: `llama-3.1-8b-instant`
- Reduce max_tokens in API calls

### Issue: Rate limit exceeded
**Solution:**
- Wait 60 seconds between requests
- Implement request queue
- Upgrade to paid plan if needed

## Security Best Practices

1. ✅ **Never commit `.env` file to Git**
   - Already in `.gitignore`
   
2. ✅ **Use environment variables**
   - API key loaded from `import.meta.env.VITE_GROQ_API_KEY`
   
3. ✅ **Client-side API calls are okay for this use case**
   - Educational app with rate limits
   - No sensitive user data being sent
   - API key is for development/demo purposes

4. ⚠️ **For Production:**
   - Use a backend proxy to hide API keys
   - Implement user authentication
   - Add rate limiting per user
   - Monitor API usage

## Next Steps

Once Groq AI is working in the Copilot Chat:

1. ✅ **Integrate with Lesson Generator**
   - Replace mock data with AI-generated lessons
   
2. ✅ **Enhance Assessment Generator**
   - Generate quiz questions with AI
   
3. ✅ **Add to Learn with AI**
   - Make concept explanations dynamic
   
4. ✅ **Implement Translation**
   - Real-time translation to Yoruba, Hausa, Igbo

## Support

- **Groq Documentation:** [groq.com/docs](https://console.groq.com/docs)
- **Community:** [groq.com/community](https://groq.com/community)
- **Issues:** Check your browser console for detailed error messages

## Cost Information

**Free Tier:**
- Completely free
- No credit card required
- Perfect for development and classroom use

**Paid Tier:**
- Pay-as-you-go pricing
- $0.10 per 1M tokens (input)
- $0.10 per 1M tokens (output)
- Very affordable for production use

---

**That's it!** Your Teacher Copilot is now powered by real AI. Test it out in the Copilot Chat! 🚀

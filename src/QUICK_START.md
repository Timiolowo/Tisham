# Quick Start Guide - Teacher Copilot

## ⚡ Get AI Working in 2 Minutes

### Error: "Cannot read properties of undefined"?

This means you need to add your Groq API key. Here's how:

### Step 1: Get API Key (1 minute)
1. Go to https://console.groq.com/keys
2. Sign up (free, no credit card)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)

### Step 2: Create .env File (30 seconds)
1. In your project root folder (same folder as App.tsx), create a file named `.env`
2. Add this line:
```
VITE_GROQ_API_KEY=gsk_paste_your_key_here
```

### Step 3: Restart (30 seconds)
1. Stop the server (Ctrl+C in terminal)
2. Start again: `npm run dev`
3. Reload the browser

### ✅ Done!
Go to Dashboard → Copilot Chat and try:
- "Explain photosynthesis to JSS 2 students"
- "Create a lesson plan about fractions"

---

## Common Issues

**Error still showing?**
- Check file name is exactly `.env` (not `.env.txt`)
- Check file is in project root (same folder as package.json)
- Check no spaces around the `=` sign
- Restart server completely

**Can't find .env file?**
- It might be hidden
- On Mac/Linux: `ls -la` to see hidden files
- On Windows: Enable "Show hidden files" in File Explorer

---

## Need Help?
See full guide: `GROQ_SETUP.md`

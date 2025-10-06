# 🚀 Quick Deploy - Teacher Copilot

## ⚡ 10-Minute Full Deployment

### **Step 1: Supabase Setup (5 min)**

```bash
1. Go to https://supabase.com → Sign up (FREE)
2. Create new project → Wait 2 min
3. Go to SQL Editor → New Query
4. Copy content from /supabase/schema.sql
5. Paste → Click "Run" → Wait for success ✅
6. Go to Settings → API → Copy:
   - Project URL
   - anon public key
```

### **Step 2: Netlify Deploy (5 min)**

```bash
# Commit changes
git add .
git commit -m "Production ready"
git push origin main

# Deploy
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import from Git"
3. Select your GitHub repo
4. Netlify auto-detects settings ✅
5. Before deploy, add Environment Variables:
   - VITE_SUPABASE_URL = (your URL from Step 1)
   - VITE_SUPABASE_ANON_KEY = (your key from Step 1)
   - VITE_GROQ_API_KEY = (optional, for AI)
6. Click "Deploy site"
7. Wait 2-3 minutes
8. Done! 🎉
```

### **Step 3: Test Your Deployment**

```
1. Open your Netlify URL: https://your-app.netlify.app
2. Click "Login" → Enter any email
3. Select "Student" role → Login
4. See My Lessons → Click "Learn with AI"
5. Complete a section → Answer mini quiz
6. Check Supabase Dashboard → Table Editor → quiz_results
7. You should see your result saved! ✅
```

---

## 📋 Environment Variables

**Copy these to Netlify:**

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GROQ_API_KEY=gsk_... (optional)
```

**Where to find them:**
- Supabase URL & Key: Supabase Dashboard → Settings → API
- Groq Key: https://console.groq.com/keys (free)

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Got Supabase URL and anon key
- [ ] Pushed code to GitHub
- [ ] Connected repo to Netlify
- [ ] Added environment variables in Netlify
- [ ] Deployed successfully
- [ ] Site loads on Netlify URL
- [ ] Tested student login
- [ ] Tested "Learn with AI"
- [ ] Verified data saves to Supabase

---

## 🎯 What You Get

✅ **Live app** at your-app.netlify.app  
✅ **Cloud database** storing student progress  
✅ **Real-time chat** infrastructure  
✅ **Leaderboards** with live rankings  
✅ **XP tracking** across all students  
✅ **Analytics** via Supabase dashboard  
✅ **Auto-deploy** on every git push  
✅ **Free hosting** (Netlify + Supabase free tiers)  
✅ **HTTPS/SSL** automatically  
✅ **Global CDN** for fast loading  

---

## 🐛 Troubleshooting

### "Build failed on Netlify"
```bash
# Check build logs in Netlify
# Usually missing dependency - add to package.json
npm install @supabase/supabase-js
git push
```

### "Can't connect to Supabase"
```bash
# Verify env vars in Netlify
# Check Supabase project is running
# Restart deployment
```

### "Data not saving"
```bash
# Check browser console for errors
# Verify schema.sql ran successfully
# Check Supabase → Table Editor → tables exist
```

---

## 📞 Quick Support

- **Netlify Issues:** https://answers.netlify.com
- **Supabase Issues:** https://discord.supabase.com
- **Review docs:** Check all .md files in project root

---

## 🎉 That's It!

You now have a fully deployed, cloud-backed, production-ready Teacher Copilot platform!

**Share your Netlify URL with Nigerian schools and teachers!** 🇳🇬📚✨

---

**Time to deploy:** ~10 minutes  
**Cost:** FREE (both tiers)  
**Scalability:** Up to 500 students on free tier  
**Status:** Production ready 🚀

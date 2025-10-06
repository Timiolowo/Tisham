# Netlify Deployment Guide for Teacher Copilot

## 🚀 Quick Deploy to Netlify

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and select your repository
   - Netlify will auto-detect settings from `netlify.toml`

3. **Add Environment Variables** (Optional - for AI features)
   - In Netlify Dashboard → Site settings → Environment variables
   - Add: `VITE_GROQ_API_KEY` = `your_groq_api_key_here`
   - Click "Deploy"

4. **Done!** 🎉
   - Your app will be live at `your-app-name.netlify.app`
   - Auto-deploys on every push to main

---

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Your App**
   ```bash
   npm run build
   ```

3. **Login to Netlify**
   ```bash
   netlify login
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Add Environment Variables**
   ```bash
   netlify env:set VITE_GROQ_API_KEY your_key_here
   ```

---

### Option 3: Drag and Drop Deploy

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Go to Netlify**
   - Visit [https://app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `dist` folder onto the page
   - Done! (But no auto-deploys)

---

## ⚙️ Configuration

The `netlify.toml` file is already configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

This ensures:
- ✅ Correct build command
- ✅ Proper SPA routing (all routes go to index.html)
- ✅ Node 18 compatibility

---

## 🔐 Environment Variables

### For AI Features (Optional):

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GROQ_API_KEY` | Groq AI API key for chatbot | No (works in demo mode without) |

**How to Add in Netlify:**
1. Site Settings → Environment variables
2. Add key-value pairs
3. Redeploy site

---

## 🛠️ Build Settings

If Netlify doesn't auto-detect settings:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 or higher

---

## 📱 Custom Domain (Optional)

1. Go to Netlify Dashboard → Domain settings
2. Click "Add custom domain"
3. Follow instructions to configure DNS
4. SSL automatically provisioned!

---

## 🔄 Continuous Deployment

### Automatic Deploys:
- Every push to `main` branch → Auto-deploy
- Pull requests → Deploy previews
- Rollback to any previous deploy with one click

### Deploy Contexts:
```toml
[context.production]
  command = "npm run build"

[context.deploy-preview]
  command = "npm run build"

[context.branch-deploy]
  command = "npm run build"
```

---

## 🐛 Troubleshooting

### Build Fails:

**Problem:** "Command not found: npm"
**Solution:** Ensure Node version is set to 18+ in Netlify settings

**Problem:** Build exceeds time limit
**Solution:** Reduce dependencies or upgrade Netlify plan

**Problem:** Module not found errors
**Solution:** Clear build cache in Netlify and redeploy

### Routing Issues:

**Problem:** 404 on refresh
**Solution:** `netlify.toml` has redirect rules - make sure it's in root

**Problem:** Assets not loading
**Solution:** Check publish directory is set to `dist`

### Environment Variables:

**Problem:** AI features not working
**Solution:** Add `VITE_GROQ_API_KEY` in Netlify environment variables

**Problem:** Changes not reflecting
**Solution:** Redeploy after adding environment variables

---

## 📊 Deployment Checklist

Before deploying:

- [ ] Run `npm run build` locally to test
- [ ] Check all environment variables are set
- [ ] Test the built app: `npm run preview`
- [ ] Verify `netlify.toml` is in project root
- [ ] Check package.json has correct build scripts
- [ ] Ensure no hardcoded localhost URLs
- [ ] Test on mobile viewport
- [ ] Verify all routes work

---

## 🎯 Post-Deployment

### Monitor Your App:

1. **Analytics**
   - Enable Netlify Analytics (paid feature)
   - Or use Google Analytics

2. **Forms** (if added later)
   - Netlify Forms work automatically
   - See submissions in dashboard

3. **Functions** (if added later)
   - Serverless functions supported
   - Place in `/netlify/functions/`

### Performance:

- ✅ Auto CDN distribution
- ✅ Auto HTTPS/SSL
- ✅ Brotli compression
- ✅ Asset optimization
- ✅ Deploy previews
- ✅ Instant rollbacks

---

## 🚨 Important Notes

### Do NOT Commit:
- `.env` file (contains secrets)
- `node_modules/` folder
- `dist/` folder (build output)

### DO Commit:
- `netlify.toml` (deployment config)
- `.env.example` (template for others)
- All source code

### Security:
- Never hardcode API keys in code
- Use environment variables for secrets
- Groq API key should be in Netlify env vars

---

## 💡 Best Practices

1. **Use Git Branches**
   - `main` → Production
   - `develop` → Staging (if needed)
   - Feature branches → Deploy previews

2. **Test Deploy Previews**
   - Every PR gets a unique URL
   - Test before merging to main

3. **Monitor Build Times**
   - Keep under 15 min (free tier limit)
   - Optimize dependencies if needed

4. **Use Netlify's Features**
   - Forms, Functions, Identity
   - Split testing
   - Deploy notifications

---

## 📞 Support

### Netlify Resources:
- [Netlify Docs](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)
- [Netlify Status](https://www.netlifystatus.com)

### Project Support:
- Check `QUICK_START.md` for app setup
- Check `GROQ_SETUP.md` for AI setup
- Check `LEARN_WITH_AI_GUIDE.md` for features

---

## ✅ Success!

Your Teacher Copilot app should now be deployed and accessible worldwide! 🌍

**Default URL:** `https://your-site-name.netlify.app`

**Features Working:**
- ✅ Login/Registration
- ✅ Teacher Dashboard
- ✅ Student Dashboard
- ✅ Lesson Generator
- ✅ Learn with AI
- ✅ Class Chat
- ✅ Concept Explorer
- ✅ All gamification features
- ✅ Dark/Light theme
- ✅ Mobile responsive

**Share your deployed app with Nigerian teachers and students!** 🇳🇬🎓🚀

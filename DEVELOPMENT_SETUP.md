# 🚀 TeachMate Development Setup Guide

## 🔧 **Quick Fix for "supabaseUrl is required" Error**

The error occurs because environment variables aren't loaded properly. Here's how to fix it:

## 📋 **Step 1: Create/Update .env File**

Create a `.env` file in your project root with these variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Groq API Key (for AI features)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Site URL for redirects
SITE_URL=http://localhost:8888
```

## 🎯 **Step 2: Get Your Supabase Credentials**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings > API**
4. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `VITE_SUPABASE_SERVICE_ROLE_KEY`

## 🤖 **Step 3: Get Your Groq API Key**

1. Go to [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Copy the key → `VITE_GROQ_API_KEY`

## 🚀 **Step 4: Start Development**

### **Option A: Full Stack Development (Recommended)**
```bash
netlify dev
```
- Opens: `http://localhost:8888`
- Includes: Authentication, AI features, Database
- **Use this for complete functionality**

### **Option B: Frontend Only**
```bash
npm run dev
```
- Opens: `http://localhost:5173`
- Limited: No authentication, no AI features
- **Use this for UI development only**

## ✅ **Step 5: Verify Setup**

1. Open your browser to `http://localhost:8888`
2. Try to register a new account
3. Check browser console for any errors
4. Test AI features (if Groq API key is configured)

## 🛠️ **Troubleshooting**

### **Error: "supabaseUrl is required"**
- ✅ Check your `.env` file exists
- ✅ Verify `VITE_SUPABASE_URL` is set correctly
- ✅ Restart the development server

### **Error: "Groq API key is not configured"**
- ✅ Check your `.env` file has `VITE_GROQ_API_KEY`
- ✅ Verify the key is valid
- ✅ Restart the development server

### **Error: "Functions not working"**
- ✅ Use `netlify dev` instead of `npm run dev`
- ✅ Check Netlify CLI is installed: `npm install -g netlify-cli`

## 🎯 **For Your Hackathon**

**Always use `netlify dev`** for your Datafeast 2025 project because:
- ✅ Complete functionality
- ✅ Authentication works
- ✅ AI features work
- ✅ Database operations work
- ✅ Real-time features work

## 🚀 **Quick Start Commands**

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with your credentials
# (Copy the template above)

# 3. Start full-stack development
netlify dev

# 4. Open http://localhost:8888
```

## 🎉 **You're Ready!**

Once you've set up your `.env` file with the correct credentials, your TeachMate project will work perfectly for your hackathon! 🚀

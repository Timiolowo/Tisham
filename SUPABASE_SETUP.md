# Supabase Setup Guide

## 🔧 Authentication Setup

To make authentication work perfectly, you need to set up Supabase:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `tisham`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users

### 2. Get Your Credentials

After creating the project:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...` - **KEEP THIS SECRET!**)

### 3. Set Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ Important:** The service role key is secret and should never be exposed in frontend code. For production, use Netlify Functions with server-side environment variables.

### 4. Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `src/supabase/schema_simplified.sql`
3. Paste and run the SQL script
4. This will create all necessary tables and functions

### 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. **IMPORTANT**: Under **Email Auth**, make sure:
   - ✅ **Enable email confirmations** is checked
   - ✅ **Enable email change confirmations** is checked
4. Set **Site URL** to your domain (e.g., `https://your-app.netlify.app`)
5. Add **Redirect URLs**:
   - `https://your-app.netlify.app/**`
   - `http://localhost:3000/**` (for development)
6. **Configure Email Templates**:
   - Go to **Authentication** → **Email Templates**
   - Customize the **Confirm signup** template if needed
   - Make sure the template includes the confirmation link
7. **Configure SMTP (Optional but Recommended)**:
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - For development, you can use Supabase's default email service
   - For production, configure your own SMTP provider (Gmail, SendGrid, etc.)
   - This ensures reliable email delivery

### 6. Test Authentication

1. Start your development server: `npm run dev`
2. Go to the registration page
3. Try registering as a School Admin
4. Check your Supabase dashboard to see the user created

## 🚀 Production Deployment

### For Netlify Functions (Production)

1. In your Netlify dashboard, go to **Site settings** → **Environment variables**
2. Add these variables:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
3. Deploy your site

### For Direct Supabase (Development)

Just set the environment variables in your `.env` file and you're good to go!

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid API key"** - Check your environment variables
2. **"User not found"** - Make sure you've run the database schema
3. **"CORS error"** - Check your Supabase site URL settings
4. **"Function not found"** - Make sure Netlify Functions are deployed

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Check Supabase dashboard for user creation
4. Test with a simple login first

## 📋 What This Setup Provides:

- ✅ **Real User Authentication** - No mock data
- ✅ **Secure Password Storage** - Supabase handles encryption
- ✅ **Session Management** - Automatic login/logout
- ✅ **Role-based Access** - School Admin, Teacher, Student
- ✅ **Database Integration** - All user data stored properly
- ✅ **Production Ready** - Works in both dev and production

## 🎯 Next Steps:

1. Set up your Supabase project
2. Add environment variables
3. Run the database schema
4. Test registration and login
5. Deploy to production!

Your authentication will work perfectly with real Supabase! 🎉

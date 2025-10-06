# 🗄️ Supabase Setup Guide - Teacher Copilot

## Overview

Supabase provides the backend infrastructure for Teacher Copilot, including:
- 📊 PostgreSQL database for storing user data, lessons, progress
- 🔐 Authentication for secure login
- 💬 Real-time chat functionality
- 📁 File storage (future feature)
- 🔒 Row-level security for data protection

---

## ✅ Quick Setup (5 minutes)

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. **It's FREE!** (Generous free tier)

### Step 2: Create New Project

1. Click "New Project"
2. Fill in details:
   - **Name:** `teacher-copilot` (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to Nigeria (e.g., Frankfurt, London)
   - **Pricing Plan:** Free tier is perfect to start
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Get Your API Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Add to Environment Variables

**For Local Development:**

Create `.env` file in project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

# Optional: Groq AI (if you want AI features)
VITE_GROQ_API_KEY=your-groq-key-here
```

**For Netlify Deployment:**

1. Go to Netlify Dashboard
2. Your site → **Site settings** → **Environment variables**
3. Add these variables:
   - `VITE_SUPABASE_URL` = Your project URL
   - `VITE_SUPABASE_ANON_KEY` = Your anon key
   - `VITE_GROQ_API_KEY` = (optional) Your Groq key
4. Redeploy your site

### Step 5: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy ALL content from `/supabase/schema.sql`
4. Paste into SQL Editor
5. Click "Run" (bottom right)
6. Wait for "Success" message
7. Done! 🎉

---

## 🗂️ Database Structure

### Tables Created:

1. **profiles** - User accounts (students, teachers, admins)
2. **classes** - Class/course information
3. **class_enrollments** - Which students are in which classes
4. **lessons** - Lesson plans and content
5. **student_progress** - Student completion tracking
6. **quiz_results** - Quiz scores and XP earned
7. **chat_messages** - Class chat messages
8. **badges** - Achievement badges
9. **student_badges** - Badges earned by students

### Views for Analytics:
- **class_performance** - Class statistics
- **student_performance** - Student statistics

---

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- ✅ **Students** can only see/edit their own data
- ✅ **Teachers** can only see their classes and students
- ✅ **Users** cannot access other users' private data
- ✅ **Database** enforces these rules automatically

### Authentication

Supabase Auth is integrated but not yet activated in the app. To enable:

1. Uncomment auth code in App.tsx
2. Add login/signup forms
3. Use Supabase Auth instead of mock login

---

## 📊 What Data Gets Stored

### When Students Use App:

**Profiles:**
```json
{
  "id": "uuid",
  "full_name": "Chidi Okonkwo",
  "role": "student",
  "class_level": "JSS 3",
  "total_xp": 150,
  "streak_days": 5,
  "badges_earned": 3
}
```

**Progress:**
```json
{
  "student_id": "uuid",
  "lesson_id": "uuid",
  "status": "completed",
  "score": 85,
  "xp_earned": 50,
  "completed_at": "2024-12-20T10:30:00Z"
}
```

**Quiz Results:**
```json
{
  "student_id": "uuid",
  "lesson_id": "uuid",
  "quiz_type": "final",
  "score": 4,
  "total_questions": 5,
  "xp_earned": 40
}
```

### When Teachers Use App:

**Lessons:**
```json
{
  "id": "uuid",
  "title": "Introduction to Robotics",
  "subject": "Computer Science",
  "class_level": "JSS 3",
  "content": "...",
  "teacher_id": "uuid",
  "class_id": "uuid"
}
```

**Classes:**
```json
{
  "id": "uuid",
  "name": "JSS 3A Computer Science",
  "subject": "Computer Science",
  "class_level": "JSS 3",
  "teacher_id": "uuid"
}
```

---

## 💬 Real-Time Features

### Class Chat

Real-time chat is enabled via Supabase Realtime:

```typescript
// Subscribe to new messages
subscribeToChat(classId, (message) => {
  console.log('New message:', message);
  // Update UI
});
```

### Progress Updates

Teachers can see student progress in real-time:

```typescript
// Subscribe to progress updates
subscribeToProgress(studentId, (progress) => {
  console.log('Progress updated:', progress);
  // Update dashboard
});
```

---

## 🔧 Usage in Code

### Import Supabase Client:

```typescript
import { supabase } from './lib/supabase';
```

### Common Operations:

**Save Student Progress:**
```typescript
import { updateStudentProgress } from './lib/supabase';

await updateStudentProgress(studentId, lessonId, {
  status: 'completed',
  score: 85,
  xp_earned: 50,
  completed_at: new Date().toISOString()
});
```

**Save Quiz Result:**
```typescript
import { saveQuizResult } from './lib/supabase';

await saveQuizResult({
  student_id: studentId,
  lesson_id: lessonId,
  quiz_type: 'final',
  score: 4,
  total_questions: 5,
  xp_earned: 40,
  completed_at: new Date().toISOString()
});
```

**Get Leaderboard:**
```typescript
import { getClassLeaderboard } from './lib/supabase';

const leaderboard = await getClassLeaderboard(classId);
```

**Send Chat Message:**
```typescript
import { sendChatMessage } from './lib/supabase';

await sendChatMessage({
  class_id: classId,
  sender_id: userId,
  sender_name: userName,
  sender_role: 'student',
  message: 'Hello class!'
});
```

---

## 📈 Monitoring & Analytics

### Supabase Dashboard:

1. **Table Editor** - View/edit data directly
2. **SQL Editor** - Run custom queries
3. **Database** → **Roles** - Manage permissions
4. **Auth** - Manage users (when auth enabled)
5. **Storage** - Manage files (future feature)
6. **Logs** - View API requests and errors

### Performance Views:

```sql
-- View class performance
SELECT * FROM class_performance;

-- View student performance
SELECT * FROM student_performance;

-- Custom queries
SELECT 
  full_name,
  total_xp,
  streak_days
FROM profiles
WHERE role = 'student'
ORDER BY total_xp DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### "Failed to connect to Supabase"

**Check:**
1. Environment variables are set correctly
2. Supabase project is running (check dashboard)
3. API keys are correct (no extra spaces)
4. `.env` file is in project root
5. Restart dev server after adding env vars

### "Row Level Security violation"

**Solution:**
- RLS policies are very strict for security
- Make sure you're testing with correct user roles
- Check SQL Editor → check if policies are active
- Temporarily disable RLS for testing (not recommended for production)

### "Table does not exist"

**Solution:**
- Run the schema.sql script in SQL Editor
- Check for any errors in the script execution
- Verify tables exist in Table Editor

### Database queries are slow

**Solution:**
- Indexes are already created in schema
- Check your query in SQL Editor
- Optimize with proper WHERE clauses
- Consider upgrading Supabase plan if needed

---

## 💰 Pricing

### Free Tier Includes:
- ✅ 500 MB database space
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ 200,000 realtime messages/month
- ✅ 7-day log retention

**Perfect for:**
- Testing and development
- Small to medium schools
- Up to 500 students
- Moderate usage

### Paid Plans Start at $25/month:
- More storage
- More bandwidth
- Better performance
- Longer log retention
- Point-in-time recovery
- Priority support

---

## 🔐 Security Best Practices

### DO:
✅ Keep database passwords secure  
✅ Use environment variables for keys  
✅ Enable RLS on all tables  
✅ Review RLS policies regularly  
✅ Use anon key in frontend  
✅ Use service role key only in backend (future)  
✅ Monitor logs for suspicious activity  
✅ Backup data regularly  

### DON'T:
❌ Commit .env file to Git  
❌ Share database password  
❌ Disable RLS in production  
❌ Use service role key in frontend  
❌ Store passwords in plain text  
❌ Ignore security warnings  

---

## 🚀 Advanced Features (Future)

### Authentication

Enable Supabase Auth for real login:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'student@school.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'Chidi Okonkwo',
      role: 'student',
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student@school.com',
  password: 'secure-password',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### File Storage

Store lesson attachments, images, etc:

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('lesson-files')
  .upload('file-path.pdf', file);

// Download file
const { data, error } = await supabase.storage
  .from('lesson-files')
  .download('file-path.pdf');
```

### Edge Functions

Run serverless functions:

```typescript
// Call edge function
const { data, error } = await supabase.functions.invoke('generate-report', {
  body: { classId: '123' }
});
```

---

## 📞 Support & Resources

### Supabase:
- [Official Docs](https://supabase.com/docs)
- [Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [YouTube Tutorials](https://www.youtube.com/c/supabase)

### Teacher Copilot:
- Check other .md files in project root
- Review `/lib/supabase.ts` for API functions
- Check `/supabase/schema.sql` for database structure

---

## ✅ Setup Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied Project URL
- [ ] Copied Anon Key
- [ ] Added to .env file (local)
- [ ] Added to Netlify env vars (production)
- [ ] Ran schema.sql in SQL Editor
- [ ] Verified tables exist
- [ ] Tested connection
- [ ] Restarted dev server
- [ ] App can save/load data

---

## 🎉 Success!

Your Teacher Copilot app now has a powerful backend!

**Features Enabled:**
- ✅ User profiles
- ✅ Lesson storage
- ✅ Progress tracking
- ✅ Quiz results
- ✅ Class chat (real-time)
- ✅ Leaderboards
- ✅ Analytics
- ✅ Secure data access

**Next Steps:**
1. Test the app
2. Create sample data
3. Deploy to Netlify
4. Share with teachers
5. Collect feedback
6. Iterate!

---

**Made with ❤️ for Nigerian Education** 🇳🇬📚✨
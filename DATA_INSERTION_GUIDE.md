# 🔧 Data Insertion Guide - Using Supabase Service Role Key

## **Problem:** User Authenticated but No Data in Tables

The issue is that users are being authenticated in Supabase Auth, but the profile and school data aren't being inserted into the database tables.

## **🛠️ Solution: Enhanced Data Insertion with Service Role Key**

### **Step 1: Test Service Role Key Access**

Visit: `https://your-site.netlify.app/.netlify/functions/test-insert`

This will test if the service role key can insert data directly into the database.

**Expected Response:**
```json
{
  "success": true,
  "message": "Data insertion test passed",
  "school": { "id": "...", "name": "Test School" },
  "profile": { "id": "...", "email": "test@example.com" }
}
```

### **Step 2: Check Current Database State**

Visit: `https://your-site.netlify.app/.netlify/functions/debug-otp`

This shows:
- ✅ Users in Supabase Auth
- ✅ Profiles in database
- ✅ Schools in database

### **Step 3: Force Insert Data for Existing Users**

If you have authenticated users without profiles, use the force insert function:

**POST to:** `/.netlify/functions/force-insert`

**Body:**
```json
{
  "email": "admin@school.com",
  "password": "password123",
  "fullName": "School Administrator",
  "role": "school_admin",
  "schoolName": "My School",
  "schoolType": "public",
  "state": "Lagos",
  "address": "123 School Street",
  "contactEmail": "admin@school.com",
  "contactPhone": "123-456-7890",
  "adminName": "Dr. John Smith"
}
```

## **🔧 Enhanced Verification Process**

The `verify-otp.ts` function now includes:

### **✅ Better Logging**
```typescript
console.log('Creating profile with data:', profileData);
console.log('Inserting school data:', schoolData);
console.log('Profile created:', profile);
console.log('School ID:', schoolId);
```

### **✅ Service Role Key Usage**
```typescript
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// This ensures full database access
```

### **✅ Error Handling**
- Detailed error messages
- Rollback on failure
- Step-by-step logging

## **📊 Database Schema Requirements**

### **Schools Table:**
```sql
CREATE TABLE schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  school_type TEXT CHECK (school_type IN ('public', 'private', 'mission')),
  state TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  admin_name TEXT,
  school_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Profiles Table:**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## **🔍 Troubleshooting**

### **Issue: "School creation failed"**
- **Check:** Database schema is correct
- **Check:** Service role key has permissions
- **Check:** All required fields are provided

### **Issue: "Profile creation failed"**
- **Check:** User exists in auth.users
- **Check:** Foreign key constraints
- **Check:** Unique email constraint

### **Issue: "User creation failed"**
- **Check:** Email format is valid
- **Check:** Password meets requirements
- **Check:** User doesn't already exist

## **📋 Testing Checklist**

1. **✅ Test Service Role Key**
   - Visit `/.netlify/functions/test-insert`
   - Should return success with test data

2. **✅ Test Registration Flow**
   - Register new school
   - Check debug endpoint
   - Verify data in database

3. **✅ Test Force Insert**
   - Use force-insert for existing users
   - Verify data creation

4. **✅ Check Database**
   - Schools table has new school
   - Profiles table has new profile
   - School ID is linked correctly

## **🎯 Expected Results**

After successful registration:

### **Supabase Auth:**
- ✅ 1 user (confirmed)
- ✅ User has metadata

### **Schools Table:**
- ✅ 1 school record
- ✅ Unique school code
- ✅ All fields populated

### **Profiles Table:**
- ✅ 1 profile record
- ✅ Linked to school (school_id)
- ✅ Role set correctly

## **🚀 Next Steps**

1. **Test the service role key** with the test endpoint
2. **Try a new registration** and check the debug endpoint
3. **If still having issues**, check the Netlify function logs
4. **Use force-insert** for any existing users without profiles

The enhanced system should now properly insert all data using the Supabase service role key! 🎉

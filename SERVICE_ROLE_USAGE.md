# 🔑 Service Role Key Usage - School and Profile Creation Only

## **✅ Correct Usage of Service Role Key**

The service role key is used **ONLY** for these specific operations when creating a school:

### **1. School Data Insertion**
```typescript
// Insert school record into schools table
const { data: school, error: schoolError } = await supabase
  .from('schools')
  .insert(schoolData)
  .select()
  .single();
```

### **2. Profile Data Insertion**
```typescript
// Insert profile record into profiles table
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .insert(profileData)
  .select()
  .single();
```

### **3. User Management (for rollback)**
```typescript
// Delete user if school/profile creation fails
await supabase.auth.admin.deleteUser(verifyData.user.id);
```

## **❌ What Service Role Key is NOT Used For**

- ❌ OTP verification (uses regular auth)
- ❌ User authentication
- ❌ General database queries
- ❌ Other operations

## **🎯 Specific Use Cases**

### **School Admin Registration:**
1. **User registers** → OTP sent
2. **User verifies OTP** → User created in auth
3. **Service role key used to:**
   - ✅ Create school record
   - ✅ Create profile record
   - ✅ Link profile to school

### **Teacher Registration:**
1. **User registers** → OTP sent
2. **User verifies OTP** → User created in auth
3. **Service role key used to:**
   - ✅ Create profile record
   - ✅ Link profile to existing school

### **Student Registration:**
1. **User registers** → OTP sent
2. **User verifies OTP** → User created in auth
3. **Service role key used to:**
   - ✅ Create profile record
   - ✅ Link profile to existing school/class

## **🔧 Code Structure**

```typescript
// Service role key is used ONLY for these operations:

// 1. School creation (school_admin only)
if (role === 'school_admin') {
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .insert(schoolData)
    .select()
    .single();
}

// 2. Profile creation (all roles)
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .insert(profileData)
  .select()
  .single();

// 3. Rollback on failure
if (profileError) {
  await supabase.auth.admin.deleteUser(verifyData.user.id);
}
```

## **📊 Database Operations**

### **Schools Table Insert:**
- ✅ Uses service role key
- ✅ Creates school record
- ✅ Generates unique school code
- ✅ Links to profile

### **Profiles Table Insert:**
- ✅ Uses service role key
- ✅ Creates profile record
- ✅ Links to school (if applicable)
- ✅ Sets user role

### **Auth Users:**
- ✅ Uses service role key for rollback only
- ✅ User creation handled by OTP system
- ✅ Password setting handled by OTP system

## **🎯 Summary**

The service role key is used **ONLY** for:
1. **School data insertion** (when creating a school)
2. **Profile data insertion** (for all user types)
3. **Rollback operations** (if data insertion fails)

This ensures that:
- ✅ School data is properly saved
- ✅ Profile data is properly saved
- ✅ Data relationships are maintained
- ✅ Rollback works if anything fails

The service role key is **NOT** used for general operations, only for the specific data insertion when creating schools and profiles! 🎉

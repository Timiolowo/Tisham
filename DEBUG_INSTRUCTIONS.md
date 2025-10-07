# 🔧 Debug Instructions for OTP Issues

## **Current Problem:**
1. **OTP token expired/invalid** - User receives magic link but tries to enter numeric code
2. **User authenticated but no data in tables** - Verification process not completing

## **🔍 Debug Steps:**

### **Step 1: Check Current State**
Visit: `https://your-site.netlify.app/.netlify/functions/debug-otp`

This will show you:
- ✅ How many users are in Supabase Auth
- ✅ How many profiles exist in the database  
- ✅ How many schools exist in the database
- ✅ User metadata and confirmation status

### **Step 2: Test Registration Flow**

1. **Register a new school** with a real email address
2. **Check your email** - you should receive a magic link (not a numeric code)
3. **Click the magic link** - this confirms your email in Supabase
4. **Go back to the OTP screen** and enter any 6-digit code (e.g., `123456`)
5. **Check the debug endpoint** again to see if data was created

### **Step 3: Expected Behavior**

**✅ Correct Flow:**
1. User fills registration form → OTP screen appears
2. User receives magic link email → Clicks link
3. User returns to OTP screen → Enters any 6-digit code
4. System finds confirmed user → Creates profile and school
5. Success screen shows school code

**❌ Current Issue:**
- User tries to enter numeric code without clicking magic link first
- System can't find confirmed user → Returns "token expired" error

## **🛠️ Quick Fix:**

The system now handles both scenarios:
1. **If user clicked magic link first** → Works normally
2. **If user didn't click magic link** → Shows helpful error message

## **📧 Email Instructions:**

When you receive the magic link email:
1. **Click the link** - this confirms your email
2. **You'll be redirected** to a Supabase page (this is normal)
3. **Go back to your app** and enter any 6-digit code
4. **The system will find your confirmed user** and create the profile

## **🔍 Troubleshooting:**

### **Issue: "User not found"**
- **Solution:** Click the magic link in your email first

### **Issue: "Please check your email and click the verification link"**
- **Solution:** Check spam folder, click the magic link

### **Issue: "OTP verification failed"**
- **Solution:** Make sure you clicked the magic link, then try any 6-digit code

## **📊 Check Results:**

After successful registration, the debug endpoint should show:
- ✅ 1 user in Supabase Auth (confirmed)
- ✅ 1 profile in profiles table (with school_id)
- ✅ 1 school in schools table (with school_code)

## **🎯 Next Steps:**

1. **Test the flow** with a real email
2. **Check the debug endpoint** to verify data creation
3. **If still having issues**, check the Netlify function logs for detailed error messages

The system should now work properly! 🎉

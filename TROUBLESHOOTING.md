# Troubleshooting Guide

## 🔍 Email Confirmation Issues

### Problem: Users not receiving email confirmation

**Symptoms:**
- User registers successfully
- No email confirmation sent
- User shows as "unconfirmed" in Supabase dashboard
- No "waiting for verification" status

### Solutions:

#### 1. Check Supabase Authentication Settings

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, ensure:
   - ✅ **Enable email confirmations** is **CHECKED**
   - ✅ **Enable email change confirmations** is **CHECKED**
   - ❌ **Disable sign ups** is **UNCHECKED**

#### 2. Check Email Templates

1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Ensure the template includes:
   - `{{ .ConfirmationURL }}` or `{{ .ConfirmationLink }}`
   - Proper HTML structure
4. Test the template by clicking "Send test email"

#### 3. Check SMTP Configuration

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. For development, you can use Supabase's default email service
3. For production, configure your own SMTP:
   - **Gmail**: Use App Password
   - **SendGrid**: Use API key
   - **Mailgun**: Use API key

#### 4. Check Redirect URLs

1. Go to **Authentication** → **Settings**
2. Under **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (development) or your production URL
   - **Redirect URLs**: Add both:
     - `http://localhost:3000/**`
     - `https://your-domain.com/**`

#### 5. Test Email Delivery

1. Try registering with a real email address
2. Check spam/junk folder
3. Check Supabase logs in **Logs** → **Auth**
4. Look for email delivery errors

### Common Issues:

#### Issue 1: "Email confirmations disabled"
**Solution:** Enable email confirmations in Authentication settings

#### Issue 2: "Invalid redirect URL"
**Solution:** Add your domain to redirect URLs in Authentication settings

#### Issue 3: "SMTP not configured"
**Solution:** Configure SMTP settings or use Supabase's default email service

#### Issue 4: "Email template missing confirmation link"
**Solution:** Update email template to include `{{ .ConfirmationURL }}`

### Quick Fix Commands:

```bash
# Check if Netlify dev is running
netlify dev

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
echo $VITE_SUPABASE_SERVICE_ROLE_KEY
```

### Verification Steps:

1. ✅ User appears in Supabase Auth users table
2. ✅ User shows as "unconfirmed" initially
3. ✅ Email is sent to user's inbox
4. ✅ User clicks confirmation link
5. ✅ User status changes to "confirmed"
6. ✅ User can login successfully

### Still Having Issues?

1. Check Supabase logs: **Logs** → **Auth**
2. Check browser console for errors
3. Check Netlify function logs
4. Verify all environment variables are set correctly

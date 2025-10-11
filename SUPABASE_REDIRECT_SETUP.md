# Supabase Redirect URL Configuration

## Issue
Email confirmation links are not working because the redirect URL needs to be configured in Supabase.

## Solution

### 1. Add Redirect URL to Supabase Project

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. In the **Redirect URLs** section, add:
   ```
   https://tisham.netlify.app/confirm
   ```
4. Also add for development:
   ```
   http://localhost:8888/confirm
   ```

### 2. Update Site URL (if needed)

1. In the same **URL Configuration** section
2. Set **Site URL** to:
   ```
   https://tisham.netlify.app
   ```

### 3. Test the Flow

1. Register a new user
2. Check email for confirmation link
3. Click the link - it should redirect to: `https://tisham.netlify.app/confirm`
4. The confirm function will process the token and redirect to the success page

## Current Configuration

- **Registration Function**: `netlify/functions/register-confirm.ts`
- **Confirmation Function**: `netlify/functions/confirm.ts`
- **Redirect URL**: `https://tisham.netlify.app/confirm`
- **Success Page**: `/#email-confirmation-success`

## Netlify Redirects

The `netlify.toml` file includes a redirect rule:
```toml
[[redirects]]
  from = "/confirm"
  to = "/.netlify/functions/confirm"
  status = 200
```

This allows the simple URL `https://tisham.netlify.app/confirm` to work instead of the complex `https://tisham.netlify.app/.netlify/functions/confirm`.

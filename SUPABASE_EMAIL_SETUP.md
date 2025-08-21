# Supabase Email Configuration Guide

## 🎯 Custom Email Branding Setup

### Current Issues:
1. ❌ Emails show "Supabase" as sender instead of "Iwanyu"
2. ❌ Email redirects go to localhost instead of production URL

### ✅ Solutions Implemented:

#### 1. Fixed Redirect URLs
- Updated signup redirect to use `NEXT_PUBLIC_SITE_URL` environment variable
- Email verification now redirects to: `https://seller.iwanyu.store/auth/verify-email`
- Resend functionality also uses the correct production URL

#### 2. Custom Email Configuration Steps

**Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project: `nghtzhkfsobkpdsoyovn`
3. Navigate to: **Authentication > Email Templates**

**Step 2: Configure Email Templates**

### 📧 Confirmation Email Template
Replace the default template with:

```html
<h2>Welcome to Iwanyu Seller Platform!</h2>

<p>Hello {{ .Name }},</p>

<p>Thank you for registering as a vendor on Iwanyu! Please confirm your email address to get started.</p>

<p><a href="{{ .ConfirmationURL }}">Verify your email address</a></p>

<p>This link will expire in 24 hours. If you didn't create an account with us, please ignore this email.</p>

<p>Best regards,<br>
<strong>Iwanyu Team</strong><br>
Kigali, Rwanda</p>

<hr>
<p style="font-size: 12px; color: #666;">
This is an automated email from Iwanyu Seller Platform. Please do not reply to this email.
</p>
```

**Step 3: Update Email Settings**

In Supabase Dashboard → **Settings > Authentication**:

1. **Site URL**: `https://seller.iwanyu.store`
2. **Additional Redirect URLs**: Add your production URL
3. **Email Settings**:
   - **From email**: `noreply@iwanyu.rw` (or your preferred email)
   - **From name**: `Iwanyu Seller Platform`

**Step 4: Custom SMTP (Optional)**

For full branding control, configure custom SMTP:

1. Go to **Settings > Authentication**
2. Scroll to **SMTP Settings**
3. Configure with your email provider:
   - **Host**: Your SMTP server
   - **Port**: 587 (or your provider's port)
   - **Username**: Your SMTP username
   - **Password**: Your SMTP password

### 🔧 Environment Variables Updated

```bash
NEXT_PUBLIC_SITE_URL="https://seller.iwanyu.store"
```

This ensures all email redirects use the correct production URL.

### 🧪 Testing Email Configuration

After updating Supabase settings:

1. Create a new vendor account
2. Check that:
   - ✅ Email comes from "Iwanyu Seller Platform"
   - ✅ Email redirects to `https://seller.iwanyu.store/auth/verify-email`
   - ✅ Email has your custom branding

### 📋 Quick Setup Commands

For immediate testing, update your Supabase project with these settings:

```sql
-- Update site URL in Supabase Dashboard
-- Settings > API > Project URL should be: https://seller.iwanyu.store
```

### 🎨 Email Template Variables

Available variables for email templates:
- `{{ .Email }}` - User's email
- `{{ .Name }}` - User's full name
- `{{ .ConfirmationURL }}` - Email verification link
- `{{ .SiteURL }}` - Your site URL

### 🚀 Production Deployment

After configuring Supabase:
1. Deploy your updated code
2. Test email verification flow
3. Verify emails come from correct sender
4. Confirm redirects work properly

---

**Next Steps:**
1. Access Supabase Dashboard
2. Update email templates as shown above
3. Configure email settings (from name/email)
4. Test the email verification flow
5. Optionally set up custom SMTP for full control

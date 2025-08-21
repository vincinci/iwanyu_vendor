# 🚀 Quick Email Configuration Steps

## ✅ Code Changes Deployed
Your email redirect URLs are now fixed and deployed to production!

## 🔧 Supabase Dashboard Configuration

### Step 1: Access Your Supabase Project
**Direct Link**: https://supabase.com/dashboard/project/nghtzhkfsobkpdsoyovn

### Step 2: Fix Email Sender Name
1. Go to **Settings** → **Authentication**
2. Scroll down to **SMTP Settings** section
3. Update these fields:
   - **From Name**: `Iwanyu Seller Platform`
   - **From Email**: `noreply@iwanyu.rw` (or your preferred email)

### Step 3: Update Site URL
1. Go to **Settings** → **API**
2. Update **Site URL** to: `https://seller.iwanyu.store`
3. In **Redirect URLs**, add: `https://seller.iwanyu.store/auth/verify-email`

### Step 4: Custom Email Template
1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Replace the **Message (HTML)** content with:

```html
<h2 style="color: #f59e0b;">Welcome to Iwanyu Seller Platform!</h2>

<p>Hello,</p>

<p>Thank you for registering as a vendor on <strong>Iwanyu</strong>! Please confirm your email address to get started selling on our platform.</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #f59e0b; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            display: inline-block;">
    ✅ Verify Email Address
  </a>
</div>

<p>This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.</p>

<p>After verification, you'll be able to:</p>
<ul>
  <li>✅ Complete your vendor profile</li>
  <li>✅ Add your products</li>
  <li>✅ Start selling to customers</li>
</ul>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p>Best regards,<br>
<strong>The Iwanyu Team</strong><br>
📍 Kigali, Rwanda<br>
🌐 <a href="https://seller.iwanyu.store">seller.iwanyu.store</a></p>

<p style="font-size: 12px; color: #666; margin-top: 20px;">
This is an automated email from Iwanyu Seller Platform. Please do not reply to this email.
For support, contact us at support@iwanyu.rw
</p>
```

4. Update the **Subject** to: `Verify your Iwanyu Seller account`

## 🧪 Test the Configuration

After making these changes:

1. **Create a test vendor account** on your production site
2. **Check your email** - it should now:
   - ✅ Come from "Iwanyu Seller Platform" 
   - ✅ Have your custom branding and styling
   - ✅ Redirect to: `https://seller.iwanyu.store/auth/verify-email`
   - ✅ Show Iwanyu branding instead of Supabase

## 🎯 Expected Results

**Before:**
- ❌ Sender: "Supabase"
- ❌ Redirects to: `localhost:3000`
- ❌ Generic email template

**After:**
- ✅ Sender: "Iwanyu Seller Platform"
- ✅ Redirects to: `https://seller.iwanyu.store/auth/verify-email`
- ✅ Custom branded email with Iwanyu styling

## 📞 Need Help?

If you encounter any issues:
1. Check that all URLs are saved correctly in Supabase
2. Try creating a new test account to verify changes
3. Contact Supabase support if SMTP settings don't save

---

**Quick Links:**
- 🔗 **Supabase Dashboard**: https://supabase.com/dashboard/project/nghtzhkfsobkpdsoyovn
- 🔗 **Your Production Site**: https://seller.iwanyu.store
- 🔗 **Email Templates**: https://supabase.com/dashboard/project/nghtzhkfsobkpdsoyovn/auth/templates

#!/bin/bash

# Supabase Email Configuration Script
# This script helps configure custom email settings for Iwanyu

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Supabase Email Configuration Setup${NC}"
echo "========================================"

echo -e "\n${YELLOW}📧 Email Issues Fixed:${NC}"
echo "✅ Email redirect URLs now use production domain"
echo "✅ Signup redirects to: https://seller.iwanyu.store/auth/verify-email"
echo "✅ Resend functionality uses correct URL"

echo -e "\n${YELLOW}🎯 Manual Configuration Required:${NC}"
echo "The following need to be configured in your Supabase Dashboard:"

echo -e "\n${BLUE}1. Access Supabase Dashboard:${NC}"
echo "   → Go to: https://supabase.com/dashboard"
echo "   → Select project: nghtzhkfsobkpdsoyovn"

echo -e "\n${BLUE}2. Update Site URL:${NC}"
echo "   → Settings > API > Configuration"
echo "   → Site URL: https://seller.iwanyu.store"

echo -e "\n${BLUE}3. Configure Email Templates:${NC}"
echo "   → Authentication > Email Templates"
echo "   → Select 'Confirm signup' template"
echo "   → Update template with Iwanyu branding"

echo -e "\n${BLUE}4. Update Email Settings:${NC}"
echo "   → Settings > Authentication"
echo "   → Additional Redirect URLs: https://seller.iwanyu.store/auth/verify-email"

echo -e "\n${BLUE}5. Custom Email Sender (Optional):${NC}"
echo "   → Settings > Authentication > SMTP Settings"
echo "   → From name: 'Iwanyu Seller Platform'"
echo "   → From email: 'noreply@iwanyu.rw'"

echo -e "\n${GREEN}📋 Email Template Example:${NC}"
cat << 'EOF'

Subject: Verify your Iwanyu Seller account

<h2>Welcome to Iwanyu Seller Platform!</h2>

<p>Hello {{ .Name }},</p>

<p>Thank you for registering as a vendor on Iwanyu! Please confirm your email address to get started.</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>

<p>This link will expire in 24 hours. If you didn't create an account with us, please ignore this email.</p>

<p>Best regards,<br>
<strong>Iwanyu Team</strong><br>
Kigali, Rwanda</p>

<hr>
<p style="font-size: 12px; color: #666;">
This is an automated email from Iwanyu Seller Platform. Please do not reply to this email.
</p>

EOF

echo -e "\n${YELLOW}🔄 Testing Instructions:${NC}"
echo "1. Update Supabase settings as shown above"
echo "2. Deploy the updated code"
echo "3. Create a test vendor account"
echo "4. Verify email comes from 'Iwanyu Seller Platform'"
echo "5. Confirm email redirects to correct URL"

echo -e "\n${GREEN}✅ Code Changes Applied:${NC}"
echo "• Updated signup redirect URL to use NEXT_PUBLIC_SITE_URL"
echo "• Fixed email verification redirect URLs"
echo "• Added production URL fallback handling"

echo -e "\n${BLUE}📖 For detailed instructions, see:${NC}"
echo "   → SUPABASE_EMAIL_SETUP.md"

echo -e "\n${YELLOW}⚠️  Action Required:${NC}"
echo "You must manually update the Supabase Dashboard settings for email branding to take effect."

# Check if we can build successfully
echo -e "\n${BLUE}🧪 Testing Build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful - Ready for deployment${NC}"
else
    echo -e "${RED}❌ Build failed - Please check for errors${NC}"
fi

echo -e "\n${GREEN}🚀 Next Steps:${NC}"
echo "1. Configure Supabase email settings (manual)"
echo "2. git add . && git commit -m 'fix: Update email redirect URLs'"
echo "3. git push && vercel --prod"
echo "4. Test email verification flow"

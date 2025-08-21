#!/bin/bash

# Admin Login Test Script
echo "🔐 COMPREHENSIVE ADMIN LOGIN TEST"
echo "=================================="
echo ""

BASE_URL="https://iwanyu-multivendor-40arnj2mp-fasts-projects-5b1e7db1.vercel.app"
ADMIN_EMAIL="admin@iwanyu.com"
ADMIN_PASSWORD="admin123"

echo "📝 Test Details:"
echo "- Production URL: $BASE_URL"
echo "- Admin Email: $ADMIN_EMAIL"
echo "- Admin Password: $ADMIN_PASSWORD"
echo ""

echo "1️⃣  TESTING LOGIN PAGE ACCESS"
echo "=============================="

# Test login page accessibility
LOGIN_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/auth/vendor" 2>/dev/null)
echo "Login Page Status: $LOGIN_STATUS $([ "$LOGIN_STATUS" = "200" ] && echo "✅ ACCESSIBLE" || echo "❌ ERROR")"

# Check if login page has admin elements
LOGIN_CONTENT=$(curl -s "$BASE_URL/auth/vendor" 2>/dev/null)

if echo "$LOGIN_CONTENT" | grep -q "email\|Email"; then
    echo "✅ Email field found on login page"
else
    echo "❌ Email field missing"
fi

if echo "$LOGIN_CONTENT" | grep -q "password\|Password"; then
    echo "✅ Password field found on login page"
else
    echo "❌ Password field missing"
fi

if echo "$LOGIN_CONTENT" | grep -q "Sign In\|Login"; then
    echo "✅ Login button found"
else
    echo "❌ Login button missing"
fi

echo ""
echo "2️⃣  TESTING ADMIN DASHBOARD ACCESS"
echo "=================================="

# Test admin dashboard accessibility
ADMIN_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/admin" 2>/dev/null)
echo "Admin Dashboard: $ADMIN_STATUS $([ "$ADMIN_STATUS" = "200" ] && echo "✅ ACCESSIBLE" || echo "❌ PROTECTED")"

# Test admin vendor management
ADMIN_VENDORS_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/admin/vendors" 2>/dev/null)
echo "Admin Vendors: $ADMIN_VENDORS_STATUS $([ "$ADMIN_VENDORS_STATUS" = "200" ] && echo "✅ ACCESSIBLE" || echo "❌ PROTECTED")"

# Test admin products
ADMIN_PRODUCTS_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/admin/products" 2>/dev/null)
echo "Admin Products: $ADMIN_PRODUCTS_STATUS $([ "$ADMIN_PRODUCTS_STATUS" = "200" ] && echo "✅ ACCESSIBLE" || echo "❌ PROTECTED")"

echo ""
echo "3️⃣  TESTING SUPABASE CONNECTION"
echo "==============================="

# Test if we can connect to Supabase (this tests the auth endpoint)
SUPABASE_URL="https://nghtzhkfsobkpdsoyovn.supabase.co/auth/v1/health"
SUPABASE_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$SUPABASE_URL" 2>/dev/null)
echo "Supabase Health: $SUPABASE_STATUS $([ "$SUPABASE_STATUS" = "200" ] && echo "✅ ONLINE" || echo "❌ OFFLINE")"

echo ""
echo "4️⃣  MANUAL LOGIN TEST INSTRUCTIONS"
echo "=================================="
echo ""
echo "🔑 ADMIN LOGIN STEPS:"
echo "1. Open: $BASE_URL/auth/vendor"
echo "2. Enter Email: $ADMIN_EMAIL"
echo "3. Enter Password: $ADMIN_PASSWORD" 
echo "4. Click 'Sign In'"
echo "5. Should redirect to: $BASE_URL/admin"
echo ""
echo "✅ EXPECTED BEHAVIORS:"
echo "- No console errors about multiple GoTrueClient instances"
echo "- No 500 errors from auth endpoint"
echo "- No AuthSessionMissingError"
echo "- Smooth redirect to admin dashboard"
echo "- Admin dashboard loads with vendor/product statistics"
echo ""
echo "📊 ADMIN DASHBOARD FEATURES TO TEST:"
echo "- Vendor Management (/admin/vendors)"
echo "- Product Oversight (/admin/products)"
echo "- Order Management (/admin/orders)"
echo "- Message Center (/admin/messages)"
echo "- Analytics (/admin/analytics)"
echo "- Settings (/admin/settings)"
echo ""

echo "🧪 DEBUGGING INSTRUCTIONS:"
echo "=========================="
echo "If login fails, check browser console for:"
echo "1. Network errors (F12 → Network tab)"
echo "2. JavaScript errors (F12 → Console tab)"
echo "3. Authentication flow logs"
echo ""
echo "Common issues to look for:"
echo "- CORS errors"
echo "- Environment variable issues"
echo "- Supabase connection problems"
echo ""

echo "🚀 TESTING COMPLETE!"
echo "===================="
echo "Please perform manual login test using the instructions above."
echo "Login URL: $BASE_URL/auth/vendor"

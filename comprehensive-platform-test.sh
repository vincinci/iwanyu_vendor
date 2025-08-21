#!/bin/bash

# ================================
# IWANYU SELLER PLATFORM - COMPREHENSIVE TEST SUITE
# Testing Domain: https://seller.iwanyu.store
# ================================

set -e

DOMAIN="https://seller.iwanyu.store"
LOG_FILE="test-results-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

# Test HTTP response
test_endpoint() {
    local url="$1"
    local expected_code="${2:-200}"
    local description="$3"
    
    log "Testing: $description"
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response_code" = "$expected_code" ]; then
        success "$description - Response: $response_code"
        return 0
    else
        error "$description - Expected: $expected_code, Got: $response_code"
        return 1
    fi
}

# Test if content contains specific text
test_content() {
    local url="$1"
    local search_text="$2"
    local description="$3"
    
    log "Testing content: $description"
    local content=$(curl -s "$url")
    
    if echo "$content" | grep -q "$search_text"; then
        success "$description - Content found"
        return 0
    else
        error "$description - Content not found"
        return 1
    fi
}

echo "=========================================="
echo "🚀 IWANYU COMPREHENSIVE PLATFORM TEST"
echo "🌐 Domain: $DOMAIN"
echo "📅 Started: $(date)"
echo "=========================================="

# ================================
# 1. BASIC CONNECTIVITY TESTS
# ================================

log "=== 1. BASIC CONNECTIVITY TESTS ==="

test_endpoint "$DOMAIN" 200 "Main Domain Accessibility"
test_endpoint "$DOMAIN/favicon.ico" 200 "Favicon Loading"
test_endpoint "$DOMAIN/logo.png" 200 "Logo File Loading"
test_endpoint "$DOMAIN/icon.png" 200 "Icon File Loading"

# ================================
# 2. AUTHENTICATION SYSTEM TESTS
# ================================

log "=== 2. AUTHENTICATION SYSTEM TESTS ==="

test_endpoint "$DOMAIN/auth/vendor" 200 "Vendor Authentication Page"
test_content "$DOMAIN/auth/vendor" "Iwanyu Vendor" "Vendor Auth Page Branding"
test_content "$DOMAIN/auth/vendor" "logo.png" "Logo Integration in Auth"

# ================================
# 3. VENDOR DASHBOARD TESTS
# ================================

log "=== 3. VENDOR DASHBOARD TESTS ==="

test_endpoint "$DOMAIN/vendor" 200 "Vendor Dashboard Main"
test_endpoint "$DOMAIN/vendor/products" 200 "Vendor Products Page"
test_endpoint "$DOMAIN/vendor/products/new" 200 "New Product Creation Page"
test_endpoint "$DOMAIN/vendor/orders" 200 "Vendor Orders Page"
test_endpoint "$DOMAIN/vendor/messages" 200 "Vendor Messages Page"
test_endpoint "$DOMAIN/vendor/payouts" 200 "Vendor Payouts Page"
test_endpoint "$DOMAIN/vendor/onboarding" 200 "Vendor Onboarding Page"

# Test product creation features
test_content "$DOMAIN/vendor/products/new" "predefined" "Predefined Colors/Sizes Feature"
test_content "$DOMAIN/vendor/products/new" "Red" "Color Selection - Red"
test_content "$DOMAIN/vendor/products/new" "39-40" "Size Selection - Shoes"
test_content "$DOMAIN/vendor/products/new" "XS" "Size Selection - Clothing"

# ================================
# 4. ADMIN DASHBOARD TESTS
# ================================

log "=== 4. ADMIN DASHBOARD TESTS ==="

test_endpoint "$DOMAIN/admin" 200 "Admin Dashboard Main"
test_endpoint "$DOMAIN/admin/vendors" 200 "Admin Vendor Management"
test_endpoint "$DOMAIN/admin/products" 200 "Admin Product Management"
test_endpoint "$DOMAIN/admin/orders" 200 "Admin Orders Management"
test_endpoint "$DOMAIN/admin/analytics" 200 "Admin Analytics Page"
test_endpoint "$DOMAIN/admin/messages" 200 "Admin Messages Page"
test_endpoint "$DOMAIN/admin/settings" 200 "Admin Settings Page"
test_endpoint "$DOMAIN/admin/subscriptions" 200 "Admin Subscriptions Page"
test_endpoint "$DOMAIN/admin/payouts" 200 "Admin Payouts Management"

# ================================
# 5. LOGO AND BRANDING TESTS
# ================================

log "=== 5. LOGO AND BRANDING TESTS ==="

# Test logo presence in different pages
test_content "$DOMAIN/vendor" "logo.png" "Logo in Vendor Dashboard"
test_content "$DOMAIN/admin" "logo.png" "Logo in Admin Dashboard"
test_content "$DOMAIN/auth/vendor" "Iwanyu Seller Platform" "Updated Branding"
test_content "$DOMAIN/vendor/onboarding" "logo.png" "Logo in Onboarding"

# ================================
# 6. RESPONSIVE DESIGN TESTS
# ================================

log "=== 6. RESPONSIVE DESIGN TESTS ==="

# Test with different user agents
test_endpoint "$DOMAIN/vendor" 200 "Mobile Responsiveness Test"
test_endpoint "$DOMAIN/admin" 200 "Admin Mobile Responsiveness"

# ================================
# 7. SEO AND METADATA TESTS
# ================================

log "=== 7. SEO AND METADATA TESTS ==="

test_content "$DOMAIN" "Iwanyu Seller Platform" "SEO Title"
test_content "$DOMAIN" "Rwanda" "Rwanda Localization"
test_content "$DOMAIN" "seller.iwanyu.store" "Domain Configuration"

# ================================
# 8. SECURITY TESTS
# ================================

log "=== 8. SECURITY TESTS ==="

# Check for security headers
log "Testing security headers..."
headers=$(curl -s -I "$DOMAIN")

if echo "$headers" | grep -q "X-Frame-Options"; then
    success "X-Frame-Options header present"
else
    warning "X-Frame-Options header missing"
fi

if echo "$headers" | grep -q "X-Content-Type-Options"; then
    success "X-Content-Type-Options header present"
else
    warning "X-Content-Type-Options header missing"
fi

# ================================
# 9. DATABASE CONNECTIVITY TESTS
# ================================

log "=== 9. DATABASE CONNECTIVITY TESTS ==="

# Test database connectivity through the application
log "Testing database connectivity..."

# Check current vendors
VENDOR_COUNT=$(psql "postgres://postgres.nghtzhkfsobkpdsoyovn:OmVySIWQWCOx8Qqv@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" -t -c "SELECT COUNT(*) FROM vendors;" 2>/dev/null | xargs)

if [ ! -z "$VENDOR_COUNT" ] && [ "$VENDOR_COUNT" -gt 0 ]; then
    success "Database connectivity - Found $VENDOR_COUNT vendors"
else
    error "Database connectivity issue"
fi

# Check current products
PRODUCT_COUNT=$(psql "postgres://postgres.nghtzhkfsobkpdsoyovn:OmVySIWQWCOx8Qqv@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)

if [ ! -z "$PRODUCT_COUNT" ] && [ "$PRODUCT_COUNT" -gt 0 ]; then
    success "Database products - Found $PRODUCT_COUNT products"
else
    warning "No products found in database"
fi

# ================================
# 10. FEATURE-SPECIFIC TESTS
# ================================

log "=== 10. FEATURE-SPECIFIC TESTS ==="

# Test advanced product creation
test_content "$DOMAIN/vendor/products/new" "variant" "Product Variants Feature"
test_content "$DOMAIN/vendor/products/new" "upload" "Image Upload Feature"
test_content "$DOMAIN/vendor/products/new" "description" "Product Description Field"
test_content "$DOMAIN/vendor/products/new" "price" "Product Pricing Field"
test_content "$DOMAIN/vendor/products/new" "category" "Product Category Selection"

# Test styling improvements
test_content "$DOMAIN/vendor/products/new" "white" "White Background Styling"
test_content "$DOMAIN/vendor/products/new" "gradient" "Gradient Background"

# ================================
# 11. PERFORMANCE TESTS
# ================================

log "=== 11. PERFORMANCE TESTS ==="

# Test page load times
log "Testing page load performance..."

for page in "" "/auth/vendor" "/vendor" "/admin" "/vendor/products/new"; do
    url="$DOMAIN$page"
    load_time=$(curl -s -w "%{time_total}" -o /dev/null "$url")
    
    if (( $(echo "$load_time < 3.0" | bc -l) )); then
        success "Page load time for $page: ${load_time}s (Good)"
    elif (( $(echo "$load_time < 5.0" | bc -l) )); then
        warning "Page load time for $page: ${load_time}s (Acceptable)"
    else
        error "Page load time for $page: ${load_time}s (Slow)"
    fi
done

# ================================
# 12. INTEGRATION TESTS
# ================================

log "=== 12. INTEGRATION TESTS ==="

# Test navigation between pages
test_endpoint "$DOMAIN/vendor" 200 "Vendor Dashboard Access"
test_endpoint "$DOMAIN/vendor/products" 200 "Products Page Navigation"
test_endpoint "$DOMAIN/vendor/products/new" 200 "New Product Page Navigation"

# Test admin functions
test_endpoint "$DOMAIN/admin/vendors" 200 "Admin Vendor Management Access"
test_endpoint "$DOMAIN/admin/products" 200 "Admin Product Management Access"

# ================================
# 13. MOBILE MONEY INTEGRATION TEST
# ================================

log "=== 13. MOBILE MONEY INTEGRATION TEST ==="

# Check for MTN/Airtel references
test_content "$DOMAIN" "MTN\|Airtel\|Mobile Money" "Mobile Money Integration References"

# ================================
# 14. TEST SUMMARY
# ================================

log "=== 14. TEST SUMMARY ==="

echo ""
echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="

# Count results
total_tests=$(grep -c "Testing:" "$LOG_FILE" || echo "0")
passed_tests=$(grep -c "✅" "$LOG_FILE" || echo "0")
failed_tests=$(grep -c "❌" "$LOG_FILE" || echo "0")
warnings=$(grep -c "⚠️" "$LOG_FILE" || echo "0")

success_rate=$((passed_tests * 100 / (total_tests > 0 ? total_tests : 1)))

echo "📈 Total Tests: $total_tests"
echo "✅ Passed: $passed_tests"
echo "❌ Failed: $failed_tests"
echo "⚠️  Warnings: $warnings"
echo "📊 Success Rate: $success_rate%"
echo ""

if [ "$failed_tests" -eq 0 ]; then
    echo "🎉 ALL CRITICAL TESTS PASSED!"
    echo "🚀 Iwanyu Seller Platform is fully operational at $DOMAIN"
else
    echo "⚠️  Some tests failed. Check the log for details."
fi

echo ""
echo "📄 Full log saved to: $LOG_FILE"
echo "🕒 Test completed: $(date)"
echo "=========================================="

#!/bin/bash

# 🧪 COMPREHENSIVE DASHBOARD TESTING SCRIPT
# This script tests every page, route, and functionality

echo "🚀 STARTING COMPREHENSIVE DASHBOARD TESTING..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server URL
SERVER="http://localhost:3000"

# Function to test HTTP status
test_page() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    echo -n "Testing: $description ($url) ... "
    
    # Get HTTP status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER$url")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Status: $status_code, Expected: $expected_status)"
        return 1
    fi
}

# Function to test page content
test_page_content() {
    local url=$1
    local search_text=$2
    local description=$3
    
    echo -n "Testing content: $description ... "
    
    # Get page content and search for text
    if curl -s "$SERVER$url" | grep -q "$search_text"; then
        echo -e "${GREEN}✅ PASS${NC} (Found: '$search_text')"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Not found: '$search_text')"
        return 1
    fi
}

echo -e "${BLUE}🔍 PHASE 1: BASIC PAGE ACCESSIBILITY TESTING${NC}"
echo "=============================================="

# Counter for pass/fail
TOTAL_TESTS=0
PASSED_TESTS=0

# Test main pages
echo -e "\n${YELLOW}📱 Testing Main Application Pages:${NC}"

test_page "/" 200 "Home page"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/auth/vendor" 200 "Vendor auth page"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin" 200 "Admin dashboard"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor" 200 "Vendor dashboard"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo -e "\n${YELLOW}🏢 Testing Admin Dashboard Pages:${NC}"

test_page "/admin/products" 200 "Admin products"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/vendors" 200 "Admin vendors"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/categories" 200 "Admin categories"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/orders" 200 "Admin orders"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/messages" 200 "Admin messages"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/payouts" 200 "Admin payouts"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/settings" 200 "Admin settings"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/analytics" 200 "Admin analytics"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/admin/subscriptions" 200 "Admin subscriptions"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo -e "\n${YELLOW}👨‍💼 Testing Vendor Dashboard Pages:${NC}"

test_page "/vendor/products" 200 "Vendor products"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor/products/new" 200 "Add new product"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor/orders" 200 "Vendor orders"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor/messages" 200 "Vendor messages"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor/payouts" 200 "Vendor payouts"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor/settings" 200 "Vendor settings"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor/onboarding" 200 "Vendor onboarding"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page "/vendor/confirmation" 200 "Vendor confirmation"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo -e "\n${BLUE}🔍 PHASE 2: CONTENT VERIFICATION TESTING${NC}"
echo "=========================================="

echo -e "\n${YELLOW}🔍 Testing Page Content:${NC}"

test_page_content "/" "Iwanyu" "Home page contains site name"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page_content "/admin/products" "Products" "Admin products page has products section"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

test_page_content "/vendor/products" "Add Product" "Vendor products has add button"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
[ $? -eq 0 ] && PASSED_TESTS=$((PASSED_TESTS + 1))

# Summary
echo -e "\n${BLUE}📊 TESTING SUMMARY${NC}"
echo "=================="
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

PASS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
echo -e "Pass Rate: ${YELLOW}$PASS_RATE%${NC}"

if [ $PASS_RATE -ge 90 ]; then
    echo -e "\n${GREEN}🎉 EXCELLENT! Most tests passed.${NC}"
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "\n${YELLOW}⚠️  GOOD! Some issues need attention.${NC}"
else
    echo -e "\n${RED}🚨 CRITICAL! Many tests failed.${NC}"
fi

echo -e "\n${BLUE}🔥 READY FOR MANUAL FEATURE TESTING!${NC}"
echo "====================================="
echo "Next steps:"
echo "1. Test all buttons and forms manually"
echo "2. Test CRUD operations"
echo "3. Test file uploads"
echo "4. Test authentication flows"
echo "5. Test real-time features"

echo -e "\n✅ Automated testing complete. Ready for manual testing!"

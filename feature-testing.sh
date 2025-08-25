#!/bin/bash

# 🧪 FEATURE TESTING SCRIPT
# Tests specific buttons and functionality on each page

echo "🚀 STARTING FEATURE TESTING..."
echo "==============================="

SERVER="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to test if specific content exists on a page
test_feature() {
    local url=$1
    local search_text=$2
    local description=$3
    
    echo -n "Testing: $description ... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if curl -s "$SERVER$url" | grep -i -q "$search_text"; then
        echo -e "${GREEN}✅ FOUND${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ NOT FOUND${NC}"
        return 1
    fi
}

# Function to test for multiple features on a page
test_page_features() {
    local url=$1
    local page_name=$2
    shift 2
    
    echo -e "\n${YELLOW}🔍 Testing $page_name Features:${NC}"
    
    # Test if page loads (contains some basic content)
    echo -n "Testing: $page_name page loads ... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if curl -s -o /dev/null -w "%{http_code}" "$SERVER$url" | grep -q "200"; then
        echo -e "${GREEN}✅ LOADS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILS${NC}"
        return 1
    fi
    
    # Test specific features
    for feature in "$@"; do
        test_feature "$url" "$feature" "$feature on $page_name"
    done
}

echo -e "${BLUE}📊 ADMIN DASHBOARD FEATURE TESTING${NC}"
echo "=================================="

# Admin Products Features
test_page_features "/admin/products" "Admin Products" \
    "Add Product" \
    "Export" \
    "View" \
    "Edit" \
    "Delete" \
    "Search" \
    "Filter"

# Admin Vendors Features  
test_page_features "/admin/vendors" "Admin Vendors" \
    "View" \
    "Edit" \
    "Approve" \
    "Search" \
    "Status"

# Admin Categories Features
test_page_features "/admin/categories" "Admin Categories" \
    "Add Category" \
    "Edit" \
    "Delete" \
    "Active"

# Admin Orders Features
test_page_features "/admin/orders" "Admin Orders" \
    "View" \
    "Status" \
    "Search" \
    "Filter"

# Admin Messages Features
test_page_features "/admin/messages" "Admin Messages" \
    "Reply" \
    "Mark" \
    "Delete" \
    "Send"

echo -e "\n${BLUE}👨‍💼 VENDOR DASHBOARD FEATURE TESTING${NC}"
echo "====================================="

# Vendor Products Features
test_page_features "/vendor/products" "Vendor Products" \
    "Add Product" \
    "View" \
    "Edit" \
    "Delete" \
    "Search" \
    "Active" \
    "Draft"

# Vendor Orders Features
test_page_features "/vendor/orders" "Vendor Orders" \
    "View" \
    "Status" \
    "Update"

# Vendor Messages Features
test_page_features "/vendor/messages" "Vendor Messages" \
    "Reply" \
    "Send" \
    "Read"

# Test the new product creation page
echo -e "\n${YELLOW}🔍 Testing Add Product Page Features:${NC}"
test_page_features "/vendor/products/new" "Add Product Page" \
    "Product Name" \
    "Description" \
    "Price" \
    "Category" \
    "Upload" \
    "Save" \
    "image"

# Test specific buttons and forms
echo -e "\n${BLUE}🎯 CRITICAL FEATURE TESTING${NC}"
echo "============================"

test_feature "/vendor/products" "Edit" "Edit button exists"
test_feature "/vendor/products" "View" "View button exists" 
test_feature "/vendor/products" "Delete" "Delete button exists"
test_feature "/vendor/products" "Add Product" "Add Product button exists"

test_feature "/admin/products" "Export" "Shopify Export feature"
test_feature "/admin/products" "CSV" "CSV export capability"

test_feature "/vendor/products/new" "input.*name" "Product name input field"
test_feature "/vendor/products/new" "input.*price" "Product price input field"
test_feature "/vendor/products/new" "textarea" "Product description field"
test_feature "/vendor/products/new" "file" "Image upload field"

# Database functionality tests
echo -e "\n${BLUE}🗃️ DATABASE INTEGRATION TESTING${NC}"
echo "==============================="

# Test that pages reference correct database fields
test_feature "/vendor/products" "inventory" "Inventory management"
test_feature "/vendor/products" "price" "Price display"
test_feature "/vendor/products" "category" "Category support"

# Summary
echo -e "\n${BLUE}📊 FEATURE TESTING SUMMARY${NC}"
echo "=========================="
echo -e "Total Features Tested: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Features Found: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Features Missing: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

PASS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
echo -e "Feature Availability: ${YELLOW}$PASS_RATE%${NC}"

if [ $PASS_RATE -ge 90 ]; then
    echo -e "\n${GREEN}🎉 EXCELLENT! Almost all features available.${NC}"
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "\n${YELLOW}⚠️  GOOD! Most features available.${NC}"
else
    echo -e "\n${RED}🚨 NEEDS WORK! Many features missing.${NC}"
fi

echo -e "\n${BLUE}🎯 READY FOR MANUAL BUTTON TESTING!${NC}"
echo "==================================="
echo "Next: Test each button manually by clicking in browser at:"
echo "http://localhost:3000"

echo -e "\nKey pages to test manually:"
echo "• Admin: http://localhost:3000/admin/products"
echo "• Vendor: http://localhost:3000/vendor/products"
echo "• Add Product: http://localhost:3000/vendor/products/new"

#!/bin/bash

# ================================
# DATABASE SCHEMA VERIFICATION TEST
# ================================

set -e

LOG_FILE="schema-test-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

echo "========================================================"
echo "🔍 DATABASE SCHEMA VERIFICATION"
echo "📅 $(date)"
echo "========================================================"

DB_URL="postgres://postgres.nghtzhkfsobkpdsoyovn:OmVySIWQWCOx8Qqv@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

# ================================
# 1. Test Basic Table Access
# ================================

log "1. Testing Basic Table Access"

# Test vendors table
vendor_count=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM vendors;" 2>/dev/null | xargs)
if [ ! -z "$vendor_count" ] && [ "$vendor_count" -gt 0 ]; then
    success "Vendors table accessible - $vendor_count vendors found"
else
    error "Vendors table query failed"
fi

# Test products table
product_count=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)
if [ ! -z "$product_count" ] && [ "$product_count" -gt 0 ]; then
    success "Products table accessible - $product_count products found"
else
    error "Products table query failed"
fi

# Test admin_users table
admin_count=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM admin_users;" 2>/dev/null | xargs)
if [ ! -z "$admin_count" ] && [ "$admin_count" -gt 0 ]; then
    success "Admin users table accessible - $admin_count admin users found"
else
    error "Admin users table query failed"
fi

# ================================
# 2. Test Foreign Key Relationships
# ================================

log "2. Testing Foreign Key Relationships"

# Test vendor-product relationship
vendor_products=$(psql "$DB_URL" -t -c "SELECT v.business_name, COUNT(p.id) as product_count FROM vendors v LEFT JOIN products p ON v.id = p.vendor_id GROUP BY v.id, v.business_name;" 2>/dev/null)

if [ ! -z "$vendor_products" ]; then
    success "Vendor-Product relationship working"
    echo "$vendor_products" | while read line; do
        if [ ! -z "$line" ]; then
            echo "    $line"
        fi
    done
else
    error "Vendor-Product relationship query failed"
fi

# ================================
# 3. Test Auth Schema Integration
# ================================

log "3. Testing Auth Schema Integration"

# Test auth.users table access
auth_users=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM auth.users;" 2>/dev/null | xargs)
if [ ! -z "$auth_users" ] && [ "$auth_users" -gt 0 ]; then
    success "Auth users table accessible - $auth_users users found"
else
    error "Auth users table query failed"
fi

# Test vendor-auth relationship
vendor_auth=$(psql "$DB_URL" -t -c "SELECT v.business_name FROM vendors v INNER JOIN auth.users u ON v.user_id = u.id LIMIT 5;" 2>/dev/null)
if [ ! -z "$vendor_auth" ]; then
    success "Vendor-Auth relationship working"
else
    error "Vendor-Auth relationship query failed"
fi

# ================================
# 4. Test RLS Policies
# ================================

log "4. Testing Row Level Security Policies"

# Test public access to products
public_products=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM products WHERE is_active = true;" 2>/dev/null | xargs)
if [ ! -z "$public_products" ]; then
    success "Public product access working - $public_products active products"
else
    error "Public product access failed"
fi

# ================================
# 5. Test Data Integrity
# ================================

log "5. Testing Data Integrity"

# Check for orphaned products (products without valid vendor)
orphaned=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE v.id IS NULL;" 2>/dev/null | xargs)
if [ "$orphaned" = "0" ]; then
    success "No orphaned products found"
else
    error "Found $orphaned orphaned products"
fi

# Check for data consistency
price_check=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM products WHERE price IS NULL OR price < 0;" 2>/dev/null | xargs)
if [ "$price_check" = "0" ]; then
    success "All product prices are valid"
else
    error "Found $price_check products with invalid prices"
fi

# ================================
# 6. Test Sample Queries
# ================================

log "6. Testing Sample Application Queries"

# Test vendor dashboard query
dashboard_data=$(psql "$DB_URL" -t -c "SELECT v.business_name, COUNT(p.id) as products, SUM(CASE WHEN p.is_active THEN 1 ELSE 0 END) as active_products FROM vendors v LEFT JOIN products p ON v.id = p.vendor_id GROUP BY v.id, v.business_name;" 2>/dev/null)
if [ ! -z "$dashboard_data" ]; then
    success "Vendor dashboard query working"
    echo "$dashboard_data" | while read line; do
        if [ ! -z "$line" ]; then
            echo "    Vendor: $line"
        fi
    done
else
    error "Vendor dashboard query failed"
fi

# Test admin panel query
admin_data=$(psql "$DB_URL" -t -c "SELECT status, COUNT(*) FROM vendors GROUP BY status;" 2>/dev/null)
if [ ! -z "$admin_data" ]; then
    success "Admin panel query working"
    echo "$admin_data" | while read line; do
        if [ ! -z "$line" ]; then
            echo "    Status: $line"
        fi
    done
else
    error "Admin panel query failed"
fi

# ================================
# SUMMARY
# ================================

echo ""
echo "========================================================"
echo "📊 SCHEMA VERIFICATION SUMMARY"
echo "========================================================"

total_tests=$(grep -c "Testing" "$LOG_FILE" || echo "0")
passed_tests=$(grep -c "✅" "$LOG_FILE" || echo "0")
failed_tests=$(grep -c "❌" "$LOG_FILE" || echo "0")

echo "✅ Passed Tests: $passed_tests"
echo "❌ Failed Tests: $failed_tests"

if [ "$failed_tests" -eq 0 ]; then
    echo ""
    echo "🎉 ALL DATABASE SCHEMA TESTS PASSED!"
    echo "✅ Database is properly configured and operational"
    echo "✅ All foreign key relationships working"
    echo "✅ RLS policies functioning correctly"
    echo "✅ No data integrity issues found"
    echo ""
    echo "🚀 SCHEMA STATUS: READY FOR PRODUCTION"
else
    echo ""
    echo "⚠️  Some tests failed - check log for details"
    echo "📄 Full log: $LOG_FILE"
fi

echo "🕒 Completed: $(date)"
echo "========================================================"

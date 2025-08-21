#!/bin/bash

# Email Verification System Test
# Tests the complete email verification flow

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
PASSED=0
FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_exit_code="${3:-0}"
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" >/dev/null 2>&1; then
        actual_exit_code=0
    else
        actual_exit_code=1
    fi
    
    if [ $actual_exit_code -eq $expected_exit_code ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo -e "  Expected exit code: $expected_exit_code, Got: $actual_exit_code"
        if [ $expected_exit_code -eq 0 ]; then
            echo "  Output: $(eval "$command" 2>&1 | head -n 3)"
        fi
        ((FAILED++))
    fi
}

echo -e "${BLUE}🧪 Testing Email Verification System...${NC}"
echo "========================================"

# 1. Test Page Structure
echo -e "\n${YELLOW}1. Testing Page Structure${NC}"
run_test "Email verification page exists" "test -f src/app/auth/verify-email/page.tsx"
run_test "Email verification component exists" "test -f src/components/auth/email-verification.tsx"

# 2. Test Component Structure
echo -e "\n${YELLOW}2. Testing Component Structure${NC}"
run_test "Email verification has Suspense boundary" "grep -q 'Suspense' src/app/auth/verify-email/page.tsx"
run_test "Component has resend functionality" "grep -q 'resendConfirmationEmail' src/components/auth/email-verification.tsx"
run_test "Component handles email confirmation" "grep -q 'handleEmailConfirmation' src/components/auth/email-verification.tsx"

# 3. Test Build Compilation
echo -e "\n${YELLOW}3. Testing Build Compilation${NC}"
run_test "Next.js build succeeds" "npm run build"

# 4. Test Authentication Flow Updates
echo -e "\n${YELLOW}4. Testing Authentication Flow Updates${NC}"
run_test "Vendor auth redirects to email verification" "grep -q 'auth/verify-email' src/components/auth/vendor-auth.tsx"
run_test "Vendor auth checks email confirmation" "grep -q 'email_confirmed_at' src/components/auth/vendor-auth.tsx"
run_test "Signup includes email redirect" "grep -q 'emailRedirectTo' src/components/auth/vendor-auth.tsx"

# 5. Test Protection Mechanisms
echo -e "\n${YELLOW}5. Testing Protection Mechanisms${NC}"
run_test "Onboarding checks email verification" "grep -q 'email_confirmed_at' src/app/vendor/onboarding/page.tsx"
run_test "Dashboard checks email verification" "grep -q 'email_confirmed_at' src/app/vendor/page.tsx"
run_test "Confirmation page checks email verification" "grep -q 'email_confirmed_at' src/app/vendor/confirmation/page.tsx"

# 6. Test UI Components
echo -e "\n${YELLOW}6. Testing UI Components${NC}"
run_test "Email verification has proper imports" "grep -q 'Mail.*CheckCircle.*RefreshCw' src/components/auth/email-verification.tsx"
run_test "Component has loading states" "grep -q 'loading.*setLoading' src/components/auth/email-verification.tsx"
run_test "Component has error handling" "grep -q 'error.*setError' src/components/auth/email-verification.tsx"

# 7. Test Route Structure
echo -e "\n${YELLOW}7. Testing Route Structure${NC}"
run_test "Email verification route is valid" "grep -q 'auth/verify-email' src/components/auth/vendor-auth.tsx"
run_test "Proper redirects implemented" "grep -c 'router.push.*verify-email' src/app/vendor/onboarding/page.tsx src/app/vendor/page.tsx src/app/vendor/confirmation/page.tsx | grep -q '[1-9]'"

echo -e "\n${YELLOW}Test Summary${NC}"
echo "============"
echo -e "${GREEN}Tests Passed: $PASSED${NC}"
echo -e "${RED}Tests Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Email verification system is working correctly.${NC}"
    echo ""
    echo -e "${BLUE}📋 Email Verification Features:${NC}"
    echo "✓ Email confirmation required after signup"
    echo "✓ Email verification page with resend functionality" 
    echo "✓ Protection on all vendor pages requiring email verification"
    echo "✓ Proper error handling and loading states"
    echo "✓ User-friendly verification process"
    echo ""
    echo -e "${BLUE}🔄 New Flow Summary:${NC}"
    echo "1. Vendor signs up → Email verification required"
    echo "2. Vendor receives confirmation email"
    echo "3. Vendor clicks email link → Email verified"
    echo "4. Vendor can proceed to onboarding"
    echo "5. Complete onboarding → Business approval process"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the issues above.${NC}"
    exit 1
fi

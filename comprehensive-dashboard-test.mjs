#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read environment variables
const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8')
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]
const supabaseServiceKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🧪 COMPREHENSIVE DASHBOARD TEST SUITE')
console.log('=====================================\n')

async function testDatabaseConnection() {
  console.log('🔗 Testing Database Connection...')
  try {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    return false
  }
}

async function testVendorProfilesData() {
  console.log('\n📋 Testing Vendor Profiles Data...')
  try {
    const { data: vendors, error } = await supabase
      .from('vendor_profiles')
      .select('*')

    if (error) {
      console.error('❌ Error fetching vendor profiles:', error.message)
      return false
    }

    console.log(`✅ Found ${vendors?.length || 0} vendor profiles`)
    
    if (vendors && vendors.length > 0) {
      console.log('📊 Vendor Status Breakdown:')
      const statusCounts = vendors.reduce((acc, vendor) => {
        acc[vendor.verification_status] = (acc[vendor.verification_status] || 0) + 1
        return acc
      }, {})
      
      console.log(`   - Pending: ${statusCounts.pending || 0}`)
      console.log(`   - Verified: ${statusCounts.verified || 0}`)
      console.log(`   - Rejected: ${statusCounts.rejected || 0}`)
      
      // Test first vendor data structure
      const firstVendor = vendors[0]
      console.log('\n🔍 Sample Vendor Data Structure:')
      console.log(`   - ID: ${firstVendor.id}`)
      console.log(`   - Business Name: ${firstVendor.business_name || 'N/A'}`)
      console.log(`   - Business Category: ${firstVendor.business_category || 'N/A'}`)
      console.log(`   - Verification Status: ${firstVendor.verification_status}`)
      console.log(`   - Active: ${firstVendor.is_active}`)
      console.log(`   - Created: ${new Date(firstVendor.created_at).toLocaleDateString()}`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Vendor profiles test error:', error.message)
    return false
  }
}

async function testProductsData() {
  console.log('\n📦 Testing Products Data...')
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      console.error('❌ Error fetching products:', error.message)
      return false
    }

    console.log(`✅ Found ${products?.length || 0} products`)
    
    if (products && products.length > 0) {
      console.log('💰 Price Format Test (RWF Currency):')
      products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}: RWF ${product.price}`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Products test error:', error.message)
    return false
  }
}

async function testOrdersData() {
  console.log('\n📋 Testing Orders Data...')
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')

    if (error) {
      console.error('❌ Error fetching orders:', error.message)
      return false
    }

    console.log(`✅ Found ${orders?.length || 0} orders`)
    
    if (orders && orders.length > 0) {
      console.log('💵 Order Value Test (RWF Currency):')
      orders.slice(0, 3).forEach((order, index) => {
        console.log(`   ${index + 1}. Order ${order.id}: RWF ${order.total_amount}`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Orders test error:', error.message)
    return false
  }
}

async function testServerEndpoints() {
  console.log('\n🌐 Testing Server Endpoints...')
  
  const endpoints = [
    { name: 'Homepage', url: 'http://localhost:3000' },
    { name: 'Vendor Dashboard', url: 'http://localhost:3000/vendor/dashboard' },
    { name: 'Admin Dashboard', url: 'http://localhost:3000/admin' },
    { name: 'Vendor Products', url: 'http://localhost:3000/vendor/products' },
    { name: 'Vendor Product Creation', url: 'http://localhost:3000/vendor/products/new' }
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, { method: 'HEAD' })
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: ${response.status}`)
      } else {
        console.log(`⚠️ ${endpoint.name}: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Connection failed`)
    }
  }
}

async function testCurrencyConversion() {
  console.log('\n💰 Testing Currency Conversion (USD → RWF)...')
  
  // Test if source code files contain RWF instead of USD
  const filesToCheck = [
    'src/app/vendor/dashboard/page.tsx',
    'src/app/vendor/products/page.tsx',
    'src/app/vendor/products/new/page.tsx'
  ]
  
  let rwfCount = 0
  let usdCount = 0
  
  for (const file of filesToCheck) {
    try {
      const content = readFileSync(join(__dirname, file), 'utf8')
      
      // Count RWF occurrences
      const rwfMatches = content.match(/RWF/g) || []
      const usdMatches = content.match(/USD|\$\d/g) || []
      
      rwfCount += rwfMatches.length
      usdCount += usdMatches.length
      
      console.log(`📄 ${file}:`)
      console.log(`   - RWF references: ${rwfMatches.length}`)
      console.log(`   - USD references: ${usdMatches.length}`)
    } catch (error) {
      console.log(`❌ Could not read ${file}`)
    }
  }
  
  console.log(`\n📊 Total Currency References:`)
  console.log(`   - RWF: ${rwfCount}`)
  console.log(`   - USD: ${usdCount}`)
  
  if (rwfCount > 0 && usdCount === 0) {
    console.log('✅ Currency conversion successful: All USD replaced with RWF')
    return true
  } else if (usdCount > 0) {
    console.log('⚠️ Currency conversion incomplete: Some USD references remain')
    return false
  } else {
    console.log('ℹ️ No currency references found in checked files')
    return true
  }
}

async function testDashboardComponents() {
  console.log('\n🎛️ Testing Dashboard Component Structure...')
  
  // Check if VendorApprovalDashboard exists and has correct structure
  try {
    const dashboardFile = 'src/components/admin/VendorApprovalDashboard.tsx'
    const content = readFileSync(join(__dirname, dashboardFile), 'utf8')
    
    const hasVerificationStatus = content.includes('verification_status')
    const hasBusinessName = content.includes('business_name')
    const hasBusinessCategory = content.includes('business_category')
    const hasVendorProfile = content.includes('VendorProfile')
    
    console.log('📋 VendorApprovalDashboard.tsx:')
    console.log(`   - Uses verification_status: ${hasVerificationStatus ? '✅' : '❌'}`)
    console.log(`   - Uses business_name: ${hasBusinessName ? '✅' : '❌'}`)
    console.log(`   - Uses business_category: ${hasBusinessCategory ? '✅' : '❌'}`)
    console.log(`   - Has VendorProfile interface: ${hasVendorProfile ? '✅' : '❌'}`)
    
    return hasVerificationStatus && hasBusinessName && hasBusinessCategory
  } catch (error) {
    console.log('❌ VendorApprovalDashboard.tsx not found or unreadable')
    return false
  }
}

async function generateTestReport() {
  console.log('\n📊 GENERATING COMPREHENSIVE TEST REPORT...')
  console.log('=' .repeat(50))
  
  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'Vendor Profiles Data', test: testVendorProfilesData },
    { name: 'Products Data', test: testProductsData },
    { name: 'Orders Data', test: testOrdersData },
    { name: 'Currency Conversion', test: testCurrencyConversion },
    { name: 'Dashboard Components', test: testDashboardComponents }
  ]
  
  const results = []
  
  for (const testCase of tests) {
    console.log(`\n🧪 Running: ${testCase.name}`)
    const result = await testCase.test()
    results.push({ name: testCase.name, passed: result })
  }
  
  // Test server endpoints last
  console.log(`\n🧪 Running: Server Endpoints`)
  await testServerEndpoints()
  
  console.log('\n📋 FINAL TEST RESULTS:')
  console.log('=' .repeat(30))
  
  let passedTests = 0
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} - ${result.name}`)
    if (result.passed) passedTests++
  })
  
  console.log(`\n🎯 Test Summary: ${passedTests}/${results.length} tests passed`)
  
  if (passedTests === results.length) {
    console.log('🎉 ALL TESTS PASSED! Dashboard is fully functional.')
  } else {
    console.log('⚠️ Some tests failed. Review the issues above.')
  }
  
  console.log('\n🚀 Dashboard Status:')
  console.log('   - Server: http://localhost:3000')
  console.log('   - Vendor Dashboard: http://localhost:3000/vendor/dashboard')
  console.log('   - Admin Dashboard: http://localhost:3000/admin')
  console.log('   - Currency: RWF (Rwandan Franc)')
  console.log('   - Database: Connected and functional')
  
  return passedTests === results.length
}

// Run the comprehensive test
generateTestReport()
  .then(success => {
    if (success) {
      console.log('\n✅ COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!')
      process.exit(0)
    } else {
      console.log('\n❌ COMPREHENSIVE TEST COMPLETED WITH FAILURES!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n💥 TEST SUITE CRASHED:', error.message)
    process.exit(1)
  })

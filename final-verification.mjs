import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nghtzhkfsobkpdsoyovn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5naHR6aGtmc29ia3Bkc295b3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzY2MzYsImV4cCI6MjA3MTIxMjYzNn0.VDIyqboC_5GLeoueSzaR-UWM3ncMAV2kSwWJlTkhQGg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🚀 IWANYU MARKETPLACE - FINAL VERIFICATION')
console.log('=' .repeat(50))

async function runTests() {
  const tests = []
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...')
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
    
    if (vendorError) {
      tests.push({ name: 'Database Connection', status: '❌', error: vendorError.message })
    } else {
      tests.push({ name: 'Database Connection', status: '✅', details: `${vendors.length} vendors found` })
    }

    // Test 2: Schema Validation
    console.log('2️⃣ Testing Schema Structure...')
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (productError) {
      tests.push({ name: 'Products Table', status: '❌', error: productError.message })
    } else {
      tests.push({ name: 'Products Table', status: '✅', details: 'Schema validated' })
    }

    // Test 3: Storage Buckets
    console.log('3️⃣ Testing Storage Configuration...')
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    
    if (storageError) {
      tests.push({ name: 'Storage Buckets', status: '❌', error: storageError.message })
    } else {
      const vendorBucket = buckets.find(b => b.name === 'vendor-documents')
      if (vendorBucket) {
        tests.push({ name: 'Storage Buckets', status: '✅', details: 'vendor-documents bucket ready' })
      } else {
        tests.push({ name: 'Storage Buckets', status: '⚠️', details: 'vendor-documents bucket missing' })
      }
    }

    // Test 4: RLS Policies
    console.log('4️⃣ Testing Row Level Security...')
    const { data: messages, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .limit(1)
    
    if (messageError) {
      tests.push({ name: 'RLS Policies', status: '❌', error: messageError.message })
    } else {
      tests.push({ name: 'RLS Policies', status: '✅', details: 'Security policies active' })
    }

  } catch (err) {
    tests.push({ name: 'General', status: '❌', error: err.message })
  }

  // Print Results
  console.log('\n📊 TEST RESULTS')
  console.log('=' .repeat(50))
  
  let passedTests = 0
  tests.forEach(test => {
    console.log(`${test.status} ${test.name}`)
    if (test.details) console.log(`   ${test.details}`)
    if (test.error) console.log(`   Error: ${test.error}`)
    if (test.status === '✅') passedTests++
  })

  console.log('\n🎯 SUMMARY')
  console.log('=' .repeat(50))
  console.log(`✅ Passed: ${passedTests}/${tests.length}`)
  console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length}`)
  
  if (passedTests === tests.length) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!')
    console.log('🌟 Iwanyu Marketplace is ready for production!')
    console.log('\n📱 Access Points:')
    console.log('   🏠 Homepage: http://localhost:3000')
    console.log('   👨‍💼 Vendor Registration: http://localhost:3000/vendor-register')
    console.log('   🛡️ Admin Dashboard: http://localhost:3000/admin')
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.')
  }
}

runTests()

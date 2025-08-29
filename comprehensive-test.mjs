import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE DATABASE TESTS STARTING...\n')

  // Test 1: Database Connection
  console.log('1️⃣ Testing Database Connection...')
  try {
    const { data, error, count } = await supabase.from('vendors').select('*', { count: 'exact', head: true })
    if (error) throw error
    console.log('✅ Database connection successful')
    console.log(`📊 Current vendors count: ${count || 0}`)
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
    return
  }

  // Test 2: Vendors Table
  console.log('\n2️⃣ Testing Vendors Table...')
  try {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`✅ Vendors table accessible - Found ${vendors.length} vendors`)
    if (vendors.length > 0) {
      console.log(`📋 Sample vendor: ${vendors[0].shop_name} (${vendors[0].status})`)
    }
  } catch (error) {
    console.log('❌ Vendors table test failed:', error.message)
  }

  // Test 3: Orders Table
  console.log('\n3️⃣ Testing Orders Table...')
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`✅ Orders table accessible - Found ${orders.length} orders`)
    if (orders.length > 0) {
      console.log(`📋 Sample order: #${orders[0].id.slice(0, 8)} - ${orders[0].status}`)
    }
  } catch (error) {
    console.log('❌ Orders table test failed:', error.message)
  }

  // Test 4: Messages Table
  console.log('\n4️⃣ Testing Messages Table...')
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`✅ Messages table accessible - Found ${messages.length} messages`)
    if (messages.length > 0) {
      console.log(`📋 Sample message: "${messages[0].content.slice(0, 50)}..."`)
    }
  } catch (error) {
    console.log('❌ Messages table test failed:', error.message)
  }

  // Test 5: Profiles Table
  console.log('\n5️⃣ Testing Profiles Table...')
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`✅ Profiles table accessible - Found ${profiles.length} profiles`)
    if (profiles.length > 0) {
      console.log(`📋 Sample profile: ${profiles[0].role || 'No role'} user`)
    }
  } catch (error) {
    console.log('❌ Profiles table test failed:', error.message)
  }

  // Test 6: Check for Products Table (Should Not Exist)
  console.log('\n6️⃣ Testing Products Table Removal...')
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    console.log('❌ Products table still exists! This should have been removed.')
  } catch (error) {
    if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
      console.log('✅ Products table successfully removed - Perfect!')
    } else {
      console.log('⚠️ Unexpected error:', error.message)
    }
  }

  // Test 7: Authentication Tables
  console.log('\n7️⃣ Testing Authentication System...')
  try {
    const { data: users, error } = await supabase.auth.getSession()
    console.log('✅ Authentication system accessible')
    console.log(`🔐 Current session: ${users.session ? 'Active' : 'No active session'}`)
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message)
  }

  console.log('\n🎉 COMPREHENSIVE TESTS COMPLETED!')
  console.log('=' .repeat(50))
}

runComprehensiveTests().catch(console.error)

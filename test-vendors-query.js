const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nghtzhkfsobkpdsoyovn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5naHR6aGtmc29ia3Bkc295b3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzY2MzYsImV4cCI6MjA3MTIxMjYzNn0.VDIyqboC_5GLeoueSzaR-UWM3ncMAV2kSwWJlTkhQGg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVendorsQuery() {
  console.log('Testing vendors query...')
  
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .limit(5)
    
    console.log('Query result:', { data, error })
    
    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Success! Found', data?.length || 0, 'vendors')
      if (data && data.length > 0) {
        console.log('First vendor:', data[0])
      }
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

testVendorsQuery()

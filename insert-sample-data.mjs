// Sample data insertion script for testing vendor and image display
import { createClient } from './src/lib/supabase-client.js'

const supabase = createClient()

async function insertSampleData() {
  console.log('🔄 Inserting sample data for testing...')
  
  try {
    // First, let's check if we have any vendors
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .limit(5)
    
    console.log('Existing vendors:', vendors?.length || 0)
    
    // If no vendors exist, create a sample vendor
    if (!vendors || vendors.length === 0) {
      const { data: newVendor, error: vendorError } = await supabase
        .from('vendors')
        .insert([
          {
            full_name: 'John Doe',
            business_name: 'John\'s Electronics',
            business_address: '123 Main Street, City, Country',
            phone_number: '+1234567890',
            status: 'approved'
          }
        ])
        .select()
      
      if (vendorError) {
        console.error('Error creating vendor:', vendorError)
      } else {
        console.log('✅ Created sample vendor:', newVendor[0])
      }
    }
    
    // Check existing products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    console.log('Existing products:', products?.length || 0)
    
    // Add sample product images for existing products
    if (products && products.length > 0) {
      for (const product of products.slice(0, 3)) {
        // Check if product already has images
        const { data: existingImages } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id)
        
        if (!existingImages || existingImages.length === 0) {
          const sampleImageUrl = `https://picsum.photos/400/400?random=${product.id}`
          
          const { data: newImage, error: imageError } = await supabase
            .from('product_images')
            .insert([
              {
                product_id: product.id,
                image_url: sampleImageUrl,
                alt_text: product.name,
                position: 0
              }
            ])
          
          if (imageError) {
            console.error(`Error adding image for product ${product.name}:`, imageError)
          } else {
            console.log(`✅ Added image for product: ${product.name}`)
          }
        }
      }
    }
    
    console.log('✅ Sample data insertion completed!')
    
  } catch (error) {
    console.error('❌ Error in sample data insertion:', error)
  }
}

insertSampleData()

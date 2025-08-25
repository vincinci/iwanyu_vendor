// Add sample product with real image for testing
import { createClient } from './src/lib/supabase-client.js'

const supabase = createClient()

async function addSampleProductWithImage() {
  console.log('🔄 Adding sample product with real image...')
  
  try {
    // Get a vendor to associate the product with
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id')
      .limit(1)
    
    if (!vendors || vendors.length === 0) {
      console.log('No vendors found. Please add a vendor first.')
      return
    }
    
    const vendorId = vendors[0].id
    
    // Add a product with a real image URL
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([
        {
          vendor_id: vendorId,
          name: 'Sample Product with Image',
          description: 'This is a test product with a real image from unsplash',
          price: 25000,
          stock_quantity: 15,
          is_active: true,
          is_featured: false
        }
      ])
      .select()
    
    if (productError) {
      console.error('Error creating product:', productError)
      return
    }
    
    console.log('✅ Created product:', product[0])
    
    // Add a real image for this product
    const { data: image, error: imageError } = await supabase
      .from('product_images')
      .insert([
        {
          product_id: product[0].id,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
          alt_text: 'Sample product image',
          position: 0
        }
      ])
    
    if (imageError) {
      console.error('Error adding image:', imageError)
    } else {
      console.log('✅ Added product image successfully')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addSampleProductWithImage()

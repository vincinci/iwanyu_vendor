// Quick test to verify improved Shopify export functionality
// This will test that images, categories, and inventory are properly exported

import { ShopifyExporter } from './src/lib/shopify-export'

async function testImprovedExport() {
  console.log('🧪 TESTING IMPROVED SHOPIFY EXPORT')
  console.log('==================================')
  console.log('Testing: Images, Categories, Inventory, and Prices')
  
  try {
    const exporter = new ShopifyExporter()
    
    console.log('\n📊 Step 1: Fetching products with complete data...')
    const products = await exporter.fetchProductsForExport()
    
    if (products.length === 0) {
      console.log('❌ No products found to test export')
      return
    }
    
    console.log(`✅ Found ${products.length} products`)
    
    // Log first product details for verification
    if (products[0]) {
      const product = products[0]
      console.log('\n📋 Sample Product Data:')
      console.log(`- Name: ${product.name}`)
      console.log(`- Category: ${product.category?.name || 'No category'}`)
      console.log(`- Vendor: ${product.vendor?.business_name || product.vendor?.full_name || 'No vendor'}`)
      console.log(`- Price: $${product.price}`)
      console.log(`- Inventory: ${product.inventory_quantity}`)
      console.log(`- Images: ${product.product_images?.length || 0}`)
      if (product.product_images?.[0]) {
        console.log(`- Main Image: ${product.product_images[0].image_url}`)
      }
    }
    
    console.log('\n📤 Step 2: Converting to Shopify format...')
    const shopifyProducts = exporter.convertToShopifyFormat(products)
    
    console.log(`✅ Generated ${shopifyProducts.length} Shopify rows`)
    
    // Analyze the first product row
    if (shopifyProducts[0]) {
      const shopifyProduct = shopifyProducts[0]
      console.log('\n📋 Sample Shopify Export Data:')
      console.log(`- Handle: ${shopifyProduct['Handle']}`)
      console.log(`- Title: ${shopifyProduct['Title']}`)
      console.log(`- Category: ${shopifyProduct['Product Category']}`)
      console.log(`- Vendor: ${shopifyProduct['Vendor']}`)
      console.log(`- Price: $${shopifyProduct['Variant Price']}`)
      console.log(`- Inventory: ${shopifyProduct['Variant Inventory Qty']}`)
      console.log(`- Image Src: ${shopifyProduct['Image Src'] ? 'YES' : 'NO'}`)
      if (shopifyProduct['Image Src']) {
        console.log(`- Image URL: ${shopifyProduct['Image Src']}`)
      }
    }
    
    console.log('\n📊 Step 3: Checking for issues...')
    
    // Check for products with images
    const productsWithImages = shopifyProducts.filter(p => p['Image Src'] && p['Image Src'].trim() !== '')
    console.log(`✅ Products with images: ${productsWithImages.length}`)
    
    // Check for proper categories
    const productsWithCategories = shopifyProducts.filter(p => p['Product Category'] && p['Product Category'] !== 'Uncategorized')
    console.log(`✅ Products with categories: ${productsWithCategories.length}`)
    
    // Check for inventory
    const productsWithInventory = shopifyProducts.filter(p => p['Variant Inventory Qty'] && Number(p['Variant Inventory Qty']) > 0)
    console.log(`✅ Products with inventory > 0: ${productsWithInventory.length}`)
    
    // Check for proper prices
    const productsWithPrices = shopifyProducts.filter(p => p['Variant Price'] && Number(p['Variant Price']) > 0)
    console.log(`✅ Products with prices > 0: ${productsWithPrices.length}`)
    
    console.log('\n📝 Step 4: Generating CSV...')
    const csvContent = exporter.generateCSV(shopifyProducts)
    
    console.log(`✅ CSV generated successfully (${csvContent.length} characters)`)
    
    // Show CSV preview
    const lines = csvContent.split('\n')
    console.log('\n📄 CSV Preview (first 3 lines):')
    lines.slice(0, 3).forEach((line, index) => {
      console.log(`${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`)
    })
    
    console.log('\n🎯 EXPORT TEST RESULTS:')
    console.log('=======================')
    console.log(`✅ Total products exported: ${products.length}`)
    console.log(`✅ Total CSV rows: ${shopifyProducts.length}`)
    console.log(`✅ Products with images: ${productsWithImages.length}`)
    console.log(`✅ Products with categories: ${productsWithCategories.length}`)
    console.log(`✅ Products with inventory: ${productsWithInventory.length}`)
    console.log(`✅ Products with prices: ${productsWithPrices.length}`)
    
    if (productsWithImages.length > 0 && productsWithCategories.length > 0 && productsWithInventory.length > 0) {
      console.log('\n🎉 SUCCESS: Export includes images, categories, inventory and prices!')
    } else {
      console.log('\n⚠️ WARNING: Some data might be missing from export')
    }
    
  } catch (error) {
    console.error('❌ Export test failed:', error)
  }
}

testImprovedExport()

// Test script to validate CSV export functionality
// This can be run in browser console on the admin products page

async function testCSVExport() {
  console.log('🧪 Testing CSV Export Functionality...');
  
  try {
    // Import the CSV exporter
    const { csvExporter } = await import('/src/lib/csv-export.ts');
    
    console.log('✅ CSV Export library loaded successfully');
    
    // Test getting recent products (7 days)
    console.log('📅 Testing recent products export (7 days)...');
    const recentProducts = await csvExporter.getRecentProducts(7);
    console.log(`✅ Found ${recentProducts.length} recent products`);
    
    if (recentProducts.length > 0) {
      console.log('📄 Sample product data:', recentProducts[0]);
    }
    
    // Test different export formats
    console.log('📊 Testing export formats...');
    
    if (recentProducts.length > 0) {
      // Test Simple format
      const simpleCSV = csvExporter.convertToCSV(recentProducts, 'simple');
      console.log('✅ Simple CSV generated:', simpleCSV.split('\n')[0]); // Header line
      
      // Test Detailed format
      const detailedCSV = csvExporter.convertToCSV(recentProducts, 'detailed');
      console.log('✅ Detailed CSV generated:', detailedCSV.split('\n')[0]); // Header line
      
      // Test Shopify format
      const shopifyCSV = csvExporter.convertToCSV(recentProducts, 'shopify');
      console.log('✅ Shopify CSV generated:', shopifyCSV.split('\n')[0]); // Header line
    }
    
    // Test filtering
    console.log('🔍 Testing advanced filtering...');
    const filteredProducts = await csvExporter.getProductsForExport({
      status: 'active',
      sortBy: 'newest'
    });
    console.log(`✅ Filtered ${filteredProducts.length} active products`);
    
    // Test category and vendor options
    console.log('📂 Testing filter options...');
    const categories = await csvExporter.getAvailableCategories();
    console.log(`✅ Found ${categories.length} categories:`, categories);
    
    const vendors = await csvExporter.getAvailableVendors();
    console.log(`✅ Found ${vendors.length} vendors:`, vendors.map(v => v.business));
    
    console.log('🎉 All CSV export tests passed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Recent products: ${recentProducts.length}`);
    console.log(`   - Active products: ${filteredProducts.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Vendors: ${vendors.length}`);
    console.log(`   - Export formats: 3 (Simple, Detailed, Shopify)`);
    
    return {
      success: true,
      recentProducts: recentProducts.length,
      activeProducts: filteredProducts.length,
      categories: categories.length,
      vendors: vendors.length
    };
    
  } catch (error) {
    console.error('❌ CSV Export test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Instructions for manual testing
console.log(`
🧪 CSV Export Manual Test Instructions:
========================================

1. Open https://seller.iwanyu.store/admin/products
2. Login as admin
3. Look for these new features:

   📊 EXPORT BUTTONS:
   - "Export CSV" button in header (green button)
   - Quick export section with:
     * "All Products" button
     * "Last 7 Days" button  
     * "Last 30 Days" button
     * "Shopify Format" button

   🎛️ ADVANCED MODAL:
   - Click "Export CSV" to open advanced options
   - Test date range selection
   - Test category filtering
   - Test different export formats
   - Watch preview count update

   📁 FILE DOWNLOADS:
   - Files download automatically as CSV
   - Check filename format: [type]_[date]_[time].csv
   - Open in Excel/Google Sheets to verify format

4. Run this test: testCSVExport()
5. Check browser console for test results

Expected Results:
- All export buttons visible and functional
- Modal opens with proper filtering options
- CSV files download with correct data
- Multiple export formats work properly
- Preview counts match actual exports
`);

// Auto-run test if in browser environment
if (typeof window !== 'undefined') {
  // testCSVExport();
}

# 📊 CSV Export Feature - User Guide

## 🎯 Quick Start Guide

### Accessing the CSV Export Feature
1. **Login as Admin** at https://seller.iwanyu.store/admin
2. **Navigate to Products** section
3. **Look for export buttons** in the interface

---

## 🚀 Quick Export Options (One-Click)

Located in the "Quick Export" section of the Products page:

### 1. **Last 7 Days** 
- **What it does**: Exports all products added in the last 7 days
- **Format**: Detailed CSV with all product information
- **Perfect for**: Weekly new product reports

### 2. **Last 30 Days**
- **What it does**: Exports all products added in the last 30 days
- **Format**: Detailed CSV with all product information
- **Perfect for**: Monthly new product analysis

### 3. **Shopify Format**
- **What it does**: Exports all active products in Shopify-compatible format
- **Format**: Ready-to-import Shopify CSV
- **Perfect for**: E-commerce platform migration

---

## 🎛️ Advanced Export (Custom Filters)

Click the **"Export CSV"** button in the header to open the advanced export modal:

### Date Range Filtering
- **Custom Date Range**: Select specific "From" and "To" dates
- **Perfect for**: Exporting products from specific time periods

### Product Filtering
- **Category**: Filter by product category (clothing, food, home, electronics, etc.)
- **Status**: Active only, Inactive only, or All products
- **Stock Level**: All, Low Stock (≤10), or Out of Stock only

### Sorting Options
- **Newest First**: Most recently added products first
- **Oldest First**: Oldest products first  
- **Name A-Z**: Alphabetical by product name
- **Price Low-High**: Cheapest products first

### Export Formats
1. **Simple Format**
   - Fields: Name, Price, Category, Stock, Vendor, Status, Created Date
   - Use for: Quick overviews and basic reporting

2. **Detailed Format** (Recommended)
   - Fields: All product data including ID, Description, SKU, Images, Timestamps
   - Use for: Comprehensive analysis and data backup

3. **Shopify Format**
   - Fields: Handle, Title, Body, Vendor, Categories, Variants, SEO, etc.
   - Use for: Importing to Shopify or other e-commerce platforms

---

## 📁 Export File Details

### File Naming
- Format: `[type]_[date]_[time].csv`
- Examples:
  - `recent_products_7_days_2025-08-21_14-30-25.csv`
  - `products_export_detailed_2025-08-21_14-30-25.csv`
  - `products_export_shopify_2025-08-21_14-30-25.csv`

### File Content Examples

**Simple Format:**
```csv
Name,Price,Category,Stock,Vendor,Status,Created Date
Traditional Fabric,35000,clothing,25,vincinci,Active,8/21/2025
Rwanda Coffee Beans,18000,food,50,vincinci,Active,8/21/2025
```

**Detailed Format:**
```csv
ID,Name,Description,Price,Category,Stock Quantity,Status,Vendor Name,Vendor Business,SKU,Images Count,Created Date,Updated Date
c5d17001-6b41-49c1-9c9e-4919d6e592ca,Traditional Fabric,Beautiful traditional Rwandan fabric,35000,clothing,25,Active,vincinci,vincinci,TRA_444881,0,2025-08-21T04:14:32.444881+00:00,2025-08-21T04:14:32.444881+00:00
```

**Shopify Format:**
```csv
Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Variant SKU,Variant Grams,Variant Inventory Tracker,Variant Inventory Qty,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Image Position,Image Alt Text,Gift Card,SEO Title,SEO Description,Status
traditional-fabric,Traditional Fabric,<p>Beautiful traditional Rwandan fabric</p>,vincinci,clothing,Clothing,,TRUE,TRA_444881,0,shopify,25,deny,manual,35000,,TRUE,TRUE,,,1,Traditional Fabric,FALSE,Traditional Fabric | Iwanyu Store,Beautiful traditional Rwandan fabric,active
```

---

## 🎯 Common Use Cases

### 1. **New Product Reports**
- **Scenario**: Need to see all products added this week
- **Solution**: Click "Last 7 Days" quick export
- **Result**: Instant download of recent products

### 2. **Monthly Inventory Review**
- **Scenario**: Monthly review of all new products
- **Solution**: Click "Last 30 Days" quick export
- **Result**: Complete monthly new product list

### 3. **Category-Specific Export**
- **Scenario**: Export only electronics products
- **Solution**: Use advanced export → Category: "electronics"
- **Result**: Filtered export by category

### 4. **Platform Migration**
- **Scenario**: Moving products to Shopify
- **Solution**: Click "Shopify Format" quick export
- **Result**: Ready-to-import Shopify CSV

### 5. **Custom Date Range**
- **Scenario**: Export products from specific period (e.g., last quarter)
- **Solution**: Advanced export → Custom date range
- **Result**: Precisely filtered export

---

## 💡 Pro Tips

1. **Preview Before Export**: The modal shows exactly how many products will be exported
2. **Choose Right Format**: Use Simple for reports, Detailed for analysis, Shopify for migration
3. **Quick vs Advanced**: Use quick buttons for common scenarios, advanced modal for specific needs
4. **File Organization**: Files are automatically named with timestamps for easy organization
5. **Data Freshness**: Export reflects real-time database data

---

## 🔧 Technical Details

- **Real-time Data**: Exports always use current database state
- **Performance**: Efficient queries optimized for large datasets
- **Security**: Admin authentication required for all exports
- **Compatibility**: CSV files work with Excel, Google Sheets, and import tools
- **Character Encoding**: UTF-8 for international character support

---

## 📞 Support

If you need help with CSV exports:
1. Check this guide for common scenarios
2. Verify you have admin access
3. Ensure products exist in the database
4. Try different export formats if one doesn't work

**Current Data Available:**
- **3 Products** ready for export
- **1 Vendor** (vincinci) 
- **3 Categories** (clothing, food, home)
- **All products** added today (perfect for testing recent exports)

---

**🎉 Your CSV export feature is now live and ready to use!**

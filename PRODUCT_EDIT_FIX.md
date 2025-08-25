# Database Field Fixes - Products Update

## Issue
The product edit page was failing with error:
```
Could not find the 'category_id' column of 'products' in the schema cache
```

## Root Cause
The product edit functionality was using incorrect database field names:
- Using `category_id` instead of `category`
- Using `inventory_quantity` instead of `stock_quantity`

## Fix Applied
Updated `/src/app/vendor/products/[id]/edit/page.tsx`:

1. **Form Data Loading**: Fixed loading product data to use correct field names
   - `productData.stock_quantity` instead of `productData.inventory_quantity`
   - `productData.category` instead of `productData.category_id`

2. **Product Update**: Fixed update query to use correct field names
   - `stock_quantity: parseInt(formData.inventory_quantity) || 0` instead of `inventory_quantity`
   - `category: formData.category_id || null` instead of `category_id`

## Status
✅ Product edit page should now work without database field errors

## Remaining Work
Other files still contain references to `inventory_quantity` that should be updated to `stock_quantity`:
- Admin dashboard pages
- Product detail pages  
- Shopify export functionality
- Type definitions

These will be addressed in subsequent fixes to maintain consistency across the application.

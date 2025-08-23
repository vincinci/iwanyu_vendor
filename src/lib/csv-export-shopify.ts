import { createClient } from '@/lib/supabase-client'

interface ProductWithVendor {
  id: string
  name: string
  description: string
  price: string
  category: string
  stock_quantity: number
  is_active: boolean
  vendor_id: string
  vendor: {
    business_name: string
    full_name: string
  } | null
}

const SHOPIFY_TEMPLATE_HEADERS = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
  'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position',
  'Image Alt Text', 'Gift Card', 'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category',
  'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN',
  'Google Shopping / Condition', 'Google Shopping / Custom Product', 'Variant Image', 'Variant Weight Unit',
  'Variant Tax Code', 'Cost per item', 'Included / United States', 'Price / United States',
  'Compare At Price / United States', 'Included / International', 'Price / International',
  'Compare At Price / International', 'Status'
]

function escapeCSVValue(value: string): string {
  const stringValue = String(value || '')
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export async function exportShopifyCSV(vendorId?: string): Promise<void> {
  const supabase = createClient()
  
  let query = supabase
    .from('products')
    .select('*, vendor:vendors!vendor_id(business_name, full_name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (vendorId) {
    query = query.eq('vendor_id', vendorId)
  }
  
  const { data: products, error } = await query
  
  if (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }
  
  if (!products || products.length === 0) {
    throw new Error('No products found')
  }
  
  const csvRows: string[] = []
  csvRows.push(SHOPIFY_TEMPLATE_HEADERS.join(','))
  
  products.forEach((product: any) => {
    const handle = product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    const price = parseFloat(product.price).toFixed(2)
    const vendorName = product.vendor?.business_name || product.vendor?.full_name || 'Iwanyu'
    const category = product.category || 'Apparel & Accessories'
    
    const row = [
      handle, product.name, product.description || '', vendorName, category, category, vendorName,
      product.is_active ? 'TRUE' : 'FALSE', '', '', '', '', '', '', product.sku || handle,
      '500', 'shopify', product.stock_quantity.toString(), 'deny', 'manual', price, '',
      'TRUE', 'TRUE', '', '', '', '', 'FALSE', product.name, product.description || '',
      '', '', '', product.sku || handle, 'new', 'FALSE', '', 'g', '', '',
      'TRUE', '', '', 'TRUE', '', '', product.is_active ? 'active' : 'draft'
    ]
    
    const escapedRow = row.map(cell => escapeCSVValue(String(cell || '')))
    csvRows.push(escapedRow.join(','))
  })
  
  const csvContent = csvRows.join('\n')
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
  const filename = `shopify_products_${timestamp}.csv`
  
  downloadCSV(csvContent, filename)
}

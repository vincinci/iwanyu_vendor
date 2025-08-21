// CSV Export Utilities for Admin Dashboard
import { createClient } from '@/lib/supabase-client'

export interface ProductExportData {
  id: string
  name: string
  description: string
  price: string
  vendor_name: string
  vendor_business: string
  category: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  sku?: string
  images?: string[]
}

export interface ExportFilters {
  dateRange?: {
    from: Date
    to: Date
  }
  category?: string
  vendor?: string
  status?: 'active' | 'inactive' | 'all'
  stockLevel?: 'low' | 'out' | 'all'
  sortBy?: 'newest' | 'oldest' | 'name' | 'price'
}

interface ProductWithVendor {
  id: string
  name: string
  description: string
  price: string
  category: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  sku?: string
  images?: string[]
  vendor_id: string
  vendors: {
    business_name: string
    full_name: string
  }[] | null
}

export class ProductCSVExporter {
  private supabase = createClient()

  // Get products based on filters
  async getProductsForExport(filters: ExportFilters = {}): Promise<ProductExportData[]> {
    let query = this.supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        category,
        stock_quantity,
        is_active,
        created_at,
        updated_at,
        sku,
        images,
        vendor_id,
        vendors(
          business_name,
          full_name
        )
      `)

    // Apply date range filter
    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.from.toISOString())
        .lte('created_at', filters.dateRange.to.toISOString())
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    // Apply status filter
    if (filters.status === 'active') {
      query = query.eq('is_active', true)
    } else if (filters.status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Apply stock level filter
    if (filters.stockLevel === 'low') {
      query = query.lte('stock_quantity', 10)
    } else if (filters.stockLevel === 'out') {
      query = query.eq('stock_quantity', 0)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'price':
        query = query.order('price', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return (data as ProductWithVendor[] || []).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      vendor_name: product.vendors?.[0]?.full_name || 'Unknown',
      vendor_business: product.vendors?.[0]?.business_name || 'Unknown Business',
      category: product.category,
      stock_quantity: product.stock_quantity,
      is_active: product.is_active,
      created_at: product.created_at,
      updated_at: product.updated_at,
      sku: product.sku,
      images: product.images
    }))
  }

  // Get recently added products (last 7, 30, or 90 days)
  async getRecentProducts(days: 7 | 30 | 90 = 7): Promise<ProductExportData[]> {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    
    return this.getProductsForExport({
      dateRange: {
        from: fromDate,
        to: new Date()
      },
      sortBy: 'newest'
    })
  }

  // Convert products to CSV format
  convertToCSV(products: ProductExportData[], format: 'simple' | 'detailed' | 'shopify' = 'detailed'): string {
    if (products.length === 0) {
      return 'No products found'
    }

    switch (format) {
      case 'simple':
        return this.generateSimpleCSV(products)
      case 'shopify':
        return this.generateShopifyCSV(products)
      default:
        return this.generateDetailedCSV(products)
    }
  }

  private generateSimpleCSV(products: ProductExportData[]): string {
    const headers = ['Name', 'Price', 'Category', 'Stock', 'Vendor', 'Status', 'Created Date']
    
    const rows = products.map(product => [
      this.escapeCsvField(product.name),
      product.price,
      product.category,
      product.stock_quantity.toString(),
      this.escapeCsvField(product.vendor_business),
      product.is_active ? 'Active' : 'Inactive',
      new Date(product.created_at).toLocaleDateString()
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private generateDetailedCSV(products: ProductExportData[]): string {
    const headers = [
      'ID',
      'Name', 
      'Description',
      'Price',
      'Category',
      'Stock Quantity',
      'Status',
      'Vendor Name',
      'Vendor Business',
      'SKU',
      'Images Count',
      'Created Date',
      'Updated Date'
    ]
    
    const rows = products.map(product => [
      product.id,
      this.escapeCsvField(product.name),
      this.escapeCsvField(product.description),
      product.price,
      product.category,
      product.stock_quantity.toString(),
      product.is_active ? 'Active' : 'Inactive',
      this.escapeCsvField(product.vendor_name),
      this.escapeCsvField(product.vendor_business),
      product.sku || '',
      (product.images?.length || 0).toString(),
      new Date(product.created_at).toISOString(),
      new Date(product.updated_at).toISOString()
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private generateShopifyCSV(products: ProductExportData[]): string {
    // Shopify CSV format based on the template provided
    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Product Category',
      'Type',
      'Tags',
      'Published',
      'Variant SKU',
      'Variant Grams',
      'Variant Inventory Tracker',
      'Variant Inventory Qty',
      'Variant Inventory Policy',
      'Variant Fulfillment Service',
      'Variant Price',
      'Variant Compare At Price',
      'Variant Requires Shipping',
      'Variant Taxable',
      'Variant Barcode',
      'Image Src',
      'Image Position',
      'Image Alt Text',
      'Gift Card',
      'SEO Title',
      'SEO Description',
      'Status'
    ]
    
    const rows = products.map(product => [
      this.generateHandle(product.name),
      this.escapeCsvField(product.name),
      this.escapeCsvField(`<p>${product.description}</p>`),
      this.escapeCsvField(product.vendor_business),
      product.category,
      this.capitalizeFirst(product.category),
      '',
      product.is_active ? 'TRUE' : 'FALSE',
      product.sku || this.generateSKU(product.name),
      '0', // Weight in grams
      'shopify',
      product.stock_quantity.toString(),
      'deny',
      'manual',
      product.price,
      '', // Compare at price
      'TRUE',
      'TRUE',
      product.sku || '',
      product.images?.[0] || '',
      '1',
      this.escapeCsvField(product.name),
      'FALSE',
      this.escapeCsvField(`${product.name} | Iwanyu Store`),
      this.escapeCsvField(product.description),
      product.is_active ? 'active' : 'draft'
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`
    }
    return field
  }

  private generateHandle(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  private generateSKU(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}_${timestamp}`
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Download CSV file
  downloadCSV(csvContent: string, filename: string): void {
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

  // Generate filename with current date
  generateFilename(prefix: string, format: string): string {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
    return `${prefix}_${dateStr}_${timeStr}.${format}`
  }

  // Get available categories for filter options
  async getAvailableCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    const categories = [...new Set(data?.map(item => item.category) || [])]
    return categories.sort()
  }

  // Get available vendors for filter options
  async getAvailableVendors(): Promise<{id: string, name: string, business: string}[]> {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('id, full_name, business_name')
      .eq('status', 'approved')

    if (error) {
      throw new Error(`Failed to fetch vendors: ${error.message}`)
    }

    return (data || []).map(vendor => ({
      id: vendor.id,
      name: vendor.full_name || 'Unknown',
      business: vendor.business_name || 'Unknown Business'
    }))
  }
}

// Export singleton instance
export const csvExporter = new ProductCSVExporter()

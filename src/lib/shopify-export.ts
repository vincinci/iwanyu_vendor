import { createClientSupabase } from './supabase'

// Shopify Product CSV Export Interface
export interface ShopifyProduct {
  'Handle': string
  'Title': string
  'Body (HTML)': string
  'Vendor': string
  'Product Category': string
  'Type': string
  'Tags': string
  'Published': string
  'Option1 Name': string
  'Option1 Value': string
  'Option2 Name': string
  'Option2 Value': string
  'Option3 Name': string
  'Option3 Value': string
  'Variant SKU': string
  'Variant Grams': string
  'Variant Inventory Tracker': string
  'Variant Inventory Qty': string
  'Variant Inventory Policy': string
  'Variant Fulfillment Service': string
  'Variant Price': string
  'Variant Compare At Price': string
  'Variant Requires Shipping': string
  'Variant Taxable': string
  'Variant Barcode': string
  'Image Src': string
  'Image Position': string
  'Image Alt Text': string
  'Gift Card': string
  'SEO Title': string
  'SEO Description': string
  'Google Shopping / Google Product Category': string
  'Google Shopping / Gender': string
  'Google Shopping / Age Group': string
  'Google Shopping / MPN': string
  'Google Shopping / Condition': string
  'Google Shopping / Custom Product': string
  'Variant Image': string
  'Variant Weight Unit': string
  'Variant Tax Code': string
  'Cost per item': string
  'Included / United States': string
  'Price / United States': string
  'Compare At Price / United States': string
  'Included / International': string
  'Price / International': string
  'Compare At Price / International': string
  'Status': string
}

// Internal product interface matching our database
export interface ProductWithDetails {
  id: string
  name: string
  description?: string | null
  price: number
  compare_at_price?: number | null
  sku?: string | null
  inventory_quantity: number
  is_active: boolean
  is_featured: boolean
  weight?: number | null
  meta_title?: string | null
  meta_description?: string | null
  vendor?: {
    business_name?: string
    full_name?: string
  } | null
  category?: {
    name?: string
    slug?: string
  } | null
  product_images?: {
    image_url: string
    alt_text?: string | null
    position: number
  }[]
  product_variants?: {
    name: string
    value: string
    price_adjustment: number
    sku_suffix?: string | null
    inventory_quantity: number
  }[]
}

export class ShopifyExporter {
  private supabase = createClientSupabase()

  /**
   * Fetch all products with complete details for export
   */
  async fetchProductsForExport(): Promise<ProductWithDetails[]> {
    try {
      console.log('Fetching products for Shopify export...')

      // First fetch all products
      const { data: products, error: productsError } = await this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        throw new Error(`Failed to fetch products: ${productsError.message}`)
      }

      if (!products || products.length === 0) {
        console.log('No products found for export')
        return []
      }

      console.log(`Found ${products.length} products`)

      // Fetch vendors separately
      const vendorIds = [...new Set(products.map(p => p.vendor_id).filter(Boolean))]
      let vendors: any[] = []
      if (vendorIds.length > 0) {
        const { data: vendorData, error: vendorError } = await this.supabase
          .from('vendors')
          .select('id, business_name, full_name')
          .in('id', vendorIds)
        
        if (!vendorError && vendorData) {
          vendors = vendorData
        }
      }

      // Fetch categories separately  
      const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))]
      let categories: any[] = []
      if (categoryIds.length > 0) {
        const { data: categoryData, error: categoryError } = await this.supabase
          .from('categories')
          .select('id, name, slug')
          .in('id', categoryIds)
        
        if (!categoryError && categoryData) {
          categories = categoryData
        }
      }

      console.log(`Found ${vendors.length} vendors and ${categories.length} categories`)

      // Fetch product images with better error handling
      const productIds = products.map(p => p.id)
      let productImages: any[] = []
      
      if (productIds.length > 0) {
        const { data: images, error: imagesError } = await this.supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds)
          .order('position', { ascending: true })

        if (!imagesError && images) {
          productImages = images
        }
      }

      // Fetch product variants
      let productVariants: any[] = []
      
      if (productIds.length > 0) {
        try {
          const { data: variants, error: variantsError } = await this.supabase
            .from('product_variants')
            .select('*')
            .in('product_id', productIds)

          if (!variantsError && variants) {
            productVariants = variants
          }
        } catch (error) {
          console.log('Product variants table may not exist yet')
        }
      }

      // Now combine all the data
      const enrichedProducts: ProductWithDetails[] = products.map(product => {
        // Find vendor for this product
        const vendor = vendors.find(v => v.id === product.vendor_id)
        
        // Find category for this product
        const category = categories.find(c => c.id === product.category_id)
        
        // Find images for this product
        const images = productImages.filter(img => img.product_id === product.id)
        
        // Find variants for this product
        const variants = productVariants.filter(v => v.product_id === product.id)

        console.log(`Processing product: ${product.name}, Category: ${category?.name || 'None'}, Images: ${images.length}, Inventory: ${product.inventory_quantity}, Price: ${product.price}`)

        return {
          ...product,
          vendor: vendor ? {
            business_name: vendor.business_name,
            full_name: vendor.full_name
          } : null,
          category: category ? {
            name: category.name,
            slug: category.slug
          } : null,
          product_images: images.map(img => ({
            image_url: img.image_url,
            alt_text: img.alt_text,
            position: img.position
          })),
          product_variants: variants.map(variant => ({
            name: variant.name,
            value: variant.value,
            price_adjustment: variant.price_adjustment || 0,
            sku_suffix: variant.sku_suffix,
            inventory_quantity: variant.inventory_quantity || 0
          }))
        }
      })

      console.log(`Successfully enriched ${enrichedProducts.length} products with all related data`)
      return enrichedProducts

    } catch (error) {
      console.error('Error in fetchProductsForExport:', error)
      throw error
    }
  }

  /**
   * Convert internal product to Shopify CSV format
   */
  convertToShopifyFormat(products: ProductWithDetails[]): ShopifyProduct[] {
    const shopifyProducts: ShopifyProduct[] = []

    products.forEach(product => {
      // Defensive programming: ensure required fields have valid values
      const productName = product.name || 'Untitled Product'
      const productPrice = Number(product.price) || 0
      const productWeight = Number(product.weight) || 0
      const inventoryQty = Number(product.inventory_quantity) || 0
      const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null
      const isActive = Boolean(product.is_active)
      
      const handle = this.createHandle(productName)
      const vendor = product.vendor?.business_name || product.vendor?.full_name || 'Unknown Vendor'
      const category = product.category?.name || 'Uncategorized'
      const mainImage = product.product_images?.[0] || null
      
      console.log(`Processing product: ${productName}, Category: ${category}, Images: ${product.product_images?.length || 0}, Inventory: ${inventoryQty}, Price: ${productPrice}`)
      
      // Base product (main variant) - Official Shopify Template Format
      const baseProduct: ShopifyProduct = {
        'Handle': handle,
        'Title': productName,
        'Body (HTML)': this.formatDescription(product.description),
        'Vendor': vendor,
        'Product Category': category,
        'Type': category,
        'Tags': this.generateTags(product),
        'Published': isActive ? 'TRUE' : 'FALSE',
        'Option1 Name': '',
        'Option1 Value': '',
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': product.sku || '',
        'Variant Grams': this.convertToGrams(productWeight),
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Qty': inventoryQty.toString(),
        'Variant Inventory Policy': 'deny',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': productPrice.toFixed(2),
        'Variant Compare At Price': compareAtPrice ? compareAtPrice.toFixed(2) : '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',
        'Image Src': mainImage?.image_url && mainImage.image_url.trim() !== '' ? mainImage.image_url : '',
        'Image Position': mainImage?.image_url && mainImage.image_url.trim() !== '' ? '1' : '',
        'Image Alt Text': mainImage?.image_url && mainImage.image_url.trim() !== '' ? (mainImage?.alt_text || productName) : '',
        'Gift Card': 'FALSE',
        'SEO Title': product.meta_title || productName,
        'SEO Description': product.meta_description || this.createMetaDescription(product.description),
        'Google Shopping / Google Product Category': category,
        'Google Shopping / Gender': 'unisex',
        'Google Shopping / Age Group': 'adult',
        'Google Shopping / MPN': product.sku || '',
        'Google Shopping / Condition': 'new',
        'Google Shopping / Custom Product': 'TRUE',
        'Variant Image': '',  // Variant images handled separately
        'Variant Weight Unit': 'g',
        'Variant Tax Code': '',
        'Cost per item': '',
        'Included / United States': 'TRUE',
        'Price / United States': '',
        'Compare At Price / United States': '',
        'Included / International': 'TRUE',
        'Price / International': '',
        'Compare At Price / International': '',
        'Status': isActive ? 'active' : 'draft'
      }

      shopifyProducts.push(baseProduct)

      // Add additional images as separate rows (only images after the first one)
      if (product.product_images && product.product_images.length > 1) {
        product.product_images.slice(1).forEach((image, index) => {
          // Only create image row if the image URL is valid and not empty
          if (image?.image_url && image.image_url.trim() !== '') {
            const imageRow: ShopifyProduct = { ...this.createEmptyRow() }
            imageRow['Handle'] = handle
            imageRow['Image Src'] = image.image_url
            imageRow['Image Position'] = (index + 2).toString() // Start from 2 since main image is 1
            imageRow['Image Alt Text'] = image.alt_text || productName
            shopifyProducts.push(imageRow)
          }
        })
      }

      // Add product variants as separate rows
      if (product.product_variants && product.product_variants.length > 0) {
        product.product_variants.forEach(variant => {
          const variantRow: ShopifyProduct = { ...this.createEmptyRow() }
          variantRow['Handle'] = handle
          variantRow['Option1 Name'] = variant.name || 'Option'
          variantRow['Option1 Value'] = variant.value || 'Default'
          variantRow['Variant SKU'] = product.sku ? `${product.sku}-${variant.sku_suffix || variant.value}` : ''
          variantRow['Variant Inventory Qty'] = Number(variant.inventory_quantity || 0).toString()
          variantRow['Variant Price'] = (productPrice + Number(variant.price_adjustment || 0)).toFixed(2)
          
          console.log(`Adding variant: ${variant.name}=${variant.value}, Inventory: ${variant.inventory_quantity}, Price: ${variantRow['Variant Price']}`)
          shopifyProducts.push(variantRow)
        })
      }
    })

    return shopifyProducts
  }

  /**
   * Generate CSV content from Shopify products
   */
  generateCSV(shopifyProducts: ShopifyProduct[]): string {
    if (shopifyProducts.length === 0) {
      throw new Error('No products to export')
    }

    const headers = Object.keys(shopifyProducts[0])
    const csvRows = [headers.join(',')]

    shopifyProducts.forEach(product => {
      const row = headers.map(header => {
        let value = product[header as keyof ShopifyProduct] || ''
        
        // Special handling for image fields - if Image Src is empty, clear all image fields
        if ((header === 'Image Position' || header === 'Image Alt Text') && (!product['Image Src'] || product['Image Src'].trim() === '')) {
          value = ''
        }
        
        // Escape commas and quotes in CSV
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  /**
   * Full export process
   */
  async exportToShopifyCSV(): Promise<string> {
    try {
      console.log('Starting Shopify export process...')
      
      const products = await this.fetchProductsForExport()
      console.log(`Converting ${products.length} products to Shopify format...`)
      
      const shopifyProducts = this.convertToShopifyFormat(products)
      console.log(`Generated ${shopifyProducts.length} Shopify CSV rows...`)
      
      const csvContent = this.generateCSV(shopifyProducts)
      console.log('CSV export completed successfully')
      
      return csvContent
    } catch (error) {
      console.error('Error during Shopify export:', error)
      throw error
    }
  }

  // Helper methods
  private createHandle(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  private formatDescription(description?: string | null): string {
    if (!description) return ''
    // Convert newlines to HTML breaks for Shopify
    return description.replace(/\n/g, '<br>')
  }

  private generateTags(product: ProductWithDetails): string {
    const tags = []
    
    if (product.vendor?.business_name) {
      tags.push(product.vendor.business_name)
    }
    
    if (product.category?.name) {
      tags.push(product.category.name)
    }
    
    if (product.is_featured) {
      tags.push('Featured')
    }
    
    if (product.price === 0) {
      tags.push('Free')
    }
    
    return tags.join(', ')
  }

  private convertToGrams(weight?: number | null): string {
    if (!weight) return '0'
    // Assume weight is in kg, convert to grams
    return Math.round(weight * 1000).toString()
  }

  private createMetaDescription(description?: string | null): string {
    if (!description) return ''
    // Create a clean meta description (max 160 chars)
    const clean = description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    return clean.length > 160 ? clean.substring(0, 157) + '...' : clean
  }

  private createEmptyRow(): ShopifyProduct {
    return {
      'Handle': '',
      'Title': '',
      'Body (HTML)': '',
      'Vendor': '',
      'Product Category': '',
      'Type': '',
      'Tags': '',
      'Published': '',
      'Option1 Name': '',
      'Option1 Value': '',
      'Option2 Name': '',
      'Option2 Value': '',
      'Option3 Name': '',
      'Option3 Value': '',
      'Variant SKU': '',
      'Variant Grams': '',
      'Variant Inventory Tracker': '',
      'Variant Inventory Qty': '',
      'Variant Inventory Policy': '',
      'Variant Fulfillment Service': '',
      'Variant Price': '',
      'Variant Compare At Price': '',
      'Variant Requires Shipping': '',
      'Variant Taxable': '',
      'Variant Barcode': '',
      'Image Src': '',
      'Image Position': '',
      'Image Alt Text': '',
      'Gift Card': '',
      'SEO Title': '',
      'SEO Description': '',
      'Google Shopping / Google Product Category': '',
      'Google Shopping / Gender': '',
      'Google Shopping / Age Group': '',
      'Google Shopping / MPN': '',
      'Google Shopping / Condition': '',
      'Google Shopping / Custom Product': '',
      'Variant Image': '',
      'Variant Weight Unit': '',
      'Variant Tax Code': '',
      'Cost per item': '',
      'Included / United States': '',
      'Price / United States': '',
      'Compare At Price / United States': '',
      'Included / International': '',
      'Price / International': '',
      'Compare At Price / International': '',
      'Status': ''
    }
  }
}

// Export functions for use in components
export async function exportProductsToShopify(): Promise<string> {
  const exporter = new ShopifyExporter()
  return await exporter.exportToShopifyCSV()
}

export function downloadCSV(csvContent: string, filename: string = 'shopify-products-export.csv') {
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

// Product Categories Configuration
// Based on Shopify collections structure

export interface ProductCategory {
  value: string
  label: string
  emoji: string
  description?: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    value: 'accessories',
    label: 'Accessories',
    emoji: '💍',
    description: 'Jewelry, bags, belts, watches, and other accessories'
  },
  {
    value: 'hoodies-sweatshirts',
    label: 'Hoodies & Sweatshirts',
    emoji: '🎽',
    description: 'Hoodies, sweatshirts, and warm wear'
  },
  {
    value: 'pants-bottoms',
    label: 'Pants & Bottoms',
    emoji: '👖',
    description: 'Jeans, trousers, shorts, and other bottoms'
  },
  {
    value: 't-shirts-tops',
    label: 'T-Shirts & Tops',
    emoji: '👕',
    description: 'T-shirts, shirts, blouses, and casual tops'
  },
  {
    value: 'football-jerseys',
    label: 'Football Jerseys',
    emoji: '⚽',
    description: 'Football jerseys, sports team apparel'
  },
  {
    value: 'sneakers-shoes',
    label: 'Sneakers & Shoes',
    emoji: '👟',
    description: 'Athletic shoes, sneakers, and casual footwear'
  },
  {
    value: 'shoes-sneakers',
    label: 'Shoes & Sneakers',
    emoji: '👞',
    description: 'Formal shoes, dress shoes, and premium footwear'
  }
]

// Legacy categories for backward compatibility
export const LEGACY_CATEGORIES: ProductCategory[] = [
  {
    value: 'electronics',
    label: 'Electronics',
    emoji: '📱',
    description: 'Electronic devices and gadgets'
  },
  {
    value: 'clothing',
    label: 'Clothing',
    emoji: '👕',
    description: 'General clothing items'
  },
  {
    value: 'food',
    label: 'Food & Beverages',
    emoji: '🍽️',
    description: 'Food items and beverages'
  },
  {
    value: 'home',
    label: 'Home & Garden',
    emoji: '🏠',
    description: 'Home decor and garden items'
  },
  {
    value: 'beauty',
    label: 'Beauty & Personal Care',
    emoji: '💄',
    description: 'Beauty products and personal care items'
  },
  {
    value: 'sports',
    label: 'Sports & Outdoors',
    emoji: '⚽',
    description: 'Sports equipment and outdoor gear'
  },
  {
    value: 'books',
    label: 'Books & Media',
    emoji: '📚',
    description: 'Books, magazines, and media'
  },
  {
    value: 'toys',
    label: 'Toys & Games',
    emoji: '🧸',
    description: 'Toys and gaming items'
  }
]

// Combined categories for display (Shopify categories first, then legacy)
export const ALL_CATEGORIES: ProductCategory[] = [
  ...PRODUCT_CATEGORIES,
  ...LEGACY_CATEGORIES
]

// Helper function to get category by value
export function getCategoryByValue(value: string): ProductCategory | undefined {
  return ALL_CATEGORIES.find(cat => cat.value === value)
}

// Helper function to get category label with emoji
export function getCategoryDisplay(value: string): string {
  const category = getCategoryByValue(value)
  return category ? `${category.emoji} ${category.label}` : value
}

// Helper function for form validation
export function isValidCategory(value: string): boolean {
  return ALL_CATEGORIES.some(cat => cat.value === value)
}

// Helper function to create a new category
export function createNewCategory(label: string, emoji: string = '📦'): ProductCategory {
  const value = label.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim()
  
  return {
    value,
    label: label.trim(),
    emoji: emoji.trim() || '📦',
    description: `Custom category: ${label}`
  }
}

// Helper function to validate new category input
export function validateNewCategory(label: string): { isValid: boolean; error?: string } {
  if (!label.trim()) {
    return { isValid: false, error: 'Category name is required' }
  }
  
  if (label.trim().length < 2) {
    return { isValid: false, error: 'Category name must be at least 2 characters' }
  }
  
  if (label.trim().length > 50) {
    return { isValid: false, error: 'Category name must be less than 50 characters' }
  }
  
  const value = label.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim()
  
  // Check if category already exists
  if (isValidCategory(value)) {
    return { isValid: false, error: 'This category already exists' }
  }
  
  return { isValid: true }
}

// Export default as main categories (Shopify-based)
export default PRODUCT_CATEGORIES

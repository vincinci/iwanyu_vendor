'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase-client'
import { ALL_CATEGORIES } from '@/lib/categories'
import { 
  BarChart3, 
  Package, 
  TrendingUp, 
  Tag,
  ShoppingBag,
  Users
} from 'lucide-react'

interface CategoryStats {
  category: string
  categoryLabel: string
  categoryEmoji: string
  productCount: number
  vendorCount: number
  averagePrice: number
  totalStock: number
}

export default function AdminCategoriesPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)

  useEffect(() => {
    fetchCategoryStats()
  }, [])

  const fetchCategoryStats = async () => {
    setLoading(true)
    const supabase = createClient()
    
    try {
      // Get all products with vendor information
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          category,
          price,
          stock_quantity,
          vendor_id,
          vendors!inner(id, business_name)
        `)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      // Group products by category and calculate stats
      const categoryMap = new Map<string, {
        products: any[],
        vendors: Set<string>
      }>()

      products?.forEach(product => {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, {
            products: [],
            vendors: new Set()
          })
        }
        const categoryData = categoryMap.get(product.category)!
        categoryData.products.push(product)
        categoryData.vendors.add(product.vendor_id)
      })

      // Calculate stats for each category
      const stats: CategoryStats[] = []
      
      // Include all categories from our configuration, even if they have 0 products
      ALL_CATEGORIES.forEach(category => {
        const categoryData = categoryMap.get(category.value)
        const products = categoryData?.products || []
        const vendors = categoryData?.vendors || new Set()
        
        const productCount = products.length
        const vendorCount = vendors.size
        const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)
        const averagePrice = productCount > 0 
          ? products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / productCount 
          : 0

        stats.push({
          category: category.value,
          categoryLabel: category.label,
          categoryEmoji: category.emoji,
          productCount,
          vendorCount,
          averagePrice,
          totalStock
        })
      })

      // Check for products in categories not in our configuration
      categoryMap.forEach((data, categoryValue) => {
        const existsInConfig = ALL_CATEGORIES.some(cat => cat.value === categoryValue)
        if (!existsInConfig) {
          const products = data.products
          const vendors = data.vendors
          
          stats.push({
            category: categoryValue,
            categoryLabel: categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1),
            categoryEmoji: '📦', // Default emoji for unknown categories
            productCount: products.length,
            vendorCount: vendors.size,
            averagePrice: products.length > 0 
              ? products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / products.length 
              : 0,
            totalStock: products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)
          })
        }
      })

      // Sort by product count (descending)
      stats.sort((a, b) => b.productCount - a.productCount)

      setCategoryStats(stats)
      setTotalProducts(products?.length || 0)
      setTotalCategories(stats.filter(s => s.productCount > 0).length)
      
    } catch (error) {
      console.error('Error fetching category stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Analytics</h1>
          <p className="text-gray-600 mt-2">
            View product distribution and vendor participation across all categories
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-gray-600">Active categories with products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-gray-600">Across all categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categoryStats[0]?.categoryEmoji} {categoryStats[0]?.categoryLabel || 'None'}
              </div>
              <p className="text-xs text-gray-600">
                {categoryStats[0]?.productCount || 0} products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryStats.map((category) => (
            <Card key={category.category} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.categoryEmoji}</span>
                    <div>
                      <CardTitle className="text-lg">{category.categoryLabel}</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {category.category}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={category.productCount > 0 ? "default" : "secondary"}>
                    {category.productCount > 0 ? "Active" : "Empty"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Products</span>
                  </div>
                  <span className="font-semibold">{category.productCount}</span>
                </div>

                {/* Vendor Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Vendors</span>
                  </div>
                  <span className="font-semibold">{category.vendorCount}</span>
                </div>

                {/* Average Price */}
                {category.productCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Avg Price</span>
                    </div>
                    <span className="font-semibold">{formatPrice(category.averagePrice)}</span>
                  </div>
                )}

                {/* Total Stock */}
                {category.productCount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Total Stock</span>
                    </div>
                    <span className="font-semibold">{category.totalStock}</span>
                  </div>
                )}

                {/* Progress Bar */}
                {totalProducts > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Market Share</span>
                      <span>{((category.productCount / totalProducts) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(category.productCount / totalProducts) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {categoryStats.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600">
                Start by having vendors create products with categories
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

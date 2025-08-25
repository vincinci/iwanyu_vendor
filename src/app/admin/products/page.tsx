'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Package,
  Banknote,
  Eye,
  Edit,
  Activity,
  User,
  Check,
  X,
  Archive,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Star,
  ShoppingCart,
  Download,
  FileText
} from 'lucide-react'
import { exportProductsToShopify, downloadCSV } from '@/lib/shopify-export'

interface AdminProduct {
  id: string
  name: string
  description: string | null
  price: number
  vendor_id: string
  category_id: string | null
  vendor?: {
    full_name: string
    business_name: string
  }
  category?: {
    name: string
    slug: string
  }
  sku?: string | null
  barcode?: string | null
  weight?: number | null
  is_active: boolean
  is_featured: boolean
  inventory_quantity: number
  low_stock_threshold: number
  compare_at_price?: number | null
  requires_shipping: boolean
  inventory_tracking: boolean
  meta_title?: string | null
  meta_description?: string | null
  created_at: string
  updated_at: string
  product_images?: {
    id: string
    image_url: string
    alt_text?: string | null
    position: number
  }[]
  order_items?: {
    quantity: number
    price: number
  }[]
}

interface ProductStats {
  total: number
  active: number
  inactive: number
  total_value: number
  out_of_stock: number
  low_stock: number
  featured: number
  new_today: number
  categories: number
  avg_price: number
  total_sales: number
  top_selling: number
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active') // Default to show active products
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    inactive: 0,
    total_value: 0,
    out_of_stock: 0,
    low_stock: 0,
    featured: 0,
    new_today: 0,
    categories: 0,
    avg_price: 0,
    total_sales: 0,
    top_selling: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
    
    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchProducts()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching products with comprehensive data...')
      
      // Test database connection first
      const { data: connectionTest, error: connectionError } = await supabase
        .from('products')
        .select('count')
        .limit(1)
      
      console.log('Database connection test:', { connectionTest, connectionError })
      
      // Use simple query without complex joins to avoid 400 errors
      let { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Products query result:', { productsData, productsError, count: productsData?.length })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        setProducts([])
        return
      }

      const products = productsData || []
      
      // Fetch product images separately to avoid join issues (optional - graceful fallback if table doesn't exist)
      let productImages: any[] = []
      if (products.length > 0) {
        try {
          const productIds = products.map(p => p.id)
          const { data: imagesData, error: imagesError } = await supabase
            .from('product_images')
            .select('*')
            .in('product_id', productIds)
            .order('position', { ascending: true })
          
          if (!imagesError && imagesData) {
            productImages = imagesData
            console.log('Product images fetched:', productImages.length)
          } else if (imagesError) {
            // If product_images table doesn't exist, that's ok - we'll show placeholders
            console.log('Product images table not available (this is optional):', imagesError.message)
            productImages = []
          }
        } catch (imageError) {
          console.log('Product images feature not available (optional):', imageError)
          productImages = []
        }
      }
      
      // Group images by product_id
      const imagesByProductId = productImages.reduce((acc: any, image: any) => {
        if (!acc[image.product_id]) {
          acc[image.product_id] = []
        }
        acc[image.product_id].push(image)
        return acc
      }, {})
      
      // Add related data with actual product images
      const productsWithDefaults = products.map((product: any) => ({
        ...product,
        vendor: null,
        category: null,
        product_images: imagesByProductId[product.id] || [],
        order_items: []
      }))
      
      setProducts(productsWithDefaults)
      console.log('Final products set:', productsWithDefaults.length)
      
      // Calculate simplified stats
      const today = new Date().toISOString().split('T')[0]
      const uniqueCategories = new Set(productsWithDefaults.map(p => p.category_id).filter(Boolean))
      const totalSales = 0 // Will be calculated separately if needed
      
      const productStats = {
        total: productsWithDefaults.length,
        active: productsWithDefaults.filter(p => p.is_active).length,
        inactive: productsWithDefaults.filter(p => !p.is_active).length,
        total_value: productsWithDefaults.reduce((sum, p) => sum + (p.price * p.inventory_quantity), 0),
        out_of_stock: productsWithDefaults.filter(p => p.inventory_quantity === 0).length,
        low_stock: productsWithDefaults.filter(p => p.inventory_quantity > 0 && p.inventory_quantity <= (p.low_stock_threshold || 10)).length,
        featured: productsWithDefaults.filter(p => p.is_featured).length,
        new_today: productsWithDefaults.filter(p => p.created_at?.startsWith(today)).length,
        categories: uniqueCategories.size,
        avg_price: productsWithDefaults.length > 0 ? productsWithDefaults.reduce((sum, p) => sum + p.price, 0) / productsWithDefaults.length : 0,
        total_sales: totalSales,
        top_selling: 0 // Will be calculated separately if needed
      }
      
      setStats(productStats)
      console.log('Products loaded:', { count: productsWithDefaults.length, stats: productStats })
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId)

      if (error) throw error

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, is_active: isActive } : product
      ))
      
      // Refresh stats
      fetchProducts()
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  const handleFeatureToggle = async (productId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured })
        .eq('id', productId)

      if (error) throw error

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, is_featured: isFeatured } : product
      ))
      
      fetchProducts()
    } catch (error) {
      console.error('Error updating product feature status:', error)
    }
  }

  const handleProductShutdown = async (productId: string, reason: string) => {
    try {
      console.log(`Shutting down product ${productId} for reason: ${reason}`)
      
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: false,
          admin_notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) throw error

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, is_active: false } : product
      ))
      
      fetchProducts()
      console.log(`Product ${productId} shut down successfully`)
    } catch (error) {
      console.error('Error shutting down product:', error)
    }
  }

  const handlePolicyViolation = async (productId: string, violationType: 'copyright' | 'inappropriate' | 'fake' | 'other') => {
    const reasons = {
      copyright: 'Copyright violation - Product removed for intellectual property infringement',
      inappropriate: 'Inappropriate content - Product violates platform community guidelines', 
      fake: 'Counterfeit product - Product identified as fake or unauthorized replica',
      other: 'Policy violation - Product violates platform terms and conditions'
    }
    
    await handleProductShutdown(productId, reasons[violationType])
  }

  const handleExportToShopify = async () => {
    try {
      setExporting(true)
      console.log('Starting Shopify export...')
      
      const csvContent = await exportProductsToShopify()
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `shopify-products-export-${timestamp}.csv`
      
      downloadCSV(csvContent, filename)
      
      console.log('Export completed successfully')
      
      // Show success message (you can add a toast notification here)
      alert(`Successfully exported ${products.length} products to Shopify CSV format!`)
      
    } catch (error) {
      console.error('Error during export:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    }
  }

  const getStockBadge = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (quantity <= threshold) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
    }
  }

  const getSalesPerformance = (product: AdminProduct) => {
    const totalSold = product.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const revenue = product.order_items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0
    
    return { totalSold, revenue }
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active) ||
      (statusFilter === 'featured' && product.is_featured)
    
    const matchesCategory = !categoryFilter || product.category?.slug === categoryFilter
    
    const matchesStock = !stockFilter ||
      (stockFilter === 'in_stock' && product.inventory_quantity > product.low_stock_threshold) ||
      (stockFilter === 'low_stock' && product.inventory_quantity > 0 && product.inventory_quantity <= product.low_stock_threshold) ||
      (stockFilter === 'out_of_stock' && product.inventory_quantity === 0)
    
    return matchesSearch && matchesStatus && matchesCategory && matchesStock
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Comprehensive product oversight and control</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
            <Button onClick={fetchProducts} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              {stats.new_today > 0 && (
                <p className="text-xs text-green-600">+{stats.new_today} today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active/Inactive</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-red-600">{stats.inactive} inactive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <Banknote className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.total_value.toLocaleString()}</div>
              <p className="text-xs text-gray-500">RWF</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-600">{stats.out_of_stock}</div>
              <p className="text-xs text-yellow-600">{stats.low_stock} low stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-yellow-600">{stats.featured}</div>
              <p className="text-xs text-gray-500">{stats.categories} categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">{stats.total_sales}</div>
              <p className="text-xs text-gray-500">Total units sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products, vendors, categories, or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive</option>
                    <option value="featured">Featured</option>
                  </select>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Stock</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category?.slug} value={category?.slug}>
                        {category?.name}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Results ({filteredProducts.length})
                  </Button>
                  <Button 
                    onClick={handleExportToShopify}
                    disabled={exporting || products.length === 0}
                    variant="outline" 
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    {exporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export to Shopify CSV
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Display */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Comprehensive product management with real-time data ({filteredProducts.length} products found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Activity className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading products...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {products.length === 0 
                    ? 'Products from vendors will appear here when they add them to their stores'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {filteredProducts.map((product) => {
                  const { totalSold, revenue } = getSalesPerformance(product)
                  
                  if (viewMode === 'table') {
                    return (
                      <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              {product.product_images && product.product_images.length > 0 ? (
                                <img
                                  src={product.product_images[0].image_url}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    console.log('Image failed to load:', product.product_images?.[0]?.image_url);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="h-8 w-8 text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16h6v6"/><path d="M21 16v-3.293a1 1 0 0 0-.293-.707L12 3.293A1 1 0 0 0 11 3H2v6"/><path d="M8 21h8v-6"/></svg></div>';
                                    }
                                  }}
                                />
                              ) : (
                                <Package className="h-8 w-8 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <p className="text-gray-600 text-sm">
                                {product.vendor?.business_name || product.vendor?.full_name || 'Unknown Vendor'}
                              </p>
                              <div className="flex gap-2 mt-1">
                                {getStatusBadge(product.is_active)}
                                {getStockBadge(product.inventory_quantity, product.low_stock_threshold)}
                                {product.is_featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {product.price.toLocaleString()} RWF
                            </div>
                            <div className="text-sm text-gray-500">
                              Stock: {product.inventory_quantity}
                            </div>
                            {totalSold > 0 && (
                              <div className="text-sm text-blue-600">
                                {totalSold} sold • {revenue.toLocaleString()} RWF
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Grid view (existing card layout)
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-100 relative">
                          {product.product_images && product.product_images.length > 0 ? (
                            <img
                              src={product.product_images[0].image_url}
                              alt={product.product_images[0].alt_text || product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Grid image failed to load:', product.product_images?.[0]?.image_url);
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><div class="h-16 w-16 text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16h6v6"/><path d="M21 16v-3.293a1 1 0 0 0-.293-.707L12 3.293A1 1 0 0 0 11 3H2v6"/><path d="M8 21h8v-6"/></svg></div></div>';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-16 w-16 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {getStatusBadge(product.is_active)}
                            {getStockBadge(product.inventory_quantity, product.low_stock_threshold)}
                            {product.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description || 'No description available'}
                          </p>
                          
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <span className="text-2xl font-bold text-green-600">
                                {product.price.toLocaleString()} RWF
                              </span>
                              {product.compare_at_price && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  {product.compare_at_price.toLocaleString()} RWF
                                </span>
                              )}
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <div>Stock: {product.inventory_quantity}</div>
                              {product.sku && <div>SKU: {product.sku}</div>}
                            </div>
                          </div>

                          {/* Sales Performance */}
                          {totalSold > 0 && (
                            <div className="bg-blue-50 p-2 rounded-lg mb-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-600 font-medium">Sales Performance</span>
                                <ShoppingCart className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="text-xs text-blue-800 mt-1">
                                {totalSold} units sold • {revenue.toLocaleString()} RWF revenue
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span className="truncate">
                                {product.vendor?.business_name || product.vendor?.full_name || 'Unknown Vendor'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              <span>{product.category?.name || 'No Category'}</span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-400 mb-3">
                            Created: {new Date(product.created_at).toLocaleDateString()}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4 flex-wrap">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            
                            {!product.is_featured && product.is_active && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleFeatureToggle(product.id, true)}
                                className="text-yellow-600 hover:text-yellow-700 border-yellow-300"
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Feature
                              </Button>
                            )}
                            
                            {product.is_active ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(product.id, false)}
                                  className="text-red-600 hover:text-red-700 border-red-300"
                                >
                                  <Archive className="h-4 w-4 mr-1" />
                                  Deactivate
                                </Button>
                                
                                {/* Policy Violation Buttons */}
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handlePolicyViolation(product.id, 'copyright')}
                                    className="text-red-600 hover:text-red-700 border-red-300"
                                    title="Copyright Violation"
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handlePolicyViolation(product.id, 'fake')}
                                    className="text-orange-600 hover:text-orange-700 border-orange-300"
                                    title="Counterfeit Product"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(product.id, true)}
                                className="text-green-600 hover:text-green-700 border-green-300"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
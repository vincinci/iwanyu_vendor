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
  RefreshCw
} from 'lucide-react'

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
    sort_order: number
  }[]
}

interface ProductStats {
  total: number
  active: number
  inactive: number
  total_value: number
  out_of_stock: number
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    inactive: 0,
    total_value: 0,
    out_of_stock: 0
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
      console.log('Fetching products with vendor and category information...')
      
      // Fetch products with vendor and category information
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendors (
            full_name,
            business_name
          ),
          category:categories (
            name,
            slug
          ),
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          )
        `)
        .order('created_at', { ascending: false })

      console.log('Products query result:', { productsData, productsError })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        setProducts([])
        return
      }

      const products = productsData || []
      setProducts(products)
      
      // Calculate stats
      const stats = {
        total: products.length,
        active: products.filter(p => p.is_active).length,
        inactive: products.filter(p => !p.is_active).length,
        total_value: products.reduce((sum, p) => sum + (p.price * p.inventory_quantity), 0),
        out_of_stock: products.filter(p => p.inventory_quantity === 0).length
      }
      
      setStats(stats)
      console.log('Products loaded:', { count: products.length, stats })
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

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    }
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (quantity <= 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
    }
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
      (statusFilter === 'inactive' && !product.is_active)
    
    const matchesCategory = !categoryFilter || product.category?.slug === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
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
            <p className="text-gray-600">Monitor and manage all products in the marketplace</p>
          </div>
          <Button onClick={fetchProducts} disabled={loading}>
            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <Archive className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Banknote className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_value.toLocaleString()} RWF</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.out_of_stock}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products, vendors, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  Filter ({filteredProducts.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage products and their information ({filteredProducts.length} products found)
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 relative">
                        {product.product_images && product.product_images.length > 0 ? (
                          <img
                            src={product.product_images[0].image_url}
                            alt={product.product_images[0].alt_text || product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {getStatusBadge(product.is_active)}
                          {getStockBadge(product.inventory_quantity)}
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
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {product.is_active ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(product.id, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(product.id, true)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
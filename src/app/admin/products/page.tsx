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
  Trash2,
  Activity,
  ShoppingCart,
  Star,
  Calendar,
  User,
  Check,
  X,
  Archive,
  RefreshCw
} from 'lucide-react'

interface AdminProduct {
  id: string
  name: string
  description: string
  price: number
  vendor_id: string
  vendor?: {
    full_name: string
    business_name: string
    email: string
  }
  category: string
  status: 'active' | 'inactive' | 'pending_review' | 'rejected'
  stock_quantity: number
  images: string[]
  created_at: string
  updated_at: string
  tags: string[]
  sku?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

interface ProductStats {
  total: number
  active: number
  pending: number
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
    pending: 0,
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
      
      // Fetch products with vendor information
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          vendor:profiles!vendor_id (
            full_name,
            business_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      const products = productsData || []
      setProducts(products)
      
      // Calculate stats
      const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        pending: products.filter(p => p.status === 'pending_review').length,
        inactive: products.filter(p => p.status === 'inactive' || p.status === 'rejected').length,
        total_value: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0),
        out_of_stock: products.filter(p => p.stock_quantity === 0).length
      }
      
      setStats(stats)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (productId: string, newStatus: AdminProduct['status']) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId)

      if (error) throw error

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, status: newStatus } : product
      ))
      
      // Refresh stats
      fetchProducts()
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  const getStatusBadge = (status: AdminProduct['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (quantity < 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || product.status === statusFilter
    const matchesCategory = !categoryFilter || product.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Monitor and manage all products in the marketplace</p>
          </div>
          <Button onClick={fetchProducts} disabled={loading}>
            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Archive className="h-8 w-8 text-gray-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Banknote className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : `${stats.total_value.toLocaleString()} RWF`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.out_of_stock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search products, vendors, or SKU..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
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
              <div className="flex items-center justify-center py-12">
                <Activity className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-500">Loading products...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {products.length === 0 ? 'No products listed' : 'No products match your search'}
                </h3>
                <p className="text-gray-500">
                  {products.length === 0 
                    ? 'Products from vendors will appear here when they add them to their stores'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">
                              {product.name || 'Unnamed Product'}
                            </h3>
                            {getStatusBadge(product.status)}
                            {getStockBadge(product.stock_quantity)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{product.vendor?.business_name || product.vendor?.full_name || 'Unknown Vendor'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Banknote className="h-3 w-3" />
                              <span className="font-medium">{product.price?.toLocaleString()} RWF</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" />
                              <span>Stock: {product.stock_quantity}</span>
                            </div>
                            {product.category && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">Category:</span>
                                <span>{product.category}</span>
                              </div>
                            )}
                          </div>
                          
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Added {new Date(product.created_at).toLocaleDateString()}</span>
                            </div>
                            {product.sku && (
                              <div>
                                <span className="font-medium">SKU:</span> {product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        
                        {product.status === 'pending_review' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusUpdate(product.id, 'active')}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusUpdate(product.id, 'rejected')}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {product.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-orange-600 hover:text-orange-700"
                            onClick={() => handleStatusUpdate(product.id, 'inactive')}
                          >
                            <Archive className="mr-1 h-3 w-3" />
                            Deactivate
                          </Button>
                        )}
                        
                        {(product.status === 'inactive' || product.status === 'rejected') && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusUpdate(product.id, 'active')}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Activate
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>Products awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Activity className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Products to review</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Review Products
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Products running low on stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <X className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.out_of_stock}</p>
                <p className="text-sm text-gray-600">Out of stock</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Manage Stock
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
              <CardDescription>Total value of all products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Banknote className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_value.toLocaleString()} RWF
                </p>
                <p className="text-sm text-gray-600">Total inventory value</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

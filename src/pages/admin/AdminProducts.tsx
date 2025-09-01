import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  BarChart3
} from 'lucide-react'
import { formatDate, formatCurrency, truncateText } from '@/lib/utils'

interface Product {
  id: string
  vendor_id: string
  name: string
  description: string
  price: number
  compare_price?: number
  cost: number
  sku: string
  category: string
  tags: string[]
  images: string[]
  is_active: boolean
  is_approved: boolean
  stock_quantity: number
  low_stock_threshold: number
  created_at: string
  updated_at: string
  vendor?: {
    full_name: string
    company_name?: string
  }
}

interface ProductStats {
  total: number
  approved: number
  pending: number
  active: number
  lowStock: number
}

export function AdminProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    approved: 0,
    pending: 0,
    active: 0,
    lowStock: 0
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'price' | 'stock'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, statusFilter, categoryFilter, stockFilter, sortBy, sortOrder])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:profiles(full_name, company_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProducts(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (productList: Product[]) => {
    const total = productList.length
    const approved = productList.filter(p => p.is_approved).length
    const pending = productList.filter(p => !p.is_approved).length
    const active = productList.filter(p => p.is_active && p.is_approved).length
    const lowStock = productList.filter(p => p.stock_quantity <= p.low_stock_threshold).length

    setStats({ total, approved, pending, active, lowStock })
  }

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.vendor?.full_name && product.vendor.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'approved' && product.is_approved) ||
        (statusFilter === 'pending' && !product.is_approved)

      const matchesCategory = 
        categoryFilter === 'all' || product.category === categoryFilter

      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && product.stock_quantity > product.low_stock_threshold) ||
        (stockFilter === 'lowStock' && product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0) ||
        (stockFilter === 'outOfStock' && product.stock_quantity === 0)

      return matchesSearch && matchesStatus && matchesCategory && matchesStock
    })

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'stock':
          aValue = a.stock_quantity
          bValue = b.stock_quantity
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }

  const handleApproveProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) throw error

      toast.success('Product approved successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error approving product:', error)
      toast.error('Failed to approve product')
    }
  }

  const handleRejectProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_approved: false,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) throw error

      toast.success('Product rejected successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error rejecting product:', error)
      toast.error('Failed to reject product')
    }
  }

  const exportShopifyCSV = () => {
    const csvContent = [
      ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position', 'Gift Card', 'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category', 'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN', 'Google Shopping / AdWords Grouping', 'Google Shopping / AdWords Labels', 'Google Shopping / Condition', 'Google Shopping / Custom Product', 'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1', 'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3', 'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit', 'Variant Tax Code', 'Cost per item', 'Price / International', 'Compare At Price / International', 'Price / EUR', 'Compare At Price / EUR', 'Price / GBP', 'Compare At Price / GBP', 'Status'],
      ...filteredProducts.map(product => [
        product.name.toLowerCase().replace(/\s+/g, '-'),
        product.name,
        product.description,
        product.vendor?.company_name || product.vendor?.full_name || 'Unknown',
        product.category,
        product.category,
        product.tags?.join(', ') || '',
        product.is_approved && product.is_active ? 'TRUE' : 'FALSE',
        'Title',
        product.name,
        '',
        '',
        '',
        '',
        product.sku,
        '0',
        'shopify',
        product.stock_quantity.toString(),
        'deny',
        'manual',
        product.price.toString(),
        product.compare_price?.toString() || '',
        'TRUE',
        'TRUE',
        product.images?.[0] || '',
        '1',
        'FALSE',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        product.is_approved && product.is_active ? 'active' : 'draft'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-shopify-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Products exported in Shopify format')
  }

  const getStatusBadge = (product: Product) => {
    if (!product.is_approved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Pending Approval
        </span>
      )
    }
    
    if (!product.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    )
  }

  const getStockBadge = (product: Product) => {
    if (product.stock_quantity === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      )
    }
    
    if (product.stock_quantity <= product.low_stock_threshold) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        In Stock
      </span>
    )
  }

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category))]
    return categories.sort()
  }

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">
                Review and manage all vendor products across the platform
              </p>
            </div>
            <button 
              onClick={exportShopifyCSV}
              className="iwanyu-button-secondary inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Shopify CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="iwanyu-card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="iwanyu-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="iwanyu-input pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="iwanyu-input"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="all">All Stock Levels</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="iwanyu-input"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="iwanyu-button-secondary"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="iwanyu-card overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  {getStatusBadge(product)}
                </div>

                {/* Stock Badge */}
                <div className="absolute top-2 right-2">
                  {getStockBadge(product)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 ml-2">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {truncateText(product.description, 80)}
                </p>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-2" />
                    {product.vendor?.company_name || product.vendor?.full_name}
                  </div>
                  
                  <div className="flex items-center">
                    <Tag className="w-3 h-3 mr-2" />
                    {product.category}
                  </div>
                  
                  <div className="flex items-center">
                    <Package className="w-3 h-3 mr-2" />
                    SKU: {product.sku}
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    {formatDate(product.created_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {!product.is_approved ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveProduct(product.id)}
                        className="flex-1 bg-green-600 text-white text-xs px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectProduct(product.id)}
                        className="flex-1 bg-red-600 text-white text-xs px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">
                        {product.is_active ? 'Product is live' : 'Product is inactive'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
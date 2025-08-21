'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { VendorLayout } from '@/components/layouts/vendor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmModal } from '@/components/modals/confirm-modal'
import { createClient } from '@/lib/supabase-client'
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Star,
  Banknote
} from 'lucide-react'

// Product interface
interface ProductVariant {
  id: number
  color?: string
  size?: string
  price: number
  stock: number
  option1?: string
  option2?: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  status: 'active' | 'draft'
  rating: number
  sales: number
  images: (string | File)[]
  hasVariants: boolean
  variants: ProductVariant[]
  option1Name?: string
  option2Name?: string
}

// Badge component inline since import is failing
const Badge = ({ children, className = "", variant = "default" }: { children: React.ReactNode, className?: string, variant?: string }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  const variantClasses = {
    default: "border-transparent bg-gray-900 text-white",
    secondary: "border-transparent bg-gray-100 text-gray-900",
    outline: "text-gray-900"
  }
  return (
    <div className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </div>
  )
}

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const supabase = createClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Load vendor data and products
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true)
        
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('No authenticated user')
          return
        }

        // Get vendor record
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (vendorError) {
          console.error('Error fetching vendor:', vendorError)
          return
        }

        if (!vendor) {
          console.error('No vendor record found')
          return
        }

        setVendorId(vendor.id)

        // Load products for this vendor
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', vendor.id)

        if (productsError) {
          console.error('Error fetching products:', productsError)
          return
        }

        // Transform database products to match our interface
        const transformedProducts: Product[] = (products || []).map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          stock: product.stock_quantity || 0,
          category: product.category || '',
          status: product.is_active ? 'active' : 'draft',
          rating: 0, // TODO: Calculate from reviews
          sales: 0, // TODO: Calculate from orders
          images: product.images ? (Array.isArray(product.images) ? product.images : []) : [],
          hasVariants: false, // TODO: Add variant support
          variants: []
        }))

        setProducts(transformedProducts)
      } catch (error) {
        console.error('Error loading vendor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [supabase])

  // Helper functions for variant products
  const getProductPrice = (product: Product) => {
    if (!product.hasVariants || !product.variants?.length) {
      return product.price
    }
    const prices = product.variants.map((v: ProductVariant) => v.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    return minPrice === maxPrice ? minPrice : { min: minPrice, max: maxPrice }
  }

  const getProductStock = (product: Product) => {
    if (!product.hasVariants || !product.variants?.length) {
      return product.stock
    }
    return product.variants.reduce((total: number, variant: ProductVariant) => total + variant.stock, 0)
  }

  const formatPrice = (price: number | { min: number; max: number }) => {
    if (typeof price === 'object' && 'min' in price) {
      return `${price.min.toFixed(0)} RWF - ${price.max.toFixed(0)} RWF`
    }
    return `${(price as number).toFixed(0)} RWF`
  }

  const getColorSwatch = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'red': '#ef4444',
      'pink': '#ec4899',
      'black': '#1f2937',
      'purple': '#8b5cf6',
      'beige': '#d2b48c',
      'white': '#ffffff',
      'blue': '#3b82f6',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'orange': '#f97316',
      'gray': '#6b7280',
      'brown': '#92400e'
    }
    
    const color = colorMap[colorName.toLowerCase()] || '#9ca3af'
    
    return (
      <div 
        className={`w-4 h-4 rounded-full border ${color === '#ffffff' ? 'border-gray-400' : 'border-gray-200'} inline-block`}
        style={{ backgroundColor: color }}
        title={colorName}
      />
    )
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    // Redirect to dedicated add product page for consistency
    window.location.href = '/vendor/products/new'
  }

  const handleEditProduct = (product: Product) => {
    // Navigate to edit page (we'll create this later if needed)
    window.location.href = `/vendor/products/${product.id}/edit`
  }

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productToDelete.id)

        if (error) {
          console.error('Error deleting product:', error)
          return
        }

        setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
        setProductToDelete(null)
        console.log('Product deleted successfully!')
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const toggleProductStatus = async (productId: number) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const newStatus = product.status === 'active' ? 'draft' : 'active'
      
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus === 'active' })
        .eq('id', productId)

      if (error) {
        console.error('Error updating product status:', error)
        return
      }

      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, status: newStatus }
          : p
      ))
      
      console.log(`Product status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <VendorLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Button 
            onClick={handleAddProduct}
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Banknote className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.reduce((sum, p) => sum + p.sales, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.reduce((sum, p) => sum + getProductStock(p), 0)}
                  </p>
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
                    placeholder="Search products..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home & Garden</option>
                <option value="books">Books</option>
              </select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={typeof product.images[0] === 'string' ? product.images[0] : URL.createObjectURL(product.images[0])}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Package className="absolute inset-0 m-auto h-12 w-12 text-gray-400" />
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">{formatPrice(getProductPrice(product))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-medium ${getProductStock(product) < 10 ? 'text-red-600' : ''}`}>
                      {getProductStock(product)} units
                    </span>
                  </div>
                  {product.hasVariants && product.variants?.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Variants:</span>
                      <span className="font-medium">{product.variants.length} options</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sales:</span>
                    <span className="font-medium">{product.sales} sold</span>
                  </div>
                  {product.rating > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Show variant options if available - updated for new structure */}
                {product.hasVariants && product.variants?.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-2">Available Options:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.variants.slice(0, 4).map((variant: ProductVariant, index: number) => (
                        <div key={variant.id || index} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                          {variant.color && getColorSwatch(variant.color)}
                          <span>
                            {variant.color && variant.size ? `${variant.color} • ${variant.size}` : 
                             variant.color || variant.size || 
                             (variant.option1 && variant.option2 ? `${variant.option1} • ${variant.option2}` :
                              variant.option1 || variant.option2)}
                          </span>
                        </div>
                      ))}
                      {product.variants.length > 4 && (
                        <div className="text-xs text-gray-500 px-2 py-1">
                          +{product.variants.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProduct(product)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant={product.status === 'active' ? 'outline' : 'default'}
                    className={`w-full ${product.status === 'active' ? '' : 'bg-green-600 hover:bg-green-700'}`}
                    onClick={() => toggleProductStatus(product.id)}
                  >
                    {product.status === 'active' ? 'Mark as Draft' : 'Publish Product'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first product to the catalog.'
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <Button 
                  onClick={handleAddProduct}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteProduct}
          title="Delete Product"
          description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete Product"
          isDestructive={true}
        />
      </div>
      )}
    </VendorLayout>
  )
}

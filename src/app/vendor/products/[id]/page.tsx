'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VendorLayout } from '@/components/layouts/vendor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase-client'
import { ArrowLeft, Eye, Edit, Package, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  inventory_quantity: number
  category_id: string
  is_active: boolean
  sku?: string
  weight?: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

interface ProductImage {
  id: string
  image_url: string
  alt_text?: string
  position: number
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductView({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Resolve params promise
  useEffect(() => {
    params.then(resolvedParams => {
      setProductId(resolvedParams.id)
    })
  }, [params])

  useEffect(() => {
    if (!productId) return
    
    const loadProduct = async () => {
      try {
        setLoading(true)

        // Get authenticated user and vendor
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/vendor')
          return
        }

        const { data: vendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!vendor) {
          router.push('/vendor/onboarding')
          return
        }

        setVendorId(vendor.id)

        // Load product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('vendor_id', vendor.id) // Ensure vendor can only view their own products
          .single()

        if (productError || !productData) {
          console.error('Product not found:', productError)
          router.push('/vendor/products')
          return
        }

        setProduct(productData)

        // Load product images
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productId)
          .order('position', { ascending: true })

        if (imagesData) {
          setImages(imagesData)
        }

        // Load category if exists
        if (productData.category_id) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', productData.category_id)
            .single()

          if (categoryData) {
            setCategory(categoryData)
          }
        }

      } catch (error) {
        console.error('Error loading product:', error)
        router.push('/vendor/products')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId, router, supabase])

  const handleDeleteProduct = async () => {
    if (!product || !confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
        return
      }

      alert('Product deleted successfully!')
      router.push('/vendor/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const toggleProductStatus = async () => {
    if (!product) return

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)

      if (error) {
        console.error('Error updating product status:', error)
        return
      }

      setProduct(prev => prev ? { ...prev, is_active: !prev.is_active } : null)
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Loading product...</p>
          </div>
        </div>
      </VendorLayout>
    )
  }

  if (!product) {
    return (
      <VendorLayout>
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/vendor/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vendor/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">Product Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/vendor/products/${product.id}/edit`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
            </Link>
            <Button
              variant={product.is_active ? "outline" : "default"}
              onClick={toggleProductStatus}
              className={product.is_active ? "" : "bg-green-600 hover:bg-green-700"}
            >
              {product.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteProduct}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                {images.length > 0 ? (
                  <div className="space-y-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative">
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || product.name}
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">No images uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Product Name</label>
                    <p className="mt-1 text-gray-900">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Price</label>
                    <p className="mt-1 text-gray-900 font-semibold">{product.price.toLocaleString()} RWF</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                    <p className="mt-1 text-gray-900">{product.inventory_quantity} units</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-gray-900">{category?.name || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">SKU</label>
                    <p className="mt-1 text-gray-900">{product.sku || 'Not set'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{product.description || 'No description provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Weight</label>
                    <p className="mt-1 text-gray-900">{product.weight ? `${product.weight} g` : 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-gray-900">{new Date(product.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-gray-900">{new Date(product.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Information */}
            {(product.meta_title || product.meta_description) && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Meta Title</label>
                    <p className="mt-1 text-gray-900">{product.meta_title || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Meta Description</label>
                    <p className="mt-1 text-gray-900">{product.meta_description || 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  )
}

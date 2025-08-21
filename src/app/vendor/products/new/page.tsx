'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VendorLayout } from '@/components/layouts/vendor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
// Using native select instead of custom Select component
import { createClient } from '@/lib/supabase-client'
import { ArrowLeft, Save, Package } from 'lucide-react'
import Link from 'next/link'

interface ProductFormData {
  name: string
  description: string
  price: string
  stock_quantity: string
  category: string
  sku: string
}

export default function NewProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    sku: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClient()

  // Load vendor data
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('No authenticated user')
          router.push('/auth/vendor')
          return
        }

        // Get vendor record
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (vendorError || !vendor) {
          console.error('Error fetching vendor:', vendorError)
          router.push('/vendor/onboarding')
          return
        }

        setVendorId(vendor.id)
      } catch (error) {
        console.error('Error loading vendor data:', error)
      }
    }

    loadVendorData()
  }, [supabase, router])

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required'
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required'
    } else {
      const priceNumber = parseFloat(formData.price)
      if (isNaN(priceNumber) || priceNumber <= 0) {
        newErrors.price = 'Price must be a valid positive number'
      }
    }

    if (!formData.stock_quantity.trim()) {
      newErrors.stock_quantity = 'Stock quantity is required'
    } else {
      const stockNumber = parseInt(formData.stock_quantity)
      if (isNaN(stockNumber) || stockNumber < 0) {
        newErrors.stock_quantity = 'Stock quantity must be a valid non-negative number'
      }
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !vendorId) {
      return
    }

    setLoading(true)

    try {
      const productData = {
        vendor_id: vendorId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category: formData.category.trim(),
        sku: formData.sku.trim() || null,
        is_active: true
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()

      if (error) {
        console.error('Error creating product:', error)
        alert('Failed to create product. Please try again.')
        return
      }

      console.log('Product created successfully:', data)
      alert('Product created successfully!')
      router.push('/vendor/products')

    } catch (error) {
      console.error('Error creating product:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'electronics',
    'food',
    'clothing',
    'books',
    'home',
    'beauty',
    'sports',
    'toys',
    'automotive',
    'health',
    'other'
  ]

  return (
    <VendorLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Create a new product for your store</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
              <CardDescription>
                Fill in the details for your new product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your product"
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (RWF) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                      placeholder="0"
                      className={errors.stock_quantity ? 'border-red-500' : ''}
                    />
                    {errors.stock_quantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.stock_quantity}</p>
                    )}
                  </div>
                </div>

                {/* Category and SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU (Optional)
                    </label>
                    <Input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Product SKU"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                  
                  <Link href="/vendor/products">
                    <Button type="button" variant="outline" disabled={loading}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorLayout>
  )
}

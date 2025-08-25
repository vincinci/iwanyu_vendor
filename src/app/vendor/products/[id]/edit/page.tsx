'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VendorLayout } from '@/components/layouts/vendor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase-client'
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  inventory_quantity: number
  category_id?: string
  is_active: boolean
  sku?: string
  weight?: number
  meta_title?: string
  meta_description?: string
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

interface FormData {
  name: string
  description: string
  price: string
  inventory_quantity: string
  category_id: string
  is_active: boolean
}

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [productId, setProductId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    inventory_quantity: '',
    category_id: '',
    is_active: true
  })

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
          .eq('vendor_id', vendor.id)
          .single()

        if (productError || !productData) {
          console.error('Product not found:', productError)
          router.push('/vendor/products')
          return
        }

        setProduct(productData)
        
        // Set form data
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price?.toString() || '',
          inventory_quantity: productData.stock_quantity?.toString() || '',
          category_id: productData.category || '',
          is_active: productData.is_active
        })

        // Load product images
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productId)
          .order('position', { ascending: true })

        if (imagesData) {
          setImages(imagesData)
        }

        // Load categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (categoriesData) {
          setCategories(categoriesData)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages(prev => [...prev, ...files])
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete(prev => [...prev, imageId])
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const uploadImages = async (productId: string) => {
    const uploadedUrls: string[] = []

    for (const file of newImages) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${productId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        continue
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl)
      }
    }

    // Insert image records
    if (uploadedUrls.length > 0) {
      const imageRecords = uploadedUrls.map((url, index) => ({
        product_id: productId,
        image_url: url,
        position: images.length + index
      }))

      await supabase
        .from('product_images')
        .insert(imageRecords)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !vendorId) return

    try {
      setSaving(true)

      // Validate required fields
      if (!formData.name.trim()) {
        alert('Product name is required')
        return
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert('Valid price is required')
        return
      }

      // Update product
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.inventory_quantity) || 0,
        category: formData.category_id || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id)

      if (updateError) {
        console.error('Error updating product:', updateError)
        alert('Failed to update product')
        return
      }

      // Delete marked images
      if (imagesToDelete.length > 0) {
        await supabase
          .from('product_images')
          .delete()
          .in('id', imagesToDelete)
      }

      // Upload new images
      if (newImages.length > 0) {
        await uploadImages(product.id)
      }

      alert('Product updated successfully!')
      router.push(`/vendor/products/${product.id}`)

    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
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
            <Link href={`/vendor/products/${product.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Product
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">{product.name}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Images */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload images for your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Images */}
                  {images.map((image) => (
                    <div key={image.id} className="relative">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || product.name}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeExistingImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* New Images Preview */}
                  {newImages.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`New image ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Add Images
                        </span>
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Details Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (RWF) *
                      </label>
                      <Input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <Input
                        name="inventory_quantity"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.inventory_quantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Active (visible to customers)
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your product..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-4">
                <Link href={`/vendor/products/${product.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </VendorLayout>
  )
}

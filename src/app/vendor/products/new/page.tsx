'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { VendorLayout } from '@/components/layouts/vendor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase-client'
import { ALL_CATEGORIES } from '@/lib/categories'
import { AddCategoryModal } from '@/components/modals/add-category-modal'
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Upload, 
  X, 
  Palette, 
  Ruler,
  Loader2,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface ProductVariant {
  id: number
  color?: string
  size?: string
  price: number
  stock: number
}

interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  category: string
  hasVariants: boolean
  variants: ProductVariant[]
  images: File[]
}

export default function NewProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    hasVariants: false,
    variants: [],
    images: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [availableCategories, setAvailableCategories] = useState(ALL_CATEGORIES)
  const maxImages = 5
  const supabase = createClient()

  const predefinedColors = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Beige', value: '#d2b48c' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Black', value: '#1f2937' },
    { name: 'White', value: '#ffffff' },
    { name: 'Yellow', value: '#f59e0b' }
  ]

  const predefinedShoeSizes = ['39-40', '41-42', '43-44']
  const predefinedClothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

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

        if (vendorError) {
          console.error('Error fetching vendor:', vendorError)
          return
        }

        if (!vendor) {
          console.error('No vendor record found')
          return
        }

        setVendorId(vendor.id)
      } catch (error) {
        console.error('Error loading vendor data:', error)
      }
    }

    loadVendorData()
  }, [supabase, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleColorToggle = (colorName: string) => {
    setSelectedColors(prev => {
      const newColors = prev.includes(colorName) 
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
      
      // Update variants when colors change
      updateVariants(newColors, selectedSizes)
      return newColors
    })
  }

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => {
      const newSizes = prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
      
      // Update variants when sizes change
      updateVariants(selectedColors, newSizes)
      return newSizes
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = maxImages - formData.images.length
    const filesToAdd = files.slice(0, remainingSlots)
    
    // Create preview URLs
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file))
    
    setImagePreviews(prev => [...prev, ...newPreviews])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...filesToAdd]
    }))
  }

  const removeImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const updateVariants = (colors: string[], sizes: string[]) => {
    const basePrice = parseFloat(formData.price) || 0
    const totalStock = parseInt(formData.stock) || 0
    
    let variants: ProductVariant[] = []

    if (colors.length > 0 && sizes.length > 0) {
      // Both colors and sizes selected - create combinations
      colors.forEach(color => {
        sizes.forEach(size => {
          variants.push({
            id: Date.now() + Math.random(),
            color,
            size,
            price: basePrice,
            stock: Math.floor(totalStock / (colors.length * sizes.length))
          })
        })
      })
    } else if (colors.length > 0) {
      // Only colors selected
      variants = colors.map(color => ({
        id: Date.now() + Math.random(),
        color,
        price: basePrice,
        stock: Math.floor(totalStock / colors.length)
      }))
    } else if (sizes.length > 0) {
      // Only sizes selected
      variants = sizes.map(size => ({
        id: Date.now() + Math.random(),
        size,
        price: basePrice,
        stock: Math.floor(totalStock / sizes.length)
      }))
    }

    setFormData(prev => ({
      ...prev,
      hasVariants: variants.length > 0,
      variants
    }))
  }

  const getColorSwatch = (colorValue: string, colorName: string) => {
    return (
      <div 
        className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ${colorValue === '#ffffff' ? 'border-gray-300' : ''}`}
        style={{ backgroundColor: colorValue }}
        title={colorName}
      />
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!vendorId) {
      alert('Vendor information not found. Please try again.')
      return
    }

    setLoading(true)

    try {
      // Validate required fields before processing
      if (!formData.name.trim()) {
        throw new Error('Product name is required')
      }
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        throw new Error('Valid price is required')
      }
      if (!formData.category) {
        throw new Error('Product category is required')
      }
      if (!vendorId) {
        throw new Error('Vendor information not found. Please try again.')
      }

      let imageUrls: string[] = []

      // Upload images to Supabase storage if any images are selected
      if (formData.images.length > 0) {
        console.log('Uploading images...')
        
        // Get current user for folder naming (required by RLS policy)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('User not authenticated')
        }
        
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('vendor-products')
            .upload(fileName, file)

          if (uploadError) {
            console.error('Error uploading image:', uploadError)
            throw new Error(`Failed to upload image: ${uploadError.message}`)
          }

          // Get public URL for the uploaded image
          const { data: urlData } = supabase.storage
            .from('vendor-products')
            .getPublicUrl(fileName)

          if (urlData?.publicUrl) {
            imageUrls.push(urlData.publicUrl)
          }
        }
        
        console.log('Images uploaded successfully:', imageUrls)
      }

      const stockQuantity = formData.hasVariants && formData.variants.length > 0
        ? formData.variants.reduce((total, variant) => total + (variant.stock || 0), 0)
        : parseInt(formData.stock) || 0

      // For now, use the base price since variants table doesn't exist yet
      const productPrice = formData.hasVariants && formData.variants.length > 0
        ? formData.variants[0]?.price || parseFloat(formData.price)
        : parseFloat(formData.price)

      // Create the product with image URLs
      console.log('Creating product with data:', {
        vendor_id: vendorId,
        name: formData.name,
        description: formData.description,
        price: productPrice,
        category: formData.category,
        stock_quantity: stockQuantity,
        is_active: true,
        images: imageUrls.length > 0 ? imageUrls : null
      })

      const { data, error } = await supabase
        .from('products')
        .insert({
          vendor_id: vendorId,
          name: formData.name,
          description: formData.description,
          price: productPrice,
          category: formData.category,
          stock_quantity: stockQuantity,
          is_active: true,
          images: imageUrls.length > 0 ? imageUrls : null
        })
        .select()

      if (error) {
        console.error('Database error creating product:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('Product created successfully:', data)
      
      // Show success message with variant info if applicable
      if (formData.hasVariants && formData.variants.length > 0) {
        alert(`Product created successfully! 
        
Note: You created ${formData.variants.length} variants. For now, the product has been created with combined stock (${stockQuantity} units) and will use the first variant's price (${productPrice} RWF). 

Full variant support (individual colors/sizes with different prices) will be available soon!`)
      } else {
        alert('Product created successfully!')
      }
      
      // Redirect to products page
      router.push('/vendor/products')
      
    } catch (error) {
      console.error('Error creating product:', error)
      
      // More specific error handling
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = (newCategory: { value: string; label: string; emoji: string }) => {
    // Add the new category to available categories
    const categoryToAdd = {
      value: newCategory.value,
      label: newCategory.label,
      emoji: newCategory.emoji,
      description: `Custom category: ${newCategory.label}`
    }
    
    setAvailableCategories(prev => [...prev, categoryToAdd])
    
    // Automatically select the new category
    setFormData(prev => ({
      ...prev,
      category: newCategory.value
    }))
    
    setShowAddCategoryModal(false)
  }

  return (
    <VendorLayout>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
      
      <div className="container mx-auto py-6 px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/vendor/products">
              <Button variant="outline" size="sm" className="bg-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new product for your store</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Details
                </CardTitle>
                <CardDescription>
                  Fill in the details for your new product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Product Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      className={`bg-white text-gray-900 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description *
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Product description"
                      className={`bg-white text-gray-900 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                      style={{ backgroundColor: 'white', color: '#111827' }}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Price (RWF) *
                      </label>
                      <Input
                        name="price"
                        type="number"
                        step="1"
                        value={formData.price}
                        onChange={(e) => {
                          handleInputChange(e)
                          updateVariants(selectedColors, selectedSizes)
                        }}
                        placeholder="1999"
                        className={`bg-white text-gray-900 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Stock Quantity *
                      </label>
                      <Input
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.stock}
                        onChange={(e) => {
                          handleInputChange(e)
                          updateVariants(selectedColors, selectedSizes)
                        }}
                        placeholder="100"
                        className={`bg-white text-gray-900 ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.stock && (
                        <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Category *
                    </label>
                    <div className="space-y-2">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 rounded-md border bg-white text-gray-900 ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="">Select category</option>
                        {availableCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      
                      {/* Add New Category Button */}
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(true)}
                        className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2 text-sm bg-gray-50 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Category</span>
                      </button>
                    </div>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Colors Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Colors (Optional)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => handleColorToggle(color.name)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                          selectedColors.includes(color.name)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {getColorSwatch(color.value, color.name)}
                        <span className="text-sm font-medium text-gray-700">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Sizes (Optional)
                  </h3>
                  
                  {/* Shoe Sizes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">👟 Euro Shoe Sizes</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {predefinedShoeSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                            selectedSizes.includes(size)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="text-sm font-medium">{size}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clothing Sizes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">👕 Clothing Sizes</h4>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {predefinedClothingSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeToggle(size)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                            selectedSizes.includes(size)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="text-sm font-medium">{size}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Variants Preview */}
                {formData.variants.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-lg font-medium text-green-800 mb-3">
                      ✅ {formData.variants.length} Variants Created
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.variants.slice(0, 8).map((variant, index) => (
                        <div key={index} className="flex items-center gap-3 text-green-700 bg-white p-2 rounded">
                          {variant.color && getColorSwatch(
                            predefinedColors.find(c => c.name === variant.color)?.value || '#gray', 
                            variant.color
                          )}
                          <span className="text-sm">
                            {variant.color} {variant.size} - {variant.price} RWF ({variant.stock} stock)
                          </span>
                        </div>
                      ))}
                      {formData.variants.length > 8 && (
                        <span className="text-green-600 text-sm font-medium">+{formData.variants.length - 8} more variants</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Product Images (Max {maxImages})
                  </h3>
                  
                  {/* Upload Area */}
                  {formData.images.length < maxImages && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 mb-2">
                          Click to upload images ({formData.images.length}/{maxImages})
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    </div>
                  )}

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-32 rounded-lg border border-gray-200 overflow-hidden">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-between items-center">
              <Link href="/vendor/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={handleAddCategory}
      />
    </VendorLayout>
  )
}

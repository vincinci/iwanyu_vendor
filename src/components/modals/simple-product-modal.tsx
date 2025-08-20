'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  X, 
  Upload, 
  Save,
  Loader2,
  Palette,
  Ruler
} from 'lucide-react'

interface ProductData {
  name: string
  description: string
  price: string
  stock: string
  category: string
  hasVariants: boolean
  variants: ProductVariant[]
  images: File[]
}

interface SimpleProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: ProductData) => void
}

interface ProductVariant {
  id: number
  color?: string
  size?: string
  price: number
  stock: number
}

export const SimpleProductModal = ({ isOpen, onClose, onSave }: SimpleProductModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    hasVariants: false,
    variants: [] as ProductVariant[],
    images: [] as File[]
  })

  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const maxImages = 5

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsLoading(false)
    }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-xl bg-white/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl backdrop-blur-2xl bg-white/90 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">✨ Add Product</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full backdrop-blur-xl bg-white/60 hover:bg-white/80 border border-white/30 shadow-lg transition-all duration-200"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Product Name *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
                className="w-full px-3 py-2 rounded-lg backdrop-blur-xl bg-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                placeholder="Product description"
                required
                className="w-full px-3 py-2 rounded-lg backdrop-blur-xl bg-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 placeholder-gray-500 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Price (RWF) *
                </label>
                <input
                  name="price"
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={(e) => {
                    handleInputChange(e)
                    updateVariants(selectedColors, selectedSizes)
                  }}
                  placeholder="1999"
                  required
                  className="w-full px-3 py-2 rounded-lg backdrop-blur-xl bg-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 placeholder-gray-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Stock *
                </label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => {
                    handleInputChange(e)
                    updateVariants(selectedColors, selectedSizes)
                  }}
                  placeholder="100"
                  required
                  className="w-full px-3 py-2 rounded-lg backdrop-blur-xl bg-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 placeholder-gray-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 rounded-lg backdrop-blur-xl bg-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 text-sm"
              >
                <option value="">Choose category</option>
                <option value="electronics">� Electronics</option>
                <option value="clothing">👕 Clothing</option>
                <option value="shoes">👟 Shoes</option>
                <option value="accessories">💍 Accessories</option>
              </select>
            </div>
          </div>

          {/* Colors Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors (Optional)
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleColorToggle(color.name)}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedColors.includes(color.name)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getColorSwatch(color.value, color.name)}
                  <span className="text-xs font-medium text-gray-700">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Sizes (Optional)
            </h3>
            
            {/* Shoe Sizes */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">👟 Euro Shoe Sizes</h4>
              <div className="grid grid-cols-3 gap-2">
                {predefinedShoeSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`p-2 rounded-lg border-2 transition-all duration-200 text-center ${
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
              <h4 className="text-xs font-medium text-gray-700 mb-2">👕 Clothing Sizes</h4>
              <div className="grid grid-cols-4 gap-2">
                {predefinedClothingSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`p-2 rounded-lg border-2 transition-all duration-200 text-center ${
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
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                ✅ {formData.variants.length} Variants Created
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {formData.variants.slice(0, 6).map((variant, index) => (
                  <div key={index} className="flex items-center gap-2 text-green-700">
                    {variant.color && getColorSwatch(
                      predefinedColors.find(c => c.name === variant.color)?.value || '#gray', 
                      variant.color
                    )}
                    <span>
                      {variant.color} {variant.size} - {variant.price} RWF ({variant.stock} stock)
                    </span>
                  </div>
                ))}
                {formData.variants.length > 6 && (
                  <span className="text-green-600 text-xs">+{formData.variants.length - 6} more</span>
                )}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Product Images (Max {maxImages})
            </h3>
            
            {/* Upload Area */}
            {formData.images.length < maxImages && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload images ({formData.images.length}/{maxImages})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>
            )}

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-20 rounded-lg border border-gray-200 overflow-hidden">
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
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/30 text-gray-700 text-sm font-medium shadow-lg transition-all duration-200"
            >
              Cancel
            </button>

            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

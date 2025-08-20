'use client'

// This component is deprecated - use SimpleProductModal instead
import React from 'react'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: ProductData) => void
  product?: Product | null
}

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

interface ProductVariant {
  id: number
  color?: string
  size?: string
  price: number
  stock: number
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

export const ProductModal = ({ isOpen, onClose }: ProductModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Deprecated Component</h2>
        <p className="text-gray-600 mb-4">
          This ProductModal is deprecated. Please use SimpleProductModal instead.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus, AlertCircle } from 'lucide-react'
import { validateNewCategory, createNewCategory } from '@/lib/categories'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryAdded: (category: { value: string; label: string; emoji: string }) => void
}

export function AddCategoryModal({ isOpen, onClose, onCategoryAdded }: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('')
  const [categoryEmoji, setCategoryEmoji] = useState('📦')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const commonEmojis = [
    '📦', '👕', '👟', '💍', '📱', '🏠', '🍽️', '💄',
    '⚽', '📚', '🧸', '🚗', '🎮', '🎵', '🌱', '🔧',
    '🎨', '💊', '🏃', '🍾', '🧳', '🎪', '🧩', '🔥'
  ]

  const handleSubmit = async () => {
    setError('')
    
    const validation = validateNewCategory(categoryName)
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    setIsSubmitting(true)

    try {
      const newCategory = createNewCategory(categoryName, categoryEmoji)
      onCategoryAdded(newCategory)
      
      // Reset form
      setCategoryName('')
      setCategoryEmoji('📦')
      onClose()
    } catch (err) {
      setError('Failed to create category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCategoryName('')
    setCategoryEmoji('📦')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category Name *
            </label>
            <Input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Custom Electronics, Handmade Crafts"
              className="w-full"
              maxLength={50}
            />
            <p className="text-xs text-gray-500">
              Choose a descriptive name for your new category
            </p>
          </div>

          {/* Emoji Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category Icon
            </label>
            <div className="space-y-3">
              {/* Selected Emoji Display */}
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{categoryEmoji}</div>
                <Input
                  type="text"
                  value={categoryEmoji}
                  onChange={(e) => setCategoryEmoji(e.target.value.slice(0, 2))}
                  placeholder="📦"
                  className="w-20 text-center text-lg"
                  maxLength={2}
                />
              </div>
              
              {/* Common Emojis Grid */}
              <div className="grid grid-cols-8 gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCategoryEmoji(emoji)}
                    className={`p-2 text-lg rounded-lg border transition-colors hover:bg-gray-50 ${
                      categoryEmoji === emoji 
                        ? 'border-yellow-500 bg-yellow-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          {categoryName.trim() && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{categoryEmoji}</span>
                <span className="font-medium">{categoryName.trim()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!categoryName.trim() || isSubmitting}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

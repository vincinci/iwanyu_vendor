'use client'

import { useState } from 'react'
import { 
  X, 
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  isDestructive?: boolean
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Confirm',
  isDestructive = false 
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-xl bg-white/20 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl backdrop-blur-xl bg-white/90 border border-white/30 shadow-2xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {isDestructive && (
                <div className="w-8 h-8 rounded-lg backdrop-blur-xl bg-red-500/80 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              )}
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/30 shadow-lg transition-all duration-200"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">{description}</p>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/30 text-gray-700 text-sm font-medium shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg backdrop-blur-xl text-sm font-medium shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${
                isDestructive 
                  ? 'bg-red-500/80 hover:bg-red-600/80 text-white border border-red-300/30' 
                  : 'bg-gradient-to-r from-blue-500/70 to-purple-600/70 hover:from-blue-600/80 hover:to-purple-700/80 text-white border border-white/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

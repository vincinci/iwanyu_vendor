'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Download,
  Calendar,
  Filter,
  Package,
  Loader2,
  FileText,
  Table,
  ShoppingCart
} from 'lucide-react'
import { csvExporter, type ExportFilters } from '@/lib/csv-export'

interface CSVExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CSVExportModal({ isOpen, onClose }: CSVExportModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [vendors, setVendors] = useState<{id: string, name: string, business: string}[]>([])
  const [previewCount, setPreviewCount] = useState<number>(0)
  
  const [filters, setFilters] = useState<ExportFilters>({
    status: 'all',
    stockLevel: 'all',
    sortBy: 'newest'
  })
  
  const [format, setFormat] = useState<'simple' | 'detailed' | 'shopify'>('detailed')
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })

  // Load filter options
  useEffect(() => {
    if (isOpen) {
      loadFilterOptions()
      updatePreviewCount()
    }
  }, [isOpen, filters])

  const loadFilterOptions = async () => {
    try {
      const [categoriesData, vendorsData] = await Promise.all([
        csvExporter.getAvailableCategories(),
        csvExporter.getAvailableVendors()
      ])
      setCategories(categoriesData)
      setVendors(vendorsData)
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  const updatePreviewCount = async () => {
    try {
      const exportFilters = buildExportFilters()
      const products = await csvExporter.getProductsForExport(exportFilters)
      setPreviewCount(products.length)
    } catch (error) {
      console.error('Failed to get preview count:', error)
      setPreviewCount(0)
    }
  }

  const buildExportFilters = (): ExportFilters => {
    const exportFilters: ExportFilters = {
      ...filters
    }

    // Add date range if specified
    if (dateRange.from && dateRange.to) {
      exportFilters.dateRange = {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to)
      }
    }

    return exportFilters
  }

  const handleQuickFilter = (days: 7 | 30 | 90) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    
    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    })
    
    setFilters(prev => ({
      ...prev,
      sortBy: 'newest'
    }))
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const exportFilters = buildExportFilters()
      const products = await csvExporter.getProductsForExport(exportFilters)
      
      if (products.length === 0) {
        alert('No products found matching the selected criteria.')
        return
      }

      const csvContent = csvExporter.convertToCSV(products, format)
      const filename = csvExporter.generateFilename(`products_export_${format}`, 'csv')
      
      csvExporter.downloadCSV(csvContent, filename)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Download className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Export Products</h2>
                <p className="text-sm text-gray-600">Download product data in CSV format</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>

          <div className="space-y-6">
            {/* Quick Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Quick Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter(7)}
                    className="text-xs"
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter(30)}
                    className="text-xs"
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter(90)}
                    className="text-xs"
                  >
                    Last 90 Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRange({ from: '', to: '' })
                      setFilters(prev => ({ ...prev, category: undefined, vendor: undefined }))
                    }}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status || 'all'}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>

                {/* Stock Level and Sort */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Level
                    </label>
                    <select
                      value={filters.stockLevel || 'all'}
                      onChange={(e) => setFilters(prev => ({ ...prev, stockLevel: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Stock Levels</option>
                      <option value="low">Low Stock (≤10)</option>
                      <option value="out">Out of Stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy || 'newest'}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name A-Z</option>
                      <option value="price">Price Low-High</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Format */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setFormat('simple')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      format === 'simple'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Table className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">Simple</div>
                    <div className="text-xs text-gray-500">Basic fields</div>
                  </button>
                  <button
                    onClick={() => setFormat('detailed')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      format === 'detailed'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Package className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">Detailed</div>
                    <div className="text-xs text-gray-500">All fields</div>
                  </button>
                  <button
                    onClick={() => setFormat('shopify')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      format === 'shopify'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">Shopify</div>
                    <div className="text-xs text-gray-500">Import ready</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {previewCount} products will be exported
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {format.toUpperCase()} Format
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={loading || previewCount === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Activity,
  RefreshCw,
  Grid3x3,
  List,
  BarChart3,
  Tag,
  Archive
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  slug: string
  is_active: boolean
  created_at: string
  product_count?: number
}

interface CategoryStats {
  total: number
  active: number
  inactive: number
  with_products: number
  without_products: number
  total_products: number
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    is_active: true
  })
  const [stats, setStats] = useState<CategoryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    with_products: 0,
    without_products: 0,
    total_products: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchCategories()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('Fetching categories with comprehensive data...')
      
      // Test database connection first
      const { data: connectionTest, error: connectionError } = await supabase
        .from('categories')
        .select('count')
        .limit(1)
      
      console.log('Database connection test:', { connectionTest, connectionError })
      
      // Fetch categories with actual schema
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Categories query result:', { categoriesData, categoriesError, count: categoriesData?.length })

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
        setCategories([])
        return
      }

      const categories = categoriesData || []

      // Fetch product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category: any) => {
          try {
            // Try different query approaches for better compatibility
            let count = 0
            
            // First try: HEAD request with count
            const { count: headCount, error: headError } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('is_active', true)
            
            if (!headError && headCount !== null) {
              count = headCount
            } else {
              // Fallback: Regular select and count manually
              console.log('HEAD count failed for category', category.id, 'trying SELECT:', headError)
              const { data: products, error: selectError } = await supabase
                .from('products')
                .select('id')
                .eq('category_id', category.id)
                .eq('is_active', true)
              
              if (!selectError && products) {
                count = products.length
              } else {
                console.log('SELECT also failed for category', category.id, ':', selectError)
                count = 0
              }
            }
            
            return {
              ...category,
              product_count: count
            }
          } catch (error) {
            console.error('Error fetching product count for category', category.id, ':', error)
            return {
              ...category,
              product_count: 0
            }
          }
        })
      )

      setCategories(categoriesWithCounts)
      console.log('Final categories set:', categoriesWithCounts.length)
      
      // Calculate comprehensive stats
      const stats = {
        total: categoriesWithCounts.length,
        active: categoriesWithCounts.filter(c => c.is_active).length,
        inactive: categoriesWithCounts.filter(c => !c.is_active).length,
        with_products: categoriesWithCounts.filter(c => c.product_count > 0).length,
        without_products: categoriesWithCounts.filter(c => c.product_count === 0).length,
        total_products: categoriesWithCounts.reduce((sum, c) => sum + (c.product_count || 0), 0)
      }
      
      setStats(stats)
      console.log('Categories loaded:', { count: categoriesWithCounts.length, stats })
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([formData])

      if (error) {
        console.error('Error creating category:', error)
        return
      }

      setShowCreateForm(false)
      setFormData({
        name: '',
        description: '',
        slug: '',
        is_active: true
      })
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      const { error } = await supabase
        .from('categories')
        .update(formData)
        .eq('id', editingCategory.id)

      if (error) {
        console.error('Error updating category:', error)
        return
      }

      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        slug: '',
        is_active: true
      })
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting category:', error)
        return
      }

      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      is_active: category.is_active
    })
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setEditingCategory(null)
    setShowCreateForm(false)
    setFormData({
      name: '',
      description: '',
      slug: '',
      is_active: true
    })
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && category.is_active) ||
      (statusFilter === 'inactive' && !category.is_active) ||
      (statusFilter === 'with_products' && (category.product_count || 0) > 0) ||
      (statusFilter === 'without_products' && (category.product_count || 0) === 0)
    
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-2">
              Manage product categories and their organization
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchCategories()}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <Archive className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">With Products</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.with_products}</p>
                </div>
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empty</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.without_products}</p>
                </div>
                <Archive className="h-5 w-5 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.total_products}</p>
                </div>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="with_products">With Products</option>
              <option value="without_products">Empty</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </CardTitle>
              <CardDescription>
                {editingCategory ? 'Update category information' : 'Add a new category to organize products'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: generateSlug(name)
                      })
                    }}
                    placeholder="Category name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="category-slug"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={!formData.name || !formData.slug}
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Display */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No categories match your current filters.' 
                  : 'Get started by creating your first category.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Slug: {category.slug}</div>
                        <div>Products: {category.product_count || 0}</div>
                        <div>Created: {new Date(category.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">{category.slug}</div>
                            {category.description && (
                              <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {category.product_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(category.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

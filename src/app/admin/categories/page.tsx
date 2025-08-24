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
  Eye,
  Activity,
  RefreshCw,
  Grid3x3,
  List,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Tag,
  Archive,
  Star,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  slug: string
  parent_id: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  image_url: string | null
  seo_title: string | null
  seo_description: string | null
  products?: {
    id: string
    name: string
    status: string
  }[]
  parent?: {
    name: string
  }
  children?: Category[]
}

interface CategoryStats {
  total: number
  active: number
  inactive: number
  with_products: number
  without_products: number
  total_products: number
  featured: number
  trending: number
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    parent_id: '',
    is_active: true,
    display_order: 0,
    image_url: '',
    seo_title: '',
    seo_description: ''
  })
  const [stats, setStats] = useState<CategoryStats>({
    total: 0,
    active: 0,
    inactive: 0,
    with_products: 0,
    without_products: 0,
    total_products: 0,
    featured: 0,
    trending: 0
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
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          parent:parent_id (
            name
          ),
          products (
            id,
            name,
            status
          )
        `)
        .order('display_order')

      console.log('Categories query result:', { categoriesData, categoriesError })

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
        setCategories([])
        return
      }

      const categories = categoriesData || []
      setCategories(categories)
      
      // Calculate comprehensive stats
      const stats = {
        total: categories.length,
        active: categories.filter(c => c.is_active).length,
        inactive: categories.filter(c => !c.is_active).length,
        with_products: categories.filter(c => c.products && c.products.length > 0).length,
        without_products: categories.filter(c => !c.products || c.products.length === 0).length,
        total_products: categories.reduce((sum, c) => sum + (c.products?.length || 0), 0),
        featured: categories.filter(c => c.display_order <= 5 && c.is_active).length,
        trending: categories.filter(c => c.products && c.products.filter((p: any) => p.status === 'active').length > 10).length
      }
      
      setStats(stats)
      console.log('Categories loaded:', { count: categories.length, stats })
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
        .insert([{
          ...formData,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }])

      if (error) throw error

      setShowCreateForm(false)
      setFormData({
        name: '',
        description: '',
        slug: '',
        parent_id: '',
        is_active: true,
        display_order: 0,
        image_url: '',
        seo_title: '',
        seo_description: ''
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

      if (error) throw error

      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        slug: '',
        parent_id: '',
        is_active: true,
        display_order: 0,
        image_url: '',
        seo_title: '',
        seo_description: ''
      })
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId)

      if (error) throw error

      setCategories(prev => prev.map(category => 
        category.id === categoryId ? { ...category, is_active: !currentStatus } : category
      ))
    } catch (error) {
      console.error('Error updating category status:', error)
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      parent_id: category.parent_id || '',
      is_active: category.is_active,
      display_order: category.display_order,
      image_url: category.image_url || '',
      seo_title: category.seo_title || '',
      seo_description: category.seo_description || ''
    })
  }

  const resetForm = () => {
    setEditingCategory(null)
    setShowCreateForm(false)
    setFormData({
      name: '',
      description: '',
      slug: '',
      parent_id: '',
      is_active: true,
      display_order: 0,
      image_url: '',
      seo_title: '',
      seo_description: ''
    })
  }

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchTerm || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && category.is_active) ||
      (statusFilter === 'inactive' && !category.is_active) ||
      (statusFilter === 'with_products' && category.products && category.products.length > 0) ||
      (statusFilter === 'without_products' && (!category.products || category.products.length === 0))
    
    return matchesSearch && matchesStatus
  })

  const parentCategories = categories.filter(c => !c.parent_id)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600">Organize and manage product categories</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
            <Button onClick={fetchCategories} disabled={loading} variant="outline">
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-green-600">{stats.active} active • {stats.inactive} inactive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Category Usage</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.with_products}</div>
              <p className="text-xs text-gray-500">
                {stats.without_products} empty categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_products}</div>
              <p className="text-xs text-blue-600">
                Avg: {stats.total > 0 ? Math.round(stats.total_products / stats.total) : 0} per category
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.trending}</div>
              <p className="text-xs text-gray-500">{stats.featured} featured categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search categories by name, description, or slug..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Categories</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="with_products">With Products</option>
                    <option value="without_products">Empty</option>
                  </select>
                  <div className="flex border border-gray-300 rounded-md">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none border-r-0"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant="outline">
                    {filteredCategories.length} Results
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {(showCreateForm || editingCategory) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </CardTitle>
              <CardDescription>
                {editingCategory ? 'Update category information' : 'Add a new product category to organize your marketplace'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="category-slug (auto-generated if empty)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Category description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">No Parent (Top Level)</option>
                    {parentCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <Input
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                  <textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="SEO meta description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active Category
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  disabled={!formData.name.trim()}
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Display */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage your product categories ({filteredCategories.length} categories found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Activity className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No categories found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {categories.length === 0 
                    ? 'Create your first category to organize products'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  const productCount = category.products?.length || 0
                  const activeProductCount = category.products?.filter(p => p.status === 'active').length || 0

                  return (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              category.is_active ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <Tag className={`h-5 w-5 ${
                                category.is_active ? 'text-green-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{category.name}</h3>
                              <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {category.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {category.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {category.description}
                          </p>
                        )}

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Products:</span>
                            <span className="font-medium">{productCount} ({activeProductCount} active)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Slug:</span>
                            <span className="font-mono text-xs">{category.slug}</span>
                          </div>
                          {category.parent && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Parent:</span>
                              <span>{category.parent.name}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Order:</span>
                            <span>{category.display_order}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(category)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleStatus(category.id, category.is_active)}
                          >
                            {category.is_active ? <Archive className="h-3 w-3 mr-1" /> : <Star className="h-3 w-3 mr-1" />}
                            {category.is_active ? 'Deactivate' : 'Activate'}
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
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories.map((category) => {
                  const productCount = category.products?.length || 0
                  const activeProductCount = category.products?.filter(p => p.status === 'active').length || 0

                  return (
                    <Card key={category.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              category.is_active ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <Tag className={`h-4 w-4 ${
                                category.is_active ? 'text-green-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm text-gray-500">
                                {category.slug} • {productCount} products ({activeProductCount} active)
                                {category.parent && ` • Child of ${category.parent.name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => startEdit(category)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleToggleStatus(category.id, category.is_active)}
                              >
                                {category.is_active ? <Archive className="h-3 w-3" /> : <Star className="h-3 w-3" />}
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

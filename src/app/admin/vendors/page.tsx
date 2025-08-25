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
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Activity,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Package,
  ShoppingCart,
  Banknote,
  AlertTriangle,
  UserCheck,
  UserX,
  UserPlus
} from 'lucide-react'

interface Vendor {
  id: string
  full_name: string
  business_name: string | null
  email: string
  phone_number: string | null
  business_address: string | null
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  subscription_plan: 'free' | 'basic' | 'standard' | 'premium'
  created_at: string
  updated_at: string
  total_sales: number
  total_orders: number
  products?: { id: string }[]
  orders?: { id: string, total_amount: number, status: string }[]
}

interface VendorStats {
  total: number
  active: number
  pending: number
  suspended: number
  new_today: number
  total_products: number
  total_orders: number
  total_revenue: number
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active') // Default to show active vendors
  const [stats, setStats] = useState<VendorStats>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    new_today: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchVendors()
    
    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchVendors()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      console.log('Fetching vendors with comprehensive data...')
      
      // Test database connection first
      const { data: connectionTest, error: connectionError } = await supabase
        .from('vendors')
        .select('count')
        .limit(1)
      
      console.log('Database connection test:', { connectionTest, connectionError })
      
      // Use simple query without joins to avoid 400 errors
      let { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Vendors query result:', { vendorsData, vendorsError, count: vendorsData?.length })

      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError)
        setVendors([])
        return
      }

      const vendors = vendorsData || []
      
      // Fetch product counts for each vendor separately
      const vendorsWithCounts = await Promise.all(
        vendors.map(async (vendor: any) => {
          // Get product count for this vendor
          const { data: products, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('vendor_id', vendor.id)
          
          // Get order count and revenue for this vendor
          const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('id, total_amount, status')
            .eq('vendor_id', vendor.id)
          
          const productCount = products?.length || 0
          const orderCount = orders?.length || 0
          const revenue = orders?.filter(o => ['delivered', 'completed'].includes(o.status))
            ?.reduce((sum, o) => sum + o.total_amount, 0) || 0
          
          return {
            ...vendor,
            products: products || [],
            orders: orders || [],
            product_count: productCount,
            order_count: orderCount,
            total_revenue: revenue
          }
        })
      )
      
      setVendors(vendorsWithCounts)
      console.log('Final vendors set:', vendorsWithCounts.length)
      
      // Calculate stats with real data
      const today = new Date().toISOString().split('T')[0]
      const stats = {
        total: vendorsWithCounts.length,
        active: vendorsWithCounts.filter(v => v.status === 'approved').length,
        pending: vendorsWithCounts.filter(v => v.status === 'pending').length,
        suspended: vendorsWithCounts.filter(v => v.status === 'suspended').length,
        new_today: vendorsWithCounts.filter(v => v.created_at?.startsWith(today)).length,
        total_products: vendorsWithCounts.reduce((sum, v) => sum + (v.product_count || 0), 0),
        total_orders: vendorsWithCounts.reduce((sum, v) => sum + (v.order_count || 0), 0),
        total_revenue: vendorsWithCounts.reduce((sum, v) => sum + (v.total_revenue || 0), 0)
      }
      
      setStats(stats)
      console.log('Vendors loaded:', { count: vendorsWithCounts.length, stats })
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

    const handleStatusUpdate = async (vendorId: string, newStatus: 'pending' | 'approved' | 'suspended' | 'rejected') => {
    try {
      console.log(`Updating vendor ${vendorId} status to: ${newStatus}`)
      
      const { error } = await supabase
        .from('vendors')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (error) throw error

      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor.id === vendorId ? { ...vendor, status: newStatus } : vendor
      ))
      
      // Refresh stats
      fetchVendors()
      
      console.log(`Vendor ${vendorId} status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating vendor status:', error)
    }
  }

  const handleVendorApproval = async (vendorId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      let newStatus: 'pending' | 'approved' | 'suspended' | 'rejected'
      let updateData: any = { updated_at: new Date().toISOString() }
      
      switch (action) {
        case 'approve':
          newStatus = 'approved'
          updateData.status = 'approved'
          break
        case 'reject':
          newStatus = 'rejected' 
          updateData.status = 'rejected'
          break
        case 'suspend':
          newStatus = 'suspended'
          updateData.status = 'suspended'  
          break
        default:
          return
      }

      console.log(`${action}ing vendor ${vendorId}...`)
      
      const { error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('id', vendorId)

      if (error) throw error

      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor.id === vendorId ? { 
          ...vendor, 
          status: newStatus
        } : vendor
      ))
      
      // Refresh to get updated stats
      fetchVendors()
      
      console.log(`Vendor ${vendorId} ${action}ed successfully`)
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error)
    }
  }

  const getStatusBadge = (vendor: Vendor) => {
    if (vendor.status === 'approved') {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    } else if (vendor.status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    } else if (vendor.status === 'suspended') {
      return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>
    }
  }

  const getPerformanceBadge = (vendor: Vendor) => {
    const orderCount = (vendor as any).order_count || 0
    const revenue = (vendor as any).total_revenue || 0
    
    if (revenue > 100000) {
      return <Badge className="bg-purple-100 text-purple-800">Top Performer</Badge>
    } else if (revenue > 50000) {
      return <Badge className="bg-blue-100 text-blue-800">High Performer</Badge>
    } else if (orderCount > 0) {
      return <Badge className="bg-green-100 text-green-800">Active Seller</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">New Vendor</Badge>
    }
  }

  // Filter vendors based on search and filters
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = !searchTerm || 
      vendor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.business_address?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Update status filter logic to use status enum
    const matchesStatus = !statusFilter || 
      statusFilter === 'all' ||
      (statusFilter === 'active' && vendor.status === 'approved') ||
      (statusFilter !== 'active' && vendor.status === statusFilter)
    
    return matchesSearch && matchesStatus
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600">Monitor and manage all marketplace vendors</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button onClick={fetchVendors} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              {stats.new_today > 0 && (
                <p className="text-xs text-green-600 mt-1">+{stats.new_today} today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-gray-500">
                {stats.pending} pending, {stats.suspended} suspended
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_products}</div>
              <p className="text-xs text-gray-500">
                {stats.total_products > 0 ? (stats.total_products / stats.total).toFixed(1) : 0} avg per vendor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_revenue.toLocaleString()} RWF</div>
              <p className="text-xs text-gray-500">{stats.total_orders} total orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search vendors by name, business, email, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter ({filteredVendors.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendors List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
              Manage vendor accounts and their information ({filteredVendors.length} vendors found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Activity className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading vendors...</span>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No vendors found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {vendors.length === 0 
                    ? 'Vendor registrations will appear here when users sign up'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredVendors.map((vendor) => {
                  const productCount = (vendor as any).product_count || 0
                  const orderCount = (vendor as any).order_count || 0
                  const revenue = (vendor as any).total_revenue || 0

                  return (
                    <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {/* Vendor Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{vendor.full_name}</h3>
                              {vendor.business_name && (
                                <p className="text-sm text-gray-600">{vendor.business_name}</p>
                              )}
                              <div className="flex gap-2 mt-1">
                                {getStatusBadge(vendor)}
                                {getPerformanceBadge(vendor)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>ID: {vendor.id.slice(0, 8)}...</div>
                            <div>Joined: {new Date(vendor.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            {vendor.phone_number && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{vendor.phone_number}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {vendor.business_address && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{vendor.business_address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{productCount}</div>
                            <div className="text-xs text-gray-500">Products</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{orderCount}</div>
                            <div className="text-xs text-gray-500">Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">RWF Revenue</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          
                          {vendor.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleVendorApproval(vendor.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleVendorApproval(vendor.id, 'reject')}
                                className="text-red-600 hover:text-red-700 border-red-300"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {vendor.status === 'approved' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleVendorApproval(vendor.id, 'suspend')}
                              className="text-red-600 hover:text-red-700 border-red-300"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                          
                          {vendor.status === 'suspended' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleVendorApproval(vendor.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Reactivate
                            </Button>
                          )}

                          {vendor.status === 'rejected' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleVendorApproval(vendor.id, 'approve')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Reconsider
                            </Button>
                          )}
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

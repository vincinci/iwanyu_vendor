'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Package, ShoppingCart, Smartphone, MessageSquare, Bell, TrendingUp, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface DashboardStats {
  totalVendors: number
  activeProducts: number
  pendingOrders: number
  totalRevenue: number
  newVendorsToday: number
  newProductsToday: number
  unreadMessages: number
}

interface RecentVendor {
  id: string
  business_name: string
  full_name: string
  created_at: string
  status: string
}

interface RecentMessage {
  id: string
  vendor_id: string
  subject: string
  content?: string
  status: string
  created_at: string
  vendor?: {
    business_name: string
    full_name: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    newVendorsToday: 0,
    newProductsToday: 0,
    unreadMessages: 0
  })
  const [recentVendors, setRecentVendors] = useState<RecentVendor[]>([])
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
    
    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching real-time dashboard data...')

      // Fetch vendor data with detailed counts
      const { data: vendorData, count: vendorCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact' })

      // Get vendor status breakdown
      const vendorStatusBreakdown = vendorData?.reduce((acc, vendor) => {
        acc[vendor.status] = (acc[vendor.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Fetch product data
      const { data: productData, count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' })

      // Get active products only
      const activeProducts = productData?.filter(p => p.is_active) || []

      // Fetch order data
      const { data: orderData, count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })

      // Calculate total revenue from completed orders
      const totalRevenue = orderData?.reduce((sum, order) => {
        if (order.status === 'delivered' || order.status === 'completed') {
          return sum + parseFloat(order.total_amount || 0)
        }
        return sum
      }, 0) || 0

      // Get pending orders
      const pendingOrders = orderData?.filter(o => o.status === 'pending') || []

      // Fetch message data
      const { data: messageData, count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })

      // Get unread messages
      const unreadMessages = messageData?.filter(m => m.status === 'unread') || []

      // Fetch recent vendors (last 10) with user details
      const { data: recentVendorData } = await supabase
        .from('vendors')
        .select(`
          *,
          user:user_id (
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch recent messages (last 10)
      const { data: recentMessageData } = await supabase
        .from('messages')
        .select(`
          *,
          vendor:vendor_id (
            business_name,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      // Get today's statistics
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      const { count: newVendorsToday } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO)

      const { count: newProductsToday } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO)

      const { count: newOrdersToday } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO)

      console.log('Real-time dashboard data:', {
        vendors: {
          total: vendorCount,
          breakdown: vendorStatusBreakdown,
          newToday: newVendorsToday
        },
        products: {
          total: productCount,
          active: activeProducts.length,
          newToday: newProductsToday
        },
        orders: {
          total: orderCount,
          pending: pendingOrders.length,
          newToday: newOrdersToday,
          revenue: totalRevenue
        },
        messages: {
          total: messageCount,
          unread: unreadMessages.length
        }
      })

      setStats({
        totalVendors: vendorCount || 0,
        activeProducts: activeProducts.length || 0,
        pendingOrders: pendingOrders.length || 0,
        totalRevenue: totalRevenue,
        newVendorsToday: newVendorsToday || 0,
        newProductsToday: newProductsToday || 0,
        unreadMessages: unreadMessages.length || 0
      })

      setRecentVendors(recentVendorData || [])
      setRecentMessages(recentMessageData || [])
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveVendor = async (vendorId: string) => {
    try {
      console.log('Attempting to approve vendor:', vendorId)
      
      const { data, error } = await supabase
        .from('vendors')
        .update({ status: 'approved' })
        .eq('id', vendorId)
        .select()

      console.log('Approval result:', { data, error })

      if (error) {
        console.error('Error approving vendor:', error)
        alert(`Error approving vendor: ${error.message}`)
        return
      }

      console.log('Vendor approved successfully')
      alert('Vendor approved successfully!')
      
      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving vendor:', error)
      alert(`Failed to approve vendor: ${error}`)
    }
  }

  const handleRejectVendor = async (vendorId: string) => {
    try {
      console.log('Attempting to reject vendor:', vendorId)
      
      const { data, error } = await supabase
        .from('vendors')
        .update({ status: 'rejected' })
        .eq('id', vendorId)
        .select()

      console.log('Rejection result:', { data, error })

      if (error) {
        console.error('Error rejecting vendor:', error)
        alert(`Error rejecting vendor: ${error.message}`)
        return
      }

      console.log('Vendor rejected successfully')
      alert('Vendor rejected successfully!')
      
      // Refresh data
      fetchDashboardData()
    } catch (error) {
      console.error('Error rejecting vendor:', error)
      alert(`Failed to reject vendor: ${error}`)
    }
  }

  const getVendorStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Real-time overview of vendors and marketplace activity</p>
            <div className="flex items-center mt-1 text-sm text-green-600">
              <Activity className="h-3 w-3 mr-1" />
              <span>Live data • Updates every 30 seconds</span>
            </div>
          </div>
          <Button onClick={fetchDashboardData} disabled={loading}>
            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Vendors
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalVendors}</div>
              <p className="text-xs text-green-600 mt-1">
                +{stats.newVendorsToday} new today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Products
              </CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.activeProducts}</div>
              <p className="text-xs text-green-600 mt-1">
                +{stats.newProductsToday} new today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.pendingOrders}</div>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `$${stats.totalRevenue.toFixed(2)}`}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unread Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.unreadMessages}</div>
              <p className="text-xs text-red-500 mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Complete Database State */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Platform State</CardTitle>
            <CardDescription>Current state of all data in your multivendor platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Vendors</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalVendors}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  {stats.newVendorsToday > 0 ? `+${stats.newVendorsToday} today` : 'No new vendors today'}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Products</p>
                    <p className="text-2xl font-bold text-green-900">{stats.activeProducts}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-2">
                  {stats.newProductsToday > 0 ? `+${stats.newProductsToday} today` : 'No new products today'}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Orders</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.pendingOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  All orders in system
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Total Messages</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.unreadMessages}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  All messages in system
                </p>
              </div>
            </div>

            {/* Detailed breakdown */}
            {!loading && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Current Platform Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">
                      <strong>Vendors:</strong> {stats.totalVendors} registered
                      {stats.totalVendors > 0 && (
                        <span className="text-blue-600"> (showing recent activity below)</span>
                      )}
                    </p>
                    <p className="text-gray-600">
                      <strong>Products:</strong> {stats.activeProducts} created
                      {stats.activeProducts === 0 && (
                        <span className="text-red-500"> (no products yet)</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <strong>Orders:</strong> {stats.pendingOrders} total
                      {stats.pendingOrders === 0 && (
                        <span className="text-gray-500"> (no orders yet)</span>
                      )}
                    </p>
                    <p className="text-gray-600">
                      <strong>Messages:</strong> {stats.unreadMessages} total
                      {stats.unreadMessages === 0 && (
                        <span className="text-gray-500"> (no messages yet)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Vendor Applications</CardTitle>
              <CardDescription>New vendors registered on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Activity className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading vendors...</span>
                </div>
              ) : recentVendors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No vendor applications yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    New vendor applications will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {vendor.business_name || 'Business Name Pending'}
                        </p>
                        <p className="text-xs text-gray-500">{vendor.full_name}</p>
                        <p className="text-xs text-gray-400">
                          Registered {new Date(vendor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVendorStatusBadge(vendor.status)}
                        {vendor.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveVendor(vendor.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleRejectVendor(vendor.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {vendor.status === 'rejected' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveVendor(vendor.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest vendor communications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Activity className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading messages...</span>
                </div>
              ) : recentMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Vendor messages will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {message.subject || 'No Subject'}
                        </p>
                        <p className="text-xs text-gray-500">
                          From: {message.vendor?.business_name || message.vendor?.full_name || 'Unknown Vendor'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {message.status === 'unread' ? (
                          <Badge className="bg-red-100 text-red-800">Unread</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Read</Badge>
                        )}
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = `/admin/messages/${message.id}`}
                          className="text-xs"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>Manage vendor accounts and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/vendors'}>
                  View All Vendors
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/vendors?filter=pending'}
                >
                  Pending Approvals ({recentVendors.filter(v => v.status === 'pending').length})
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Monitor and manage products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/products'}>
                  View All Products
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/products?status=pending'}
                >
                  Review Listings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>View detailed reports and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/analytics'}>
                  View Analytics
                </Button>
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/admin/orders'}>
                  Manage Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

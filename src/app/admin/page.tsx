'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Database } from '@/lib/supabase'

type AdminStats = Database['public']['Views']['admin_dashboard_stats']['Row']
type Vendor = Database['public']['Tables']['vendors']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Order = Database['public']['Tables']['orders']['Row']

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentVendors, setRecentVendors] = useState<Vendor[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData()
    }
  }, [user, profile])

  const fetchDashboardData = async () => {
    try {
      // Fetch admin stats
      const { data: statsData } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single()

      if (statsData) {
        setStats(statsData)
      }

      // Fetch recent vendors
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (vendorsData) {
        setRecentVendors(vendorsData)
      }

      // Fetch recent products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (productsData) {
        setRecentProducts(productsData)
      }

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (ordersData) {
        setRecentOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVendorStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Platform overview and management
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/vendors">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Users className="mr-2 h-4 w-4" />
              Manage Vendors
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Review Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_vendors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.approved_vendors || 0} approved, {stats?.pending_vendors || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.approved_products || 0} approved, {stats?.total_products - (stats?.approved_products || 0)} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_orders || 0} pending, {stats?.total_orders - (stats?.pending_orders || 0)} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((stats?.total_revenue || 0) * 0.15)}
            </div>
            <p className="text-xs text-muted-foreground">
              15% platform fee from {formatCurrency(stats?.total_revenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vendors */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Clock className="mr-2 h-5 w-5" />
              Pending Vendor Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVendors
                .filter(v => v.status === 'pending')
                .slice(0, 3)
                .map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">{vendor.shop_name}</p>
                      <p className="text-xs text-yellow-600">{vendor.full_name}</p>
                    </div>
                    <Link href={`/admin/vendors/${vendor.id}`}>
                      <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
              {recentVendors.filter(v => v.status === 'pending').length === 0 && (
                <p className="text-sm text-yellow-600 text-center py-2">
                  No pending vendor approvals
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/admin/vendors">
                <Button variant="outline" className="w-full border-yellow-300 text-yellow-700">
                  View All Vendors
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Products */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Package className="mr-2 h-5 w-5" />
              Pending Product Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProducts
                .filter(p => p.status === 'pending')
                .slice(0, 3)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">{product.name}</p>
                      <p className="text-xs text-blue-600">{formatCurrency(product.price)}</p>
                    </div>
                    <Link href={`/admin/products/${product.id}`}>
                      <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
              {recentProducts.filter(p => p.status === 'pending').length === 0 && (
                <p className="text-sm text-blue-600 text-center py-2">
                  No pending product approvals
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/admin/products">
                <Button variant="outline" className="w-full border-blue-300 text-blue-700">
                  View All Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vendors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Vendor Activity</CardTitle>
            <CardDescription>
              Latest vendor registrations and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{vendor.shop_name}</p>
                      <p className="text-xs text-gray-500">
                        {vendor.full_name} • {formatDate(vendor.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getVendorStatusColor(vendor.status)}>
                    {vendor.status}
                  </Badge>
                </div>
              ))}
              {recentVendors.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No vendor activity yet
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/admin/vendors">
                <Button variant="outline" className="w-full">
                  View All Vendors
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest customer orders across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {order.customer_name} • {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No orders yet
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/vendors">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Manage Vendors
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Review Products
              </Button>
            </Link>
            <Link href="/admin/payouts">
              <Button variant="outline" className="w-full h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Process Payouts
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Send Announcements
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

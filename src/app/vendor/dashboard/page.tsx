'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Database } from '@/lib/supabase'

type VendorStats = Database['public']['Views']['vendor_dashboard_stats']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Order = Database['public']['Tables']['orders']['Row']

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user, vendor } = useAuth()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (user && vendor) {
      fetchDashboardData()
    }
  }, [user, vendor])

  const fetchDashboardData = async () => {
    try {
      // Fetch vendor stats
      const { data: statsData } = await supabase
        .from('vendor_dashboard_stats')
        .select('*')
        .eq('vendor_id', vendor?.id)
        .single()

      if (statsData) {
        setStats(statsData)
      }

      // Fetch recent products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendor?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (productsData) {
        setRecentProducts(productsData)
      }

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendor?.id)
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

  const getStatusColor = (status: string) => {
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {vendor?.full_name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your shop today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/vendor/products/new">
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Link href="/vendor/orders">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.approved_products || 0} approved, {stats?.pending_products || 0} pending
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
              {stats?.pending_orders || 0} pending, {stats?.processing_orders || 0} processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats?.total_orders || 0} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payout Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((stats?.total_revenue || 0) * 0.85)}
            </div>
            <p className="text-xs text-muted-foreground">
              85% of revenue (15% platform fee)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {recentProducts.some(p => p.stock_quantity <= p.min_stock_level) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProducts
                .filter(p => p.stock_quantity <= p.min_stock_level)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <span className="text-sm text-yellow-700">{product.name}</span>
                    <Badge variant="secondary" className="text-yellow-800">
                      {product.stock_quantity} left
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>
              Your latest product additions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>
              ))}
              {recentProducts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No products yet. Add your first product to get started!
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/vendor/products">
                <Button variant="outline" className="w-full">
                  View All Products
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
              Latest customer orders and their status
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
                  No orders yet. Your orders will appear here!
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/vendor/orders">
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
            Common tasks to help you manage your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/vendor/products/new">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/vendor/payouts/new">
              <Button variant="outline" className="w-full h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                Request Payout
              </Button>
            </Link>
            <Link href="/vendor/messages">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Contact Admin
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

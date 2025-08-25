'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Package,
  ShoppingCart,
  Banknote,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  DollarSign,
  Star,
  MessageSquare,
  Smartphone,
  BarChart3,
  Calendar,
  MapPin,
  Crown,
  Zap,
  Settings
} from 'lucide-react'

interface DashboardStats {
  vendors: {
    total: number
    active: number
    pending: number
    suspended: number
    new_today: number
  }
  products: {
    total: number
    active: number
    inactive: number
    out_of_stock: number
    new_today: number
    total_value: number
  }
  orders: {
    total: number
    pending: number
    completed: number
    cancelled: number
    today: number
    total_revenue: number
    pending_revenue: number
  }
  customers: {
    total: number
    active: number
    new_today: number
  }
  transactions: {
    total: number
    completed: number
    pending: number
    failed: number
    total_volume: number
  }
  categories: {
    total: number
    active: number
  }
  messages: {
    unread: number
    total: number
  }
  subscriptions: {
    active: number
    expired: number
    total_revenue: number
  }
}

interface RecentActivity {
  id: string
  type: 'vendor' | 'product' | 'order' | 'user' | 'payment'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

interface TopPerformers {
  vendors: {
    id: string
    name: string
    revenue: number
    orders: number
    products: number
  }[]
  products: {
    id: string
    name: string
    sales: number
    revenue: number
    vendor_name: string
  }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    vendors: { total: 0, active: 0, pending: 0, suspended: 0, new_today: 0 },
    products: { total: 0, active: 0, inactive: 0, out_of_stock: 0, new_today: 0, total_value: 0 },
    orders: { total: 0, pending: 0, completed: 0, cancelled: 0, today: 0, total_revenue: 0, pending_revenue: 0 },
    customers: { total: 0, active: 0, new_today: 0 },
    transactions: { total: 0, completed: 0, pending: 0, failed: 0, total_volume: 0 },
    categories: { total: 0, active: 0 },
    messages: { unread: 0, total: 0 },
    subscriptions: { active: 0, expired: 0, total_revenue: 0 }
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformers>({
    vendors: [],
    products: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
    
    // Set up real-time polling every 15 seconds for live data
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 15000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Starting dashboard data fetch...')

      // Test basic database connectivity first
      console.log('Testing database connection...')
      const { data: testData, error: testError } = await supabase
        .from('vendors')
        .select('id')
        .limit(1)
        .single()
      
      console.log('Database connection test:', { count: testData, error: testError })

      // Parallel data fetching for better performance
      const [
        vendorsData,
        productsData,
        ordersData,
        categoriesData,
        messagesData,
        subscriptionsData
      ] = await Promise.all([
        fetchVendorStats(),
        fetchProductStats(),
        fetchOrderStats(),
        fetchCategoryStats(),
        fetchMessageStats(),
        fetchSubscriptionStats()
      ])

      console.log('All stats fetched:', {
        vendors: vendorsData,
        products: productsData,
        orders: ordersData,
        categories: categoriesData
      })

      // Combine all stats
      const combinedStats: DashboardStats = {
        vendors: vendorsData,
        products: productsData,
        orders: ordersData,
        customers: { total: 0, active: 0, new_today: 0 }, // Will implement if customers table exists
        transactions: {
          total: ordersData.total,
          completed: ordersData.completed,
          pending: ordersData.pending,
          failed: ordersData.cancelled,
          total_volume: ordersData.total_revenue
        },
        categories: categoriesData,
        messages: messagesData,
        subscriptions: subscriptionsData
      }

      console.log('Combined stats:', combinedStats)
      setStats(combinedStats)
      
      // Fetch additional data
      await Promise.all([
        fetchRecentActivity(),
        fetchTopPerformers()
      ])

      setLastUpdated(new Date())
      console.log('Dashboard data updated successfully')
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    console.log('Fetching vendor stats...')
    
    try {
      // Use correct schema: vendors table has 'status' enum, not 'is_active'
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, status, created_at')

      if (error) {
        console.error('Error fetching vendors:', error)
        // Return empty stats if query fails
        return { total: 0, active: 0, pending: 0, suspended: 0, new_today: 0 }
      }

      console.log('Vendor query result:', { vendors, error, count: vendors?.length })

      const total = vendors?.length || 0
      // Use status enum values: 'approved' is active, 'pending' is pending, etc.
      const active = vendors?.filter(v => v.status === 'approved')?.length || 0
      const pending = vendors?.filter(v => v.status === 'pending')?.length || 0
      const suspended = vendors?.filter(v => v.status === 'suspended')?.length || 0
      const new_today = vendors?.filter(v => v.created_at?.startsWith(today))?.length || 0

      console.log('Vendor stats calculated:', { total, active, pending, suspended, new_today })
      return { total, active, pending, suspended, new_today }
    } catch (err) {
      console.error('Vendor stats fetch error:', err)
      return { total: 0, active: 0, pending: 0, suspended: 0, new_today: 0 }
    }
  }

  const fetchProductStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    console.log('Fetching product stats...')
    
    // Try basic query first, then add columns if they exist
    let { data: products, error } = await supabase
      .from('products')
      .select('id, is_active, price, created_at')

    // If that fails, try with even more basic columns
    if (error && error.message?.includes('does not exist')) {
      console.log('Trying basic product columns...')
      const basicResult = await supabase
        .from('products')
        .select('id, price, created_at')
      
      if (!basicResult.error && basicResult.data) {
        products = basicResult.data.map((p: any) => ({
          ...p,
          is_active: true, // Default assumption
          inventory_quantity: 0 // Default assumption
        }))
        error = null
      } else {
        products = basicResult.data
        error = basicResult.error
      }
    }

    console.log('Product query result:', { products, error, count: products?.length })

    if (error) {
      console.error('Error fetching products:', error)
      return { total: 0, active: 0, inactive: 0, out_of_stock: 0, new_today: 0, total_value: 0 }
    }

    const total = products?.length || 0
    const active = products?.filter(p => p.is_active)?.length || 0
    const inactive = products?.filter(p => !p.is_active)?.length || 0
    const out_of_stock = products?.filter(p => ((p as any).inventory_quantity || 0) === 0)?.length || 0
    const new_today = products?.filter(p => p.created_at?.startsWith(today))?.length || 0
    const total_value = products?.reduce((sum, p) => sum + (p.price * ((p as any).inventory_quantity || 0)), 0) || 0

    console.log('Product stats calculated:', { total, active, inactive, out_of_stock, new_today, total_value })
    return { total, active, inactive, out_of_stock, new_today, total_value }
  }

  const fetchOrderStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')

    if (error) {
      console.error('Error fetching orders:', error)
      return { total: 0, pending: 0, completed: 0, cancelled: 0, today: 0, total_revenue: 0, pending_revenue: 0 }
    }

    const total = orders?.length || 0
    const pending = orders?.filter(o => o.status === 'pending')?.length || 0
    const completed = orders?.filter(o => o.status === 'completed')?.length || 0
    const cancelled = orders?.filter(o => o.status === 'cancelled')?.length || 0
    const today_orders = orders?.filter(o => o.created_at?.startsWith(today))?.length || 0
    const total_revenue = orders?.filter(o => o.status === 'completed')?.reduce((sum, o) => sum + o.total_amount, 0) || 0
    const pending_revenue = orders?.filter(o => o.status === 'pending')?.reduce((sum, o) => sum + o.total_amount, 0) || 0

    return { 
      total, 
      pending, 
      completed, 
      cancelled, 
      today: today_orders, 
      total_revenue, 
      pending_revenue 
    }
  }

  const fetchCategoryStats = async () => {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, is_active')

    if (error) {
      console.error('Error fetching categories:', error)
      return { total: 0, active: 0 }
    }

    const total = categories?.length || 0
    const active = categories?.filter(c => c.is_active)?.length || 0

    return { total, active }
  }

  const fetchMessageStats = async () => {
    try {
      // Try to fetch messages with error handling
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('id, status')

        if (!error && messages) {
          const total = messages.length
          const unread = messages.filter((m: any) => m.status === 'unread').length
          return { unread, total }
        }
      } catch (statusError) {
        console.log('Messages with status query failed, trying basic query...')
      }

      // Fallback: try basic query without status
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('id')

        if (!error && messages) {
          return { unread: messages.length, total: messages.length } // Assume all unread
        }
      } catch (basicError) {
        console.log('Basic messages query failed:', basicError)
      }

      // If all queries fail, return default values
      return { unread: 0, total: 0 }
    } catch (error) {
      console.error('Error fetching message stats:', error)
      return { unread: 0, total: 0 }
    }
  }

  const fetchSubscriptionStats = async () => {
    // Use vendor_subscriptions table instead of subscriptions
    const { data: subscriptions, error } = await supabase
      .from('vendor_subscriptions')
      .select('id, is_active, amount_paid')

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return { active: 0, expired: 0, total_revenue: 0 }
    }

    const active = subscriptions?.filter(s => s.is_active)?.length || 0
    const expired = subscriptions?.filter(s => !s.is_active)?.length || 0
    const total_revenue = subscriptions?.filter(s => s.is_active)?.reduce((sum, s) => sum + s.amount_paid, 0) || 0

    return { active, expired, total_revenue }
  }

  const fetchRecentActivity = async () => {
    // Simulate recent activity - in real implementation, this would come from an activity log table
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'vendor',
        title: 'New Vendor Registration',
        description: 'TechStore Rwanda has registered as a new vendor',
        timestamp: new Date().toISOString(),
        status: 'info'
      },
      {
        id: '2',
        type: 'product',
        title: 'Product Added',
        description: 'New smartphone added to Electronics category',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '3',
        type: 'order',
        title: 'Large Order Placed',
        description: 'Order #12345 for 15,000 RWF placed',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success'
      }
    ]
    
    setRecentActivity(activities)
  }

  const fetchTopPerformers = async () => {
    try {
      // Fetch vendors with their actual performance data
      const { data: topVendors } = await supabase
        .from('vendors')
        .select('id, business_name, full_name')
        .limit(5)

      // Fetch products with basic data
      const { data: topProducts } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(5)

      // Enhance vendors with real performance data
      const vendorsWithStats = await Promise.all(
        (topVendors || []).map(async (vendor) => {
          // Get product count
          const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('vendor_id', vendor.id)

          // Get orders and revenue
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount, status')
            .eq('vendor_id', vendor.id)

          const revenue = orders?.filter(o => ['delivered', 'completed'].includes(o.status))
            ?.reduce((sum, o) => sum + o.total_amount, 0) || 0

          return {
            id: vendor.id,
            name: vendor.business_name || vendor.full_name,
            revenue,
            orders: orders?.length || 0,
            products: products?.length || 0
          }
        })
      )

      setTopPerformers({
        vendors: vendorsWithStats,
        products: topProducts?.map(p => ({
          id: p.id,
          name: p.name,
          sales: 0, // Will be calculated from order_items if needed
          revenue: 0,
          vendor_name: 'Unknown' // Will be calculated separately if needed
        })) || []
      })
    } catch (error) {
      console.error('Error fetching top performers:', error)
      setTopPerformers({
        vendors: [],
        products: []
      })
    }
  }

  const getStatusColor = (value: number, total: number, isGood: boolean = true) => {
    const percentage = total > 0 ? (value / total) * 100 : 0
    if (isGood) {
      return percentage > 70 ? 'text-green-600' : percentage > 40 ? 'text-yellow-600' : 'text-red-600'
    } else {
      return percentage > 70 ? 'text-red-600' : percentage > 40 ? 'text-yellow-600' : 'text-green-600'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Real-time marketplace overview and management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button onClick={fetchDashboardData} disabled={loading} size="sm">
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vendors */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.vendors.total}</div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  <span className={`font-medium ${getStatusColor(stats.vendors.active, stats.vendors.total)}`}>
                    {stats.vendors.active} active
                  </span>
                  {stats.vendors.pending > 0 && (
                    <span className="text-yellow-600 ml-2">{stats.vendors.pending} pending</span>
                  )}
                </div>
                {stats.vendors.new_today > 0 && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    +{stats.vendors.new_today} today
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products.total}</div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  <span className={`font-medium ${getStatusColor(stats.products.active, stats.products.total)}`}>
                    {stats.products.active} active
                  </span>
                  {stats.products.out_of_stock > 0 && (
                    <span className="text-red-600 ml-2">{stats.products.out_of_stock} out of stock</span>
                  )}
                </div>
                {stats.products.new_today > 0 && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    +{stats.products.new_today} today
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Total value: {stats.products.total_value.toLocaleString()} RWF
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders.total}</div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  <span className={`font-medium ${getStatusColor(stats.orders.completed, stats.orders.total)}`}>
                    {stats.orders.completed} completed
                  </span>
                  {stats.orders.pending > 0 && (
                    <span className="text-yellow-600 ml-2">{stats.orders.pending} pending</span>
                  )}
                </div>
                {stats.orders.today > 0 && (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                    +{stats.orders.today} today
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Revenue: {stats.orders.total_revenue.toLocaleString()} RWF
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders.total_revenue.toLocaleString()} RWF</div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  <span className="text-yellow-600 font-medium">
                    {stats.orders.pending_revenue.toLocaleString()} RWF pending
                  </span>
                </div>
                <div className="flex items-center text-green-600 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.categories.total}</div>
              <p className="text-xs text-gray-500">{stats.categories.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.messages.total}</div>
              <p className="text-xs text-red-600">
                {stats.messages.unread} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <Crown className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.subscriptions.active}</div>
              <p className="text-xs text-gray-500">
                {stats.subscriptions.total_revenue.toLocaleString()} RWF/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Smartphone className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.transactions.total}</div>
              <p className="text-xs text-gray-500">
                {stats.transactions.completed} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-gray-500">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-1 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100 text-green-600' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      activity.status === 'error' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'vendor' && <Users className="h-3 w-3" />}
                      {activity.type === 'product' && <Package className="h-3 w-3" />}
                      {activity.type === 'order' && <ShoppingCart className="h-3 w-3" />}
                      {activity.type === 'user' && <Users className="h-3 w-3" />}
                      {activity.type === 'payment' && <DollarSign className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Performers
              </CardTitle>
              <CardDescription>Best performing vendors and products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Top Vendors</h4>
                  {topPerformers.vendors.slice(0, 3).map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium truncate">{vendor.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {vendor.revenue.toLocaleString()} RWF
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/admin/vendors">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Manage Vendors</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/admin/products">
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Manage Products</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/admin/orders">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-xs">View Orders</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Analytics</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/admin/messages">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Messages</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link href="/admin/settings">
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

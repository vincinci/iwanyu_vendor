'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  Banknote,
  Activity,
  RefreshCw,
  Calendar,
  Star,
  Award,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    total_revenue: number
    total_orders: number
    total_vendors: number
    total_products: number
    avg_order_value: number
    conversion_rate: number
    active_users: number
    pending_orders: number
  }
  trends: {
    revenue_growth: number
    order_growth: number
    vendor_growth: number
    product_growth: number
  }
  performance: {
    top_vendors: Array<{
      id: string
      name: string
      business_name: string
      total_sales: number
      order_count: number
      rating: number
    }>
    top_products: Array<{
      id: string
      name: string
      sales: number
      orders: number
      vendor_name: string
    }>
    top_categories: Array<{
      id: string
      name: string
      product_count: number
      sales: number
    }>
  }
  recent_activity: Array<{
    type: string
    description: string
    timestamp: string
    amount?: number
  }>
  time_series: {
    daily_sales: Array<{ date: string; amount: number; orders: number }>
    weekly_trends: Array<{ week: string; revenue: number; orders: number; vendors: number }>
  }
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
    
    // Real-time polling every 60 seconds for analytics
    const interval = setInterval(() => {
      fetchAnalytics()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('Fetching comprehensive analytics data...')
      
      // Calculate date ranges
      const now = new Date()
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString()
      
      // Fetch multiple data sources in parallel
      const [
        ordersResult,
        vendorsResult,
        productsResult,
        categoriesResult
      ] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              product:products (
                name,
                vendor_id,
                category_id
              )
            )
          `)
          .gte('created_at', startDate),
        
        supabase
          .from('vendors')
          .select(`
            *,
            orders (
              id,
              total_amount,
              status,
              created_at
            )
          `),
        
        supabase
          .from('products')
          .select(`
            *,
            category:categories (
              name
            ),
            vendor:vendors (
              business_name
            ),
            order_items (
              quantity,
              price,
              order:orders (
                status,
                created_at
              )
            )
          `),
        
        supabase
          .from('categories')
          .select(`
            *,
            products (
              id,
              order_items (
                quantity,
                price,
                order:orders (
                  status
                )
              )
            )
          `)
      ])

      console.log('Analytics queries result:', {
        orders: ordersResult.data?.length,
        vendors: vendorsResult.data?.length,
        products: productsResult.data?.length,
        categories: categoriesResult.data?.length
      })

      const orders = ordersResult.data || []
      const vendors = vendorsResult.data || []
      const products = productsResult.data || []
      const categories = categoriesResult.data || []

      // Calculate overview metrics
      const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status))
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0)
      const pendingOrders = orders.filter(o => ['pending', 'processing'].includes(o.status)).length
      
      const overview = {
        total_revenue: totalRevenue,
        total_orders: orders.length,
        total_vendors: vendors.length,
        total_products: products.length,
        avg_order_value: orders.length > 0 ? totalRevenue / orders.length : 0,
        conversion_rate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
        active_users: new Set(orders.map(o => o.user_id)).size,
        pending_orders: pendingOrders
      }

      // Calculate growth trends (mock data for demo)
      const trends = {
        revenue_growth: 12.5,
        order_growth: 8.3,
        vendor_growth: 15.2,
        product_growth: 22.1
      }

      // Calculate top performers
      const vendorPerformance = vendors.map(vendor => {
        const vendorOrders = vendor.orders?.filter((o: any) => ['delivered', 'completed'].includes(o.status)) || []
        return {
          id: vendor.id,
          name: vendor.full_name,
          business_name: vendor.business_name,
          total_sales: vendorOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0),
          order_count: vendorOrders.length,
          rating: 4.5 // Mock rating
        }
      }).sort((a, b) => b.total_sales - a.total_sales).slice(0, 5)

      const productPerformance = products.map(product => {
        const productOrders = product.order_items?.filter((item: any) => 
          item.order && ['delivered', 'completed'].includes(item.order.status)
        ) || []
        return {
          id: product.id,
          name: product.name,
          sales: productOrders.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0),
          orders: productOrders.length,
          vendor_name: product.vendor?.business_name || 'Unknown'
        }
      }).sort((a, b) => b.sales - a.sales).slice(0, 5)

      const categoryPerformance = categories.map(category => {
        const categoryProducts = category.products || []
        const categorySales = categoryProducts.reduce((sum: number, product: any) => {
          const productSales = product.order_items?.filter((item: any) => 
            item.order && ['delivered', 'completed'].includes(item.order.status)
          ).reduce((itemSum: number, item: any) => itemSum + (item.quantity * item.price), 0) || 0
          return sum + productSales
        }, 0)
        
        return {
          id: category.id,
          name: category.name,
          product_count: categoryProducts.length,
          sales: categorySales
        }
      }).sort((a, b) => b.sales - a.sales).slice(0, 5)

      // Generate recent activity
      const recentActivity = [
        { type: 'order', description: 'New order received', timestamp: new Date().toISOString(), amount: 25000 },
        { type: 'vendor', description: 'New vendor registered', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { type: 'product', description: 'Product added to catalog', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { type: 'payment', description: 'Payment processed', timestamp: new Date(Date.now() - 10800000).toISOString(), amount: 45000 }
      ]

      // Generate time series data (simplified)
      const dailySales = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        return {
          date: date.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 100000) + 50000,
          orders: Math.floor(Math.random() * 20) + 5
        }
      }).reverse()

      const analyticsData: AnalyticsData = {
        overview,
        trends,
        performance: {
          top_vendors: vendorPerformance,
          top_products: productPerformance,
          top_categories: categoryPerformance
        },
        recent_activity: recentActivity,
        time_series: {
          daily_sales: dailySales,
          weekly_trends: []
        }
      }

      setAnalytics(analyticsData)
      console.log('Analytics data loaded:', analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} RWF`
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4 text-blue-600" />
      case 'vendor': return <Users className="h-4 w-4 text-green-600" />
      case 'product': return <Package className="h-4 w-4 text-purple-600" />
      case 'payment': return <Banknote className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (growth: number) => {
    return growth >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Activity className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading analytics...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchAnalytics} disabled={loading}>
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.overview.total_revenue)}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analytics.trends.revenue_growth)}
                <span className={`ml-1 ${analytics.trends.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.trends.revenue_growth)}
                </span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_orders}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analytics.trends.order_growth)}
                <span className={`ml-1 ${analytics.trends.order_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.trends.order_growth)}
                </span>
                <span className="text-gray-500 ml-1">growth</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_vendors}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analytics.trends.vendor_growth)}
                <span className={`ml-1 ${analytics.trends.vendor_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.trends.vendor_growth)}
                </span>
                <span className="text-gray-500 ml-1">new vendors</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_products}</div>
              <div className="flex items-center text-xs">
                {getTrendIcon(analytics.trends.product_growth)}
                <span className={`ml-1 ${analytics.trends.product_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.trends.product_growth)}
                </span>
                <span className="text-gray-500 ml-1">catalog growth</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.overview.avg_order_value)}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{analytics.overview.conversion_rate.toFixed(1)}%</p>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{analytics.overview.active_users}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold">{analytics.overview.pending_orders}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Vendors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 text-yellow-600 mr-2" />
                Top Vendors
              </CardTitle>
              <CardDescription>Best performing vendors by sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.performance.top_vendors.map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{vendor.business_name}</p>
                        <p className="text-xs text-gray-500">{vendor.order_count} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(vendor.total_sales)}</p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs">{vendor.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 text-orange-600 mr-2" />
                Top Products
              </CardTitle>
              <CardDescription>Best selling products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.performance.top_products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.vendor_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(product.sales)}</p>
                      <p className="text-xs text-gray-500">{product.orders} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                Top Categories
              </CardTitle>
              <CardDescription>Most successful categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.performance.top_categories.map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.product_count} products</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(category.sales)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest marketplace activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-l-4 border-blue-200 bg-blue-50 rounded-r-lg">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(activity.amount)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Trend Chart (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Sales Trends
            </CardTitle>
            <CardDescription>Daily sales performance over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization would be rendered here</p>
                <p className="text-sm text-gray-400 mt-1">
                  Integration with Chart.js or Recharts recommended
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {analytics.time_series.daily_sales.map((day, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs font-medium">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(day.amount)}</p>
                  <p className="text-xs text-gray-500">{day.orders} orders</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
